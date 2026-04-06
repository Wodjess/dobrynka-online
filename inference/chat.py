import argparse
from typing import List, Tuple

import torch

from config.model_config import (
    CONTEXT_END_TOKEN,
    CONTEXT_START_TOKEN,
    PAD_TOKEN,
    RESPONSE_END_TOKEN,
    RESPONSE_START_TOKEN,
    UNKNOWN_TOKEN,
    DataConfig,
    ModelConfig,
    SpecialTokenIds,
)
from data.dataset import build_inference_context
from model.gpt import GPTModel, generate_response


def chat(args: argparse.Namespace) -> None:
    checkpoint = torch.load(args.checkpoint, map_location="cpu")

    model_cfg = ModelConfig(**checkpoint["model_config"])
    data_cfg_payload = checkpoint.get("data_config", {})
    data_cfg = DataConfig(**data_cfg_payload) if data_cfg_payload else DataConfig()
    id_to_token = checkpoint["id_to_token"]
    token_to_id = checkpoint["token_to_id"]

    special_ids = SpecialTokenIds(
        pad_id=token_to_id[PAD_TOKEN],
        unk_id=token_to_id[UNKNOWN_TOKEN],
        context_start_id=token_to_id[CONTEXT_START_TOKEN],
        context_end_id=token_to_id[CONTEXT_END_TOKEN],
        response_start_id=token_to_id[RESPONSE_START_TOKEN],
        response_end_id=token_to_id[RESPONSE_END_TOKEN],
    )

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    model = GPTModel(model_cfg, vocab_size=len(id_to_token)).to(device)
    model.load_state_dict(checkpoint["model_state_dict"])
    model.eval()

    mode_label = "greedy" if args.greedy else "sampling"
    print(f"Interactive chat mode ({mode_label}). Type 'exit' to quit.")
    conversation_pairs: List[Tuple[str, str]] = []

    while True:
        try:
            user_input = input("\n<context> ").strip()
        except EOFError:
            break

        if user_input.lower() in {"exit", "quit", "выход"}:
            break

        if not user_input:
            print("Context is empty.")
            continue

        model_context = build_inference_context(
            history_pairs=conversation_pairs,
            current_user_text=user_input,
            history_turns=data_cfg.history_turns,
            history_separator=data_cfg.history_separator,
            user_role_prefix=data_cfg.user_role_prefix,
            bot_role_prefix=data_cfg.bot_role_prefix,
        )
        response = generate_response(
            model,
            model_context,
            token_to_id,
            id_to_token,
            special_ids,
            max_new_tokens=args.max_new_tokens,
            temperature=args.temperature,
            top_k=args.top_k,
            greedy=args.greedy,
        )
        conversation_pairs.append((user_input, response))
        print(f"<response> {response}")
