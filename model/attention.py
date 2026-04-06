import torch
import torch.nn as nn
import torch.nn.functional as F

from config.model_config import ModelConfig


class CausalSelfAttention(nn.Module):
    def __init__(self, cfg: ModelConfig):
        super().__init__()
        if cfg.n_embd % cfg.n_head != 0:
            raise ValueError("n_embd must be divisible by n_head")

        self.n_head = cfg.n_head
        self.head_dim = cfg.n_embd // cfg.n_head
        self.dropout = nn.Dropout(cfg.dropout)

        self.qkv_proj = nn.Linear(cfg.n_embd, 3 * cfg.n_embd, bias=True)
        self.out_proj = nn.Linear(cfg.n_embd, cfg.n_embd, bias=True)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        batch_size, seq_len, channels = x.shape

        qkv = self.qkv_proj(x)
        q, k, v = qkv.split(channels, dim=2)

        q = q.view(batch_size, seq_len, self.n_head, self.head_dim).transpose(1, 2)
        k = k.view(batch_size, seq_len, self.n_head, self.head_dim).transpose(1, 2)
        v = v.view(batch_size, seq_len, self.n_head, self.head_dim).transpose(1, 2)

        dropout_probability = self.dropout.p if self.training else 0.0
        attention_output = F.scaled_dot_product_attention(
            q,
            k,
            v,
            attn_mask=None,
            dropout_p=dropout_probability,
            is_causal=True,
        )

        attention_output = attention_output.transpose(1, 2).contiguous().view(
            batch_size, seq_len, channels
        )

        output = self.out_proj(attention_output)
        return self.dropout(output)


class MLP(nn.Module):
    def __init__(self, cfg: ModelConfig):
        super().__init__()
        inner_dim = 4 * cfg.n_embd
        self.fc1 = nn.Linear(cfg.n_embd, inner_dim, bias=True)
        self.fc2 = nn.Linear(inner_dim, cfg.n_embd, bias=True)
        self.dropout = nn.Dropout(cfg.dropout)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        x = self.fc1(x)
        x = F.gelu(x)
        x = self.fc2(x)
        return self.dropout(x)
