import argparse
import json
import os
from dataclasses import asdict
from typing import Dict, List

import torch
import torch.nn as nn
from torch.utils.data import DataLoader
from torch.utils.data.distributed import DistributedSampler

from config.model_config import DataConfig, ModelConfig, TrainConfig
from data.dataset import (
    MessageDataset,
    build_vocabulary,
    collate_batch,
    load_samples,
)
from model.gpt import (
    CosineWarmupScheduler,
    GPTModel,
    count_parameters,
    distributed_cleanup,
    distributed_setup,
    evaluate,
    generate_response,
    save_checkpoint,
    set_seed,
)


def train(args: argparse.Namespace) -> None:
    data_cfg = DataConfig(
        messages_path=args.messages,
        max_context_characters=args.max_context_chars,
        max_response_characters=args.max_response_chars,
        max_sequence_tokens=args.max_sequence_tokens,
        max_samples=args.max_samples,
        max_vocab_size=args.max_vocab_size,
        history_turns=args.history_turns,
        history_separator=args.history_separator,
        user_role_prefix=args.user_role_prefix,
        bot_role_prefix=args.bot_role_prefix,
        use_global_history_fallback=args.use_global_history_fallback,
    )
    model_cfg = ModelConfig(
        n_layer=args.n_layer,
        n_head=args.n_head,
        n_embd=args.n_embd,
        block_size=args.block_size,
        dropout=args.dropout,
        tie_embeddings=not args.no_tie_embeddings,
    )
    train_cfg = TrainConfig(
        seed=args.seed,
        max_steps=args.max_steps,
        batch_size=args.batch_size,
        grad_accum_steps=args.grad_accum_steps,
        learning_rate=args.learning_rate,
        weight_decay=args.weight_decay,
        beta1=args.beta1,
        beta2=args.beta2,
        warmup_steps=args.warmup_steps,
        min_lr=args.min_lr,
        grad_clip=args.grad_clip,
        log_interval=args.log_interval,
        eval_interval=args.eval_interval,
        eval_batches=args.eval_batches,
        num_workers=args.num_workers,
        out_dir=args.out_dir,
        compile_model=args.compile_model,
    )

    is_distributed, rank, _local_rank, world_size, device = distributed_setup()
    is_main_process = rank == 0

    try:
        set_seed(train_cfg.seed + rank)

        samples = load_samples(data_cfg)
        token_to_id, id_to_token, special_ids = build_vocabulary(
            samples,
            max_vocab_size=data_cfg.max_vocab_size,
        )

        dataset = MessageDataset(
            samples,
            token_to_id=token_to_id,
            special_ids=special_ids,
            block_size=model_cfg.block_size,
        )

        split_index = int(0.98 * len(dataset))
        if split_index <= 0:
            split_index = len(dataset)
        if split_index >= len(dataset):
            split_index = len(dataset) - 1 if len(dataset) > 1 else len(dataset)
        train_indices = list(range(0, split_index))
        eval_indices = list(range(split_index, len(dataset)))
        train_subset = torch.utils.data.Subset(dataset, train_indices)
        eval_subset = torch.utils.data.Subset(dataset, eval_indices) if eval_indices else None

        if len(train_subset) < train_cfg.batch_size:
            raise RuntimeError(
                "Train split is smaller than batch_size. "
                "Lower --batch-size or provide more samples."
            )

        train_sampler = (
            DistributedSampler(train_subset, shuffle=True, drop_last=True)
            if is_distributed
            else None
        )

        train_loader = DataLoader(
            train_subset,
            batch_size=train_cfg.batch_size,
            shuffle=train_sampler is None,
            sampler=train_sampler,
            num_workers=train_cfg.num_workers,
            pin_memory=device.type == "cuda",
            drop_last=True,
            collate_fn=lambda batch: collate_batch(batch, special_ids.pad_id),
        )

        eval_loader = None
        if eval_subset is not None and len(eval_subset) > 0:
            eval_loader = DataLoader(
                eval_subset,
                batch_size=train_cfg.batch_size,
                shuffle=False,
                num_workers=max(1, train_cfg.num_workers // 2),
                pin_memory=device.type == "cuda",
                drop_last=False,
                collate_fn=lambda batch: collate_batch(batch, special_ids.pad_id),
            )

        model = GPTModel(model_cfg, vocab_size=len(id_to_token)).to(device)
        if train_cfg.compile_model:
            model = torch.compile(model)

        if is_distributed:
            model = nn.parallel.DistributedDataParallel(
                model,
                device_ids=[device.index],
                output_device=device.index,
                find_unused_parameters=False,
            )

        param_count = count_parameters(model)
        if is_main_process:
            print(f"Device: {device}")
            print(f"World size: {world_size}")
            print(f"Model parameters: {param_count:,}")
            print(
                "Target check (100M-ish): "
                f"{(param_count / 1_000_000):.2f}M parameters"
            )

        raw_model = model.module if isinstance(model, nn.parallel.DistributedDataParallel) else model

        optimizer_kwargs = dict(
            params=raw_model.parameters(),
            lr=train_cfg.learning_rate,
            betas=(train_cfg.beta1, train_cfg.beta2),
            weight_decay=train_cfg.weight_decay,
        )
        if device.type == "cuda":
            try:
                optimizer = torch.optim.AdamW(**optimizer_kwargs, fused=True)
            except TypeError:
                optimizer = torch.optim.AdamW(**optimizer_kwargs)
        else:
            optimizer = torch.optim.AdamW(**optimizer_kwargs)
        scheduler = CosineWarmupScheduler(optimizer, train_cfg)

        use_autocast = device.type == "cuda"
        amp_dtype = (
            torch.bfloat16
            if device.type == "cuda" and torch.cuda.is_bf16_supported()
            else torch.float16
        )

        if is_main_process:
            os.makedirs(train_cfg.out_dir, exist_ok=True)
            config_payload = {
                "data_config": asdict(data_cfg),
                "model_config": asdict(model_cfg),
                "train_config": asdict(train_cfg),
                "param_count": param_count,
                "vocab_size": len(id_to_token),
            }
            with open(
                os.path.join(train_cfg.out_dir, "run_config.json"),
                "w",
                encoding="utf-8",
            ) as config_file:
                json.dump(config_payload, config_file, ensure_ascii=False, indent=2)

        train_iterator = iter(train_loader)
        sampler_epoch = 0
        if is_distributed and train_sampler is not None:
            train_sampler.set_epoch(sampler_epoch)

        for step in range(train_cfg.max_steps):
            optimizer.zero_grad(set_to_none=True)
            accumulated_loss = 0.0

            for _ in range(train_cfg.grad_accum_steps):
                try:
                    input_ids, labels = next(train_iterator)
                except StopIteration:
                    sampler_epoch += 1
                    if is_distributed and train_sampler is not None:
                        train_sampler.set_epoch(sampler_epoch)
                    train_iterator = iter(train_loader)
                    input_ids, labels = next(train_iterator)

                input_ids = input_ids.to(device, non_blocking=True)
                labels = labels.to(device, non_blocking=True)

                with torch.autocast(
                    device_type=device.type,
                    dtype=amp_dtype,
                    enabled=use_autocast,
                ):
                    _, loss = model(input_ids, labels)
                    loss = loss / train_cfg.grad_accum_steps

                loss.backward()
                accumulated_loss += loss.item()

            if train_cfg.grad_clip > 0:
                torch.nn.utils.clip_grad_norm_(raw_model.parameters(), train_cfg.grad_clip)

            current_lr = scheduler.step(step)
            optimizer.step()

            if is_main_process and (step % train_cfg.log_interval == 0 or step == train_cfg.max_steps - 1):
                print(
                    f"step {step + 1:5d}/{train_cfg.max_steps} "
                    f"| train_loss {accumulated_loss:.4f} "
                    f"| lr {current_lr:.6e}"
                )

            if (
                is_main_process
                and eval_loader is not None
                and train_cfg.eval_interval > 0
                and (step + 1) % train_cfg.eval_interval == 0
            ):
                eval_loss = evaluate(
                    raw_model,
                    eval_loader,
                    device,
                    eval_batches=train_cfg.eval_batches,
                    use_autocast=use_autocast,
                    amp_dtype=amp_dtype,
                )
                print(f"eval @ step {step + 1}: loss {eval_loss:.4f}")

                checkpoint_path = os.path.join(
                    train_cfg.out_dir,
                    f"checkpoint_step_{step + 1}.pt",
                )
                save_checkpoint(
                    checkpoint_path,
                    model,
                    optimizer,
                    step + 1,
                    token_to_id,
                    id_to_token,
                    data_cfg,
                    model_cfg,
                    train_cfg,
                )

        if is_main_process:
            final_path = os.path.join(train_cfg.out_dir, "checkpoint_final.pt")
            save_checkpoint(
                final_path,
                model,
                optimizer,
                train_cfg.max_steps,
                token_to_id,
                id_to_token,
                data_cfg,
                model_cfg,
                train_cfg,
            )
            preview = generate_response(
                raw_model,
                "Give me a short plan for today's learning session.",
                token_to_id,
                id_to_token,
                special_ids,
                max_new_tokens=80,
            )
            print("Sample generation:")
            print(preview)
    finally:
        distributed_cleanup(is_distributed)
