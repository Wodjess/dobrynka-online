import math
import os
import random
from dataclasses import asdict
from typing import Dict, List, Optional, Tuple

import torch
import torch.distributed as dist
import torch.nn as nn
import torch.nn.functional as F
from torch.utils.data import DataLoader

from config.model_config import (
    CONTEXT_END_TOKEN,
    CONTEXT_START_TOKEN,
    RESPONSE_END_TOKEN,
    RESPONSE_START_TOKEN,
    DataConfig,
    ModelConfig,
    TrainConfig,
)
from data.dataset import encode_tokens, split_text_into_tokens
from model.transformer import TransformerBlock


class GPTModel(nn.Module):
    def __init__(self, cfg: ModelConfig, vocab_size: int):
        super().__init__()
        self.cfg = cfg
        self.vocab_size = vocab_size

        self.token_embedding = nn.Embedding(vocab_size, cfg.n_embd)
        self.position_embedding = nn.Embedding(cfg.block_size, cfg.n_embd)
        self.dropout = nn.Dropout(cfg.dropout)
        self.blocks = nn.ModuleList([TransformerBlock(cfg) for _ in range(cfg.n_layer)])
        self.final_norm = nn.LayerNorm(cfg.n_embd)
        self.lm_head = nn.Linear(cfg.n_embd, vocab_size, bias=False)

        if cfg.tie_embeddings:
            self.lm_head.weight = self.token_embedding.weight

        self.apply(self._init_weights)

    @staticmethod
    def _init_weights(module: nn.Module) -> None:
        if isinstance(module, nn.Linear):
            nn.init.normal_(module.weight, mean=0.0, std=0.02)
            if module.bias is not None:
                nn.init.zeros_(module.bias)
        elif isinstance(module, nn.Embedding):
            nn.init.normal_(module.weight, mean=0.0, std=0.02)

    def forward(
        self,
        input_ids: torch.Tensor,
        labels: Optional[torch.Tensor] = None,
    ) -> Tuple[torch.Tensor, Optional[torch.Tensor]]:
        batch_size, seq_len = input_ids.shape
        if seq_len > self.cfg.block_size:
            raise ValueError(
                f"Input sequence length {seq_len} exceeds block size {self.cfg.block_size}."
            )

        positions = torch.arange(0, seq_len, device=input_ids.device)

        x = self.token_embedding(input_ids) + self.position_embedding(positions)[None, :, :]
        x = self.dropout(x)

        for block in self.blocks:
            x = block(x)

        x = self.final_norm(x)
        logits = self.lm_head(x)

        loss = None
        if labels is not None:
            loss = F.cross_entropy(
                logits.view(-1, logits.size(-1)),
                labels.view(-1),
                ignore_index=-100,
            )

        return logits, loss


class CosineWarmupScheduler:
    def __init__(self, optimizer: torch.optim.Optimizer, cfg: TrainConfig):
        self.optimizer = optimizer
        self.cfg = cfg

    def step(self, current_step: int) -> float:
        if current_step < self.cfg.warmup_steps:
            lr = self.cfg.learning_rate * (current_step + 1) / max(1, self.cfg.warmup_steps)
        else:
            progress = (current_step - self.cfg.warmup_steps) / max(
                1, self.cfg.max_steps - self.cfg.warmup_steps
            )
            cosine = 0.5 * (1.0 + math.cos(math.pi * progress))
            lr = self.cfg.min_lr + cosine * (self.cfg.learning_rate - self.cfg.min_lr)

        for param_group in self.optimizer.param_groups:
            param_group["lr"] = lr
        return lr


def count_parameters(model: nn.Module) -> int:
    return sum(parameter.numel() for parameter in model.parameters())


def distributed_setup() -> Tuple[bool, int, int, int, torch.device]:
    rank = int(os.environ.get("RANK", "0"))
    local_rank = int(os.environ.get("LOCAL_RANK", "0"))
    world_size = int(os.environ.get("WORLD_SIZE", "1"))
    is_distributed = world_size > 1

    if is_distributed:
        if not torch.cuda.is_available():
            raise RuntimeError("DDP was requested but CUDA is not available.")
        torch.cuda.set_device(local_rank)
        dist.init_process_group(backend="nccl")
        device = torch.device("cuda", local_rank)
    else:
        if torch.cuda.is_available():
            device = torch.device("cuda")
        else:
            device = torch.device("cpu")

    return is_distributed, rank, local_rank, world_size, device


def distributed_cleanup(is_distributed: bool) -> None:
    if is_distributed and dist.is_initialized():
        dist.destroy_process_group()


def set_seed(seed: int) -> None:
    random.seed(seed)
    torch.manual_seed(seed)
    torch.cuda.manual_seed_all(seed)


def evaluate(
    model: GPTModel,
    data_loader: DataLoader,
    device: torch.device,
    eval_batches: int,
    use_autocast: bool,
    amp_dtype: torch.dtype,
) -> float:
    model.eval()
    losses = []

    with torch.no_grad():
        for batch_index, (input_ids, labels) in enumerate(data_loader):
            if batch_index >= eval_batches:
                break

            input_ids = input_ids.to(device, non_blocking=True)
            labels = labels.to(device, non_blocking=True)

            with torch.autocast(device_type=device.type, dtype=amp_dtype, enabled=use_autocast):
                _, loss = model(input_ids, labels)

            if loss is not None:
                losses.append(loss.item())

    model.train()
    if not losses:
        return float("nan")
    return sum(losses) / len(losses)


def save_checkpoint(
    path: str,
    model: nn.Module,
    optimizer: torch.optim.Optimizer,
    step: int,
    token_to_id: Dict[str, int],
    id_to_token: List[str],
    data_cfg: DataConfig,
    model_cfg: ModelConfig,
    train_cfg: TrainConfig,
) -> None:
    os.makedirs(os.path.dirname(path), exist_ok=True)
    raw_model = model.module if isinstance(model, nn.parallel.DistributedDataParallel) else model

    checkpoint = {
        "model_state_dict": raw_model.state_dict(),
        "optimizer_state_dict": optimizer.state_dict(),
        "step": step,
        "token_to_id": token_to_id,
        "id_to_token": id_to_token,
        "data_config": asdict(data_cfg),
        "model_config": asdict(model_cfg),
        "train_config": asdict(train_cfg),
    }
    torch.save(checkpoint, path)


@torch.no_grad()
def generate_response(
    model: GPTModel,
    context_text: str,
    token_to_id: Dict[str, int],
    id_to_token: List[str],
    special_ids: "SpecialTokenIds",
    max_new_tokens: int = 200,
    temperature: float = 0.8,
    top_k: int = 40,
    greedy: bool = False,
) -> str:
    from config.model_config import SpecialTokenIds  # noqa: F811

    model.eval()
    device = next(model.parameters()).device

    context_tokens = split_text_into_tokens(context_text)
    prompt_tokens = [
        CONTEXT_START_TOKEN,
        *context_tokens,
        CONTEXT_END_TOKEN,
        RESPONSE_START_TOKEN,
    ]
    prompt_ids = encode_tokens(prompt_tokens, token_to_id, special_ids.unk_id)

    input_ids = torch.tensor(prompt_ids, dtype=torch.long, device=device)[None, :]

    for _ in range(max_new_tokens):
        if input_ids.size(1) > model.cfg.block_size:
            input_cond = input_ids[:, -model.cfg.block_size :]
        else:
            input_cond = input_ids

        logits, _ = model(input_cond)
        next_logits = logits[:, -1, :]

        if greedy:
            next_id = torch.argmax(next_logits, dim=-1, keepdim=True)
        else:
            next_logits = next_logits / max(temperature, 1e-5)

            if top_k > 0:
                top_values, _ = torch.topk(next_logits, k=min(top_k, next_logits.size(-1)))
                cutoff = top_values[:, -1].unsqueeze(-1)
                next_logits = torch.where(
                    next_logits < cutoff,
                    torch.full_like(next_logits, float("-inf")),
                    next_logits,
                )

            probs = F.softmax(next_logits, dim=-1)
            next_id = torch.multinomial(probs, num_samples=1)

        if next_id.item() == special_ids.response_end_id:
            break

        input_ids = torch.cat([input_ids, next_id], dim=1)

    generated_ids = input_ids[0, len(prompt_ids) :].tolist()
    generated_tokens = [id_to_token[token_id] for token_id in generated_ids if token_id < len(id_to_token)]
    return "".join(generated_tokens).strip()
