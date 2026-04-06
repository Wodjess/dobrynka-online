from dataclasses import dataclass


CONTEXT_START_TOKEN = "<CS>"
CONTEXT_END_TOKEN = "<CE>"
RESPONSE_START_TOKEN = "<RS>"
RESPONSE_END_TOKEN = "<RE>"
UNKNOWN_TOKEN = "<UNK>"
PAD_TOKEN = "<PAD>"


@dataclass
class DataConfig:
    messages_path: str = "Messages.txt"
    max_context_characters: int = 1600
    max_response_characters: int = 400
    max_sequence_tokens: int = 2048
    max_samples: int = 0  # 0 means all
    max_vocab_size: int = 32768
    history_turns: int = 16
    history_separator: str = "\n"
    user_role_prefix: str = "User: "
    bot_role_prefix: str = "Bot: "
    use_global_history_fallback: bool = False


@dataclass
class ModelConfig:
    n_layer: int = 20
    n_head: int = 16
    n_embd: int = 1024
    block_size: int = 2048
    dropout: float = 0.0
    tie_embeddings: bool = True


@dataclass
class TrainConfig:
    seed: int = 42
    max_steps: int = 15000
    batch_size: int = 4
    grad_accum_steps: int = 16
    learning_rate: float = 2e-4
    weight_decay: float = 0.1
    beta1: float = 0.9
    beta2: float = 0.95
    warmup_steps: int = 500
    min_lr: float = 3e-5
    grad_clip: float = 1.0
    log_interval: int = 20
    eval_interval: int = 200
    eval_batches: int = 20
    num_workers: int = 2
    out_dir: str = "checkpoints_gpu"
    compile_model: bool = False


@dataclass
class SpecialTokenIds:
    pad_id: int
    unk_id: int
    context_start_id: int
    context_end_id: int
    response_start_id: int
    response_end_id: int


SPECIAL_TOKENS = [
    PAD_TOKEN,
    UNKNOWN_TOKEN,
    CONTEXT_START_TOKEN,
    CONTEXT_END_TOKEN,
    RESPONSE_START_TOKEN,
    RESPONSE_END_TOKEN,
]

INVALID_DIALOG_ID_MARKERS = {
    "none",
    "null",
    "nan",
    "nil",
    "n/a",
    "na",
    "undefined",
}
