"""
Usage examples extracted from the original LLM_GPU notebook (cells 10-14).

These examples assume a Google Colab environment with Drive mounted.
Adjust paths as needed for your local setup.
"""

import os
import sys

# Add the project root to the path so imports work
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from main import main
from utils.colab_setup import (
    DRIVE_ROOT,
    OUT_DIR,
    cleanup_local_messages,
    sync_dir,
)

# ---------------------------------------------------------------------------
# Example 1: larger-model training on Drive mix dataset
# Assumes you uploaded: /content/drive/MyDrive/LLM_GPU/Messages_mix.txt
# ---------------------------------------------------------------------------

MIX_MESSAGES_PATH = '/content/drive/MyDrive/LLM_GPU/Messages_mix.txt'

# main([
#     'train',
#     '--messages', MIX_MESSAGES_PATH,
#     '--out-dir', OUT_DIR,
#     '--max-context-chars', '1600',
#     '--history-turns', '16',
#     '--max-sequence-tokens', '2048',
#     '--block-size', '2048',
#     '--n-layer', '20',
#     '--n-head', '16',
#     '--n-embd', '1024',
#     '--batch-size', '4',
#     '--grad-accum-steps', '16',
#     '--learning-rate', '2e-4',
#     '--warmup-steps', '500',
#     '--max-steps', '15000',
#     '--eval-interval', '5000',
# ])

# Optional: separate long-context run with lower LR
# LONG_MESSAGES_PATH = '/content/drive/MyDrive/LLM_GPU/Messages_longContext.txt'
# main([
#     'train',
#     '--messages', LONG_MESSAGES_PATH,
#     '--out-dir', OUT_DIR,
#     '--max-context-chars', '1600',
#     '--history-turns', '16',
#     '--max-sequence-tokens', '2048',
#     '--block-size', '2048',
#     '--n-layer', '20',
#     '--n-head', '16',
#     '--n-embd', '1024',
#     '--batch-size', '4',
#     '--grad-accum-steps', '16',
#     '--learning-rate', '8e-5',
#     '--warmup-steps', '300',
#     '--max-steps', '3000',
#     '--eval-interval', '1000',
# ])


# ---------------------------------------------------------------------------
# Example 2: interactive chat from final checkpoint on Google Drive (greedy)
# ---------------------------------------------------------------------------

# main([
#     'chat',
#     '--checkpoint', os.path.join(OUT_DIR, 'checkpoint_final.pt'),
#     '--greedy',
# ])


# ---------------------------------------------------------------------------
# Example 3: sync local checkpoints to Drive after training
# ---------------------------------------------------------------------------

# LOCAL_OUT_DIR = '/content/checkpoints_gpu_100m'
# DRIVE_OUT_DIR = os.path.join(DRIVE_ROOT, 'checkpoints_gpu_100m')
#
# if os.path.exists(LOCAL_OUT_DIR):
#     sync_dir(LOCAL_OUT_DIR, DRIVE_OUT_DIR)
# else:
#     print(f'Local directory not found: {LOCAL_OUT_DIR}')


# ---------------------------------------------------------------------------
# Example 4: security cleanup - remove local plaintext after training
# ---------------------------------------------------------------------------

# cleanup_local_messages()


# ---------------------------------------------------------------------------
# Example 5: Multi-GPU launch (run in terminal, not inside notebook)
# ---------------------------------------------------------------------------

# torchrun --nproc_per_node=4 main.py train --messages Messages.txt --out-dir checkpoints_gpu_100m
