# LLM_GPU — Custom Large Language Model from Scratch

> A transformer-based language model built entirely from scratch using PyTorch — custom tokenizer, causal self-attention, multi-GPU training, and interactive chat inference.

## Overview

This project implements a **GPT-style language model** from the ground up, without relying on HuggingFace or other high-level ML frameworks. Everything — from byte-pair-style tokenization to distributed training — is implemented manually for full control and deep understanding.

## Architecture

```
┌──────────────┐     ┌──────────────────┐     ┌───────────────┐
│  Raw Text    │────▶│  Custom Tokenizer │────▶│  Training     │
│  (Messages)  │     │  (BPE-style)      │     │  Pipeline     │
└──────────────┘     └──────────────────┘     └───────┬───────┘
                                                       │
                                                       ▼
                     ┌──────────────────┐     ┌───────────────┐
                     │  Interactive     │◀────│  GPT Model    │
                     │  Chat Interface  │     │  (Transformer) │
                     └──────────────────┘     └───────────────┘
```

## Model Architecture

| Component | Details |
|-----------|---------|
| **Attention** | Multi-head causal self-attention with Flash Attention support |
| **Blocks** | Pre-LayerNorm transformer blocks with residual connections |
| **Tokenizer** | Custom vocabulary builder with special tokens (context/response markers) |
| **Training** | Distributed Data Parallel (DDP), cosine warmup scheduler, gradient clipping |
| **Inference** | Top-k sampling, temperature control, greedy decoding |

## Project Structure

```
├── config/              — Model and data configuration (dataclasses)
│   └── model_config.py
├── data/                — Custom tokenizer and dataset pipeline
│   └── dataset.py
├── model/               — Transformer architecture
│   ├── attention.py     — CausalSelfAttention + MLP
│   ├── transformer.py   — TransformerBlock
│   └── gpt.py          — GPTModel + generation + checkpointing
├── training/            — Training loop with DDP support
│   └── trainer.py
├── inference/           — Interactive chat interface
│   └── chat.py
├── utils/               — Google Colab/Drive utilities
│   └── colab_setup.py
├── examples/            — Usage examples
│   └── usage.py
├── notebooks/           — Original Jupyter notebook
│   └── LLM_GPU.ipynb
├── main.py             — CLI entrypoint
└── requirements.txt
```

## Tech Stack

- **Framework:** PyTorch 2.0+
- **Training:** Multi-GPU via `torchrun` (DistributedDataParallel)
- **Attention:** Flash Attention (PyTorch SDPA)
- **Platform:** CUDA GPUs, Google Colab compatible
- **Language:** Python 3.10+

## Quick Start

### Single GPU Training
```bash
python main.py train --messages data.txt --out-dir checkpoints/ --n-layer 20 --n-head 16 --n-embd 1024
```

### Multi-GPU Training
```bash
torchrun --nproc_per_node=4 main.py train --messages data.txt --out-dir checkpoints/
```

### Interactive Chat
```bash
python main.py chat --checkpoint checkpoints/checkpoint_final.pt
```

## Key Features

- **100% from scratch** — no HuggingFace, no pre-trained weights
- **Custom tokenizer** with configurable vocabulary size
- **Multi-GPU distributed training** with automatic scaling
- **Conversation-aware** — supports multi-turn chat with history
- **Checkpoint system** — save/resume training at any point
- **Configurable architecture** — adjust layers, heads, embedding size
- **Google Colab ready** — with Drive integration for persistent storage
