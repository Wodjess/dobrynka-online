import argparse
import sys
from typing import Optional, Sequence

from training.trainer import train
from inference.chat import chat


def build_argument_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="GPU-ready PyTorch LLM trainer for Messages.txt",
    )

    subparsers = parser.add_subparsers(dest="mode", required=False)

    train_parser = subparsers.add_parser("train", help="Train a larger GPT model")
    train_parser.add_argument("--messages", type=str, default="Messages.txt")
    train_parser.add_argument("--max-context-chars", type=int, default=1600)
    train_parser.add_argument("--max-response-chars", type=int, default=400)
    train_parser.add_argument("--max-sequence-tokens", type=int, default=2048)
    train_parser.add_argument("--max-samples", type=int, default=0)
    train_parser.add_argument("--max-vocab-size", type=int, default=32768)
    train_parser.add_argument("--history-turns", type=int, default=16)
    train_parser.add_argument("--history-separator", type=str, default="\n")
    train_parser.add_argument("--user-role-prefix", type=str, default="User: ")
    train_parser.add_argument("--bot-role-prefix", type=str, default="Bot: ")
    train_parser.add_argument(
        "--use-global-history-fallback",
        action="store_true",
        help=(
            "Enable old behavior: if [dialog_id] is missing/invalid, use recent "
            "global lines as history context."
        ),
    )

    train_parser.add_argument("--n-layer", type=int, default=20)
    train_parser.add_argument("--n-head", type=int, default=16)
    train_parser.add_argument("--n-embd", type=int, default=1024)
    train_parser.add_argument("--block-size", type=int, default=2048)
    train_parser.add_argument("--dropout", type=float, default=0.0)
    train_parser.add_argument("--no-tie-embeddings", action="store_true")

    train_parser.add_argument("--seed", type=int, default=42)
    train_parser.add_argument("--max-steps", type=int, default=15000)
    train_parser.add_argument("--batch-size", type=int, default=4)
    train_parser.add_argument("--grad-accum-steps", type=int, default=16)
    train_parser.add_argument("--learning-rate", type=float, default=2e-4)
    train_parser.add_argument("--weight-decay", type=float, default=0.1)
    train_parser.add_argument("--beta1", type=float, default=0.9)
    train_parser.add_argument("--beta2", type=float, default=0.95)
    train_parser.add_argument("--warmup-steps", type=int, default=500)
    train_parser.add_argument("--min-lr", type=float, default=3e-5)
    train_parser.add_argument("--grad-clip", type=float, default=1.0)
    train_parser.add_argument("--log-interval", type=int, default=20)
    train_parser.add_argument("--eval-interval", type=int, default=200)
    train_parser.add_argument("--eval-batches", type=int, default=20)
    train_parser.add_argument("--num-workers", type=int, default=2)
    train_parser.add_argument("--out-dir", type=str, default="checkpoints_gpu")
    train_parser.add_argument("--compile-model", action="store_true")

    chat_parser = subparsers.add_parser("chat", help="Run interactive chat from checkpoint")
    chat_parser.add_argument("--checkpoint", type=str, required=True)
    chat_parser.add_argument("--max-new-tokens", type=int, default=160)
    chat_parser.add_argument("--temperature", type=float, default=0.8)
    chat_parser.add_argument("--top-k", type=int, default=40)
    chat_parser.add_argument(
        "--greedy",
        action="store_true",
        help="Use deterministic argmax decoding (ignores temperature/top-k).",
    )

    return parser


def _is_running_in_notebook() -> bool:
    if "ipykernel" in sys.modules:
        return True
    return False


def _parse_args_notebook_safe(
    parser: argparse.ArgumentParser,
    argv: Optional[Sequence[str]] = None,
) -> Optional[argparse.Namespace]:
    if argv is not None:
        return parser.parse_args(list(argv))

    args, unknown = parser.parse_known_args()

    if args.mode is None:
        if _is_running_in_notebook():
            parser.print_help()
            print(
                "\nNotebook hint:\n"
                "Call main([...]) with explicit args, for example:\n"
                "main([\"train\", \"--messages\", \"/content/Messages.txt\"])"
            )
            return None
        parser.error("Missing mode argument. Choose one of: train, chat")

    if unknown:
        print(f"Warning: ignoring unknown CLI args: {unknown}")

    return args


def main(argv: Optional[Sequence[str]] = None) -> None:
    parser = build_argument_parser()
    args = _parse_args_notebook_safe(parser, argv=argv)
    if args is None:
        return

    if args.mode == "train":
        train(args)
    elif args.mode == "chat":
        chat(args)
    else:
        raise ValueError(f"Unknown mode: {args.mode}")


if __name__ == "__main__" and not _is_running_in_notebook():
    main()
