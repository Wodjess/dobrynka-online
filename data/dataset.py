import os
from collections import Counter
from typing import Dict, List, Optional, Sequence, Tuple

import torch
from torch.utils.data import Dataset

from config.model_config import (
    CONTEXT_END_TOKEN,
    CONTEXT_START_TOKEN,
    INVALID_DIALOG_ID_MARKERS,
    PAD_TOKEN,
    RESPONSE_END_TOKEN,
    RESPONSE_START_TOKEN,
    SPECIAL_TOKENS,
    UNKNOWN_TOKEN,
    DataConfig,
    SpecialTokenIds,
)


def parse_dialog_id_suffix(raw_suffix: str) -> Optional[str]:
    stripped_suffix = raw_suffix.strip()
    if not stripped_suffix:
        return None
    if not (stripped_suffix.startswith("[") and stripped_suffix.endswith("]")):
        return None

    dialog_id = stripped_suffix[1:-1].strip()
    if not dialog_id:
        return None

    normalized_dialog_id = dialog_id.strip().strip("'\"").strip()
    if not normalized_dialog_id:
        return None

    if normalized_dialog_id.lower() in INVALID_DIALOG_ID_MARKERS:
        return None

    return normalized_dialog_id


def split_text_into_tokens(text: str) -> List[str]:
    tokens: List[str] = []
    current_word = ""

    for character in text:
        if character.isalnum() or character == "_":
            current_word += character
            continue

        if current_word:
            tokens.append(current_word)
            current_word = ""

        tokens.append(character)

    if current_word:
        tokens.append(current_word)

    return tokens


def parse_message_line(
    raw_line: str,
    max_context_characters: int,
    max_response_characters: int,
) -> Optional[Tuple[List[Tuple[str, str]], Optional[str]]]:
    stripped_line = raw_line.strip()
    if not stripped_line:
        return None

    extracted_turns: List[Tuple[str, str]] = []
    cursor = 0

    while True:
        context_start_index = stripped_line.find(CONTEXT_START_TOKEN, cursor)
        if context_start_index == -1:
            break

        context_text_start = context_start_index + len(CONTEXT_START_TOKEN)
        context_end_index = stripped_line.find(CONTEXT_END_TOKEN, context_text_start)
        if context_end_index == -1:
            return None

        response_start_index = stripped_line.find(
            RESPONSE_START_TOKEN, context_end_index + len(CONTEXT_END_TOKEN)
        )
        if response_start_index == -1:
            return None

        response_text_start = response_start_index + len(RESPONSE_START_TOKEN)
        response_end_index = stripped_line.find(RESPONSE_END_TOKEN, response_text_start)
        if response_end_index == -1:
            return None

        context_text = stripped_line[context_text_start:context_end_index]
        response_text = stripped_line[response_text_start:response_end_index]
        context_text = context_text.strip()[:max_context_characters]
        response_text = response_text.strip()[:max_response_characters]

        if context_text and response_text:
            extracted_turns.append((context_text, response_text))

        cursor = response_end_index + len(RESPONSE_END_TOKEN)

    if not extracted_turns:
        return None

    suffix_text = stripped_line[cursor:]
    dialog_id = parse_dialog_id_suffix(suffix_text)
    return extracted_turns, dialog_id


def build_sample_tokens(
    context_text: str,
    response_text: str,
    max_sequence_tokens: int,
) -> Tuple[List[str], int]:
    context_tokens = split_text_into_tokens(context_text)
    response_tokens = split_text_into_tokens(response_text)

    max_response_tokens = max_sequence_tokens - 4
    if len(response_tokens) > max_response_tokens:
        response_tokens = response_tokens[:max_response_tokens]

    max_context_tokens = max_sequence_tokens - (len(response_tokens) + 4)
    if max_context_tokens < 0:
        max_context_tokens = 0

    if len(context_tokens) > max_context_tokens:
        context_tokens = context_tokens[-max_context_tokens:]

    prefix_tokens = [
        CONTEXT_START_TOKEN,
        *context_tokens,
        CONTEXT_END_TOKEN,
        RESPONSE_START_TOKEN,
    ]

    full_tokens = [*prefix_tokens, *response_tokens, RESPONSE_END_TOKEN]
    response_target_start_index = len(prefix_tokens)

    return full_tokens, response_target_start_index


def build_history_context(
    records: Sequence[Tuple[str, str, Optional[str]]],
    sample_index: int,
    history_turns: int,
    history_separator: str,
    user_role_prefix: str,
    bot_role_prefix: str,
) -> str:
    clamped_history_turns = max(1, history_turns)
    current_dialog_id = records[sample_index][2]

    context_parts: List[str] = []
    if current_dialog_id:
        prior_records: List[Tuple[str, str]] = []
        for turn_index in range(sample_index - 1, -1, -1):
            previous_user_text, previous_bot_text, previous_dialog_id = records[turn_index]
            if previous_dialog_id != current_dialog_id:
                continue
            prior_records.append((previous_user_text, previous_bot_text))
            if len(prior_records) >= clamped_history_turns - 1:
                break
        prior_records.reverse()
    else:
        start_index = max(0, sample_index - (clamped_history_turns - 1))
        prior_records = []
        for turn_index in range(start_index, sample_index):
            previous_user_text, previous_bot_text, _previous_dialog_id = records[turn_index]
            prior_records.append((previous_user_text, previous_bot_text))

    for previous_user_text, previous_bot_text in prior_records:
        context_parts.append(f"{user_role_prefix}{previous_user_text}")
        context_parts.append(f"{bot_role_prefix}{previous_bot_text}")

    current_user_text, _current_response_text, _current_dialog_id = records[sample_index]
    context_parts.append(f"{user_role_prefix}{current_user_text}")

    return history_separator.join(context_parts)


def build_inference_context(
    history_pairs: Sequence[Tuple[str, str]],
    current_user_text: str,
    history_turns: int,
    history_separator: str,
    user_role_prefix: str,
    bot_role_prefix: str,
) -> str:
    clamped_history_turns = max(1, history_turns)
    prior_turns_to_keep = max(0, clamped_history_turns - 1)
    start_index = max(0, len(history_pairs) - prior_turns_to_keep)

    context_parts: List[str] = []
    for previous_user_text, previous_bot_text in history_pairs[start_index:]:
        context_parts.append(f"{user_role_prefix}{previous_user_text}")
        context_parts.append(f"{bot_role_prefix}{previous_bot_text}")

    context_parts.append(f"{user_role_prefix}{current_user_text}")
    return history_separator.join(context_parts)


def load_samples(data_cfg: DataConfig) -> List[Tuple[List[str], int]]:
    if not os.path.exists(data_cfg.messages_path):
        raise FileNotFoundError(
            f"Messages file was not found: {data_cfg.messages_path}. "
            "Create it in <CS>...<CE> <RS>...<RE> format "
            "(single-turn or multi-turn blocks per line)."
        )

    raw_records: List[Tuple[str, str, Optional[str]]] = []
    total_lines = 0
    valid_lines = 0
    skipped_lines = 0
    expanded_turns_from_multiturn_lines = 0
    auto_generated_dialog_ids = 0
    auto_generated_singleturn_dialog_ids = 0
    auto_generated_multiturn_dialog_ids = 0
    explicit_dialog_id_pairs = 0

    with open(data_cfg.messages_path, "r", encoding="utf-8") as source_file:
        for raw_line in source_file:
            total_lines += 1

            parsed = parse_message_line(
                raw_line,
                max_context_characters=data_cfg.max_context_characters,
                max_response_characters=data_cfg.max_response_characters,
            )
            if parsed is None:
                skipped_lines += 1
                continue

            turns, parsed_dialog_id = parsed
            valid_lines += 1
            if len(turns) > 1:
                expanded_turns_from_multiturn_lines += len(turns)

            effective_dialog_id = parsed_dialog_id
            if effective_dialog_id is None and len(turns) > 1:
                # Keep all turns from one multi-turn line in the same dialog history.
                effective_dialog_id = f"auto_line_{total_lines}"
                auto_generated_dialog_ids += 1
                auto_generated_multiturn_dialog_ids += 1
            elif effective_dialog_id is None and not data_cfg.use_global_history_fallback:
                # By default, avoid cross-line history mixing when dialog_id is missing.
                effective_dialog_id = f"auto_line_{total_lines}"
                auto_generated_dialog_ids += 1
                auto_generated_singleturn_dialog_ids += 1

            for context_text, response_text in turns:
                raw_records.append((context_text, response_text, effective_dialog_id))
                if parsed_dialog_id is not None:
                    explicit_dialog_id_pairs += 1
                if data_cfg.max_samples > 0 and len(raw_records) >= data_cfg.max_samples:
                    break

            if data_cfg.max_samples > 0 and len(raw_records) >= data_cfg.max_samples:
                break

    samples: List[Tuple[List[str], int]] = []
    for sample_index, (_context_text, response_text, _dialog_id) in enumerate(raw_records):
        expanded_context_text = build_history_context(
            raw_records,
            sample_index=sample_index,
            history_turns=data_cfg.history_turns,
            history_separator=data_cfg.history_separator,
            user_role_prefix=data_cfg.user_role_prefix,
            bot_role_prefix=data_cfg.bot_role_prefix,
        )
        sample_tokens, response_start = build_sample_tokens(
            expanded_context_text,
            response_text,
            max_sequence_tokens=data_cfg.max_sequence_tokens,
        )
        samples.append((sample_tokens, response_start))

    if not samples:
        raise RuntimeError(
            "No valid training samples were loaded. Expected format: "
            f"{CONTEXT_START_TOKEN}<context>{CONTEXT_END_TOKEN} "
            f"{RESPONSE_START_TOKEN}<response>{RESPONSE_END_TOKEN} "
            "(single-turn or repeated multi-turn blocks in one line)."
        )

    print(f"Loaded lines: {total_lines}")
    print(f"Valid lines: {valid_lines}")
    print(f"Valid pairs: {len(raw_records)}")
    print(f"Built samples: {len(samples)}")
    print(f"Skipped lines: {skipped_lines}")
    print(
        "Expanded turns from multi-turn lines: "
        f"{expanded_turns_from_multiturn_lines}"
    )
    pairs_with_any_dialog_id = sum(1 for _context, _response, dialog_id in raw_records if dialog_id)
    print(f"Pairs with [dialog_id] suffix: {explicit_dialog_id_pairs}")
    print(f"Pairs with effective dialog id: {pairs_with_any_dialog_id}")
    if auto_generated_dialog_ids > 0:
        print(
            "Auto-generated dialog ids (all): "
            f"{auto_generated_dialog_ids}"
        )
        print(
            "Auto-generated single-turn dialog ids: "
            f"{auto_generated_singleturn_dialog_ids}"
        )
        print(
            "Auto-generated multi-turn dialog ids: "
            f"{auto_generated_multiturn_dialog_ids}"
        )
    if explicit_dialog_id_pairs == 0:
        if data_cfg.use_global_history_fallback:
            print(
                "Dialog-aware history fallback: no valid [dialog_id] tags found, "
                "using global history."
            )
        else:
            print(
                "Dialog-aware history fallback: disabled, using auto ids for lines "
                "without valid [dialog_id]."
            )
    elif not data_cfg.use_global_history_fallback:
        print("Global history fallback: disabled for lines without valid [dialog_id].")
    print(f"History turns per sample: {max(1, data_cfg.history_turns)}")
    return samples


def build_vocabulary(
    samples: Sequence[Tuple[List[str], int]],
    max_vocab_size: int,
) -> Tuple[Dict[str, int], List[str], SpecialTokenIds]:
    token_counter: Counter = Counter()

    for token_list, _ in samples:
        token_counter.update(token_list)

    sorted_by_freq_then_token = sorted(
        token_counter.items(), key=lambda item: (-item[1], item[0])
    )

    kept_tokens = [token for token, _ in sorted_by_freq_then_token if token not in SPECIAL_TOKENS]
    max_non_special = max(0, max_vocab_size - len(SPECIAL_TOKENS))
    kept_tokens = kept_tokens[:max_non_special]

    id_to_token = [*SPECIAL_TOKENS, *kept_tokens]
    token_to_id = {token: token_id for token_id, token in enumerate(id_to_token)}

    special_token_ids = SpecialTokenIds(
        pad_id=token_to_id[PAD_TOKEN],
        unk_id=token_to_id[UNKNOWN_TOKEN],
        context_start_id=token_to_id[CONTEXT_START_TOKEN],
        context_end_id=token_to_id[CONTEXT_END_TOKEN],
        response_start_id=token_to_id[RESPONSE_START_TOKEN],
        response_end_id=token_to_id[RESPONSE_END_TOKEN],
    )

    kept_fraction = 100.0
    if token_counter:
        kept_fraction = 100.0 * sum(token_counter[token] for token in kept_tokens) / sum(
            token_counter.values()
        )

    print(f"Vocabulary size: {len(id_to_token)} (cap={max_vocab_size})")
    print(f"Token coverage after cap: {kept_fraction:.2f}%")

    return token_to_id, id_to_token, special_token_ids


def encode_tokens(token_list: Sequence[str], token_to_id: Dict[str, int], unk_id: int) -> List[int]:
    return [token_to_id.get(token, unk_id) for token in token_list]


class MessageDataset(Dataset):
    def __init__(
        self,
        samples: Sequence[Tuple[List[str], int]],
        token_to_id: Dict[str, int],
        special_ids: SpecialTokenIds,
        block_size: int,
    ):
        self.inputs: List[List[int]] = []
        self.labels: List[List[int]] = []
        self.pad_id = special_ids.pad_id

        for tokens, response_start in samples:
            token_ids = encode_tokens(tokens, token_to_id, special_ids.unk_id)

            if len(token_ids) < 2:
                continue

            max_token_length = block_size + 1
            if len(token_ids) > max_token_length:
                overflow = len(token_ids) - max_token_length
                token_ids = token_ids[overflow:]
                response_start = max(0, response_start - overflow)

            input_ids = token_ids[:-1]
            label_ids = token_ids[1:]

            ignore_until = max(0, response_start - 1)
            ignore_until = min(ignore_until, len(label_ids))
            for index in range(ignore_until):
                label_ids[index] = -100

            self.inputs.append(input_ids)
            self.labels.append(label_ids)

        if not self.inputs:
            raise RuntimeError("No usable sequences were built for training.")

    def __len__(self) -> int:
        return len(self.inputs)

    def __getitem__(self, index: int) -> Tuple[List[int], List[int]]:
        return self.inputs[index], self.labels[index]


def collate_batch(
    batch: Sequence[Tuple[List[int], List[int]]],
    pad_id: int,
) -> Tuple[torch.Tensor, torch.Tensor]:
    batch_size = len(batch)
    max_len = max(len(item[0]) for item in batch)

    input_tensor = torch.full((batch_size, max_len), pad_id, dtype=torch.long)
    label_tensor = torch.full((batch_size, max_len), -100, dtype=torch.long)

    for row_index, (input_ids, label_ids) in enumerate(batch):
        length = len(input_ids)
        input_tensor[row_index, :length] = torch.tensor(input_ids, dtype=torch.long)
        label_tensor[row_index, :length] = torch.tensor(label_ids, dtype=torch.long)

    return input_tensor, label_tensor
