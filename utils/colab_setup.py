import os
import shutil
import subprocess
import sys
from pathlib import Path

IN_COLAB = False
DRIVE_OK = False

try:
    from google.colab import drive, files
    IN_COLAB = True
except Exception:
    drive = None
    files = None

if IN_COLAB:
    try:
        drive.mount('/content/drive', force_remount=True)
        DRIVE_ROOT = '/content/drive/MyDrive/LLM_GPU'
        DRIVE_OK = True
    except Exception as error:
        print('Drive mount failed:', error)
        DRIVE_ROOT = '/content/LLM_GPU_drive_fallback'
else:
    DRIVE_ROOT = str(Path.cwd() / 'LLM_GPU')

if IN_COLAB:
    LOCAL_ROOT = '/content/LLM_GPU_runtime'
else:
    LOCAL_ROOT = str(Path.cwd() / 'LLM_GPU_runtime')

os.makedirs(DRIVE_ROOT, exist_ok=True)
os.makedirs(LOCAL_ROOT, exist_ok=True)

# Security policy:
# - keep encrypted file in Drive
# - keep decrypted plaintext ONLY in LOCAL_ROOT
MESSAGES_ENC_PATH = os.path.join(DRIVE_ROOT, 'Messages.txt.enc')
MESSAGES_DRIVE_PLAINTEXT_PATH = os.path.join(DRIVE_ROOT, 'Messages.txt')
MESSAGES_PATH = os.path.join(LOCAL_ROOT, 'Messages.txt')
OUT_DIR = os.path.join(DRIVE_ROOT, 'checkpoints_gpu_100m')


def sync_dir(src_dir: str, dst_dir: str) -> None:
    """Copy all files from src_dir to dst_dir using pure Python (no shell)."""
    src = Path(src_dir)
    dst = Path(dst_dir)
    if not src.exists():
        raise FileNotFoundError(f'Source directory does not exist: {src}')

    dst.mkdir(parents=True, exist_ok=True)

    for item in src.rglob('*'):
        rel = item.relative_to(src)
        target = dst / rel
        if item.is_dir():
            target.mkdir(parents=True, exist_ok=True)
        else:
            target.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(item, target)

    print(f'Sync complete: {src} -> {dst}')


def decrypt_messages_enc_to_local(
    private_key_path: str,
    crypt_script_path: str = 'Messages crypt.py',
    passphrase_env: str = 'MSG_PRIVATE_KEY_PASSPHRASE',
) -> None:
    """Decrypt Drive .enc file to LOCAL plaintext path only."""
    if not os.path.exists(crypt_script_path):
        raise FileNotFoundError(f'Crypt script not found: {crypt_script_path}')
    if not os.path.exists(MESSAGES_ENC_PATH):
        raise FileNotFoundError(f'Encrypted file not found: {MESSAGES_ENC_PATH}')

    cmd = [
        sys.executable,
        crypt_script_path,
        'decrypt',
        '--input', MESSAGES_ENC_PATH,
        '--private-key', private_key_path,
        '--output', MESSAGES_PATH,
        '--overwrite',
        '--private-passphrase-env', passphrase_env,
    ]
    subprocess.run(cmd, check=True)
    print('Decrypted to LOCAL path:', MESSAGES_PATH)


def cleanup_local_messages() -> None:
    if os.path.exists(MESSAGES_PATH):
        os.remove(MESSAGES_PATH)
        print('Removed local plaintext:', MESSAGES_PATH)
    else:
        print('Local plaintext not found:', MESSAGES_PATH)


def _print_setup_info() -> None:
    print('IN_COLAB:', IN_COLAB)
    print('DRIVE_OK:', DRIVE_OK)
    print('DRIVE_ROOT:', DRIVE_ROOT)
    print('LOCAL_ROOT:', LOCAL_ROOT)
    print('MESSAGES_ENC_PATH (Drive):', MESSAGES_ENC_PATH)
    print('MESSAGES_PATH (LOCAL plaintext):', MESSAGES_PATH)
    print('OUT_DIR (Drive checkpoints):', OUT_DIR)

    if DRIVE_OK and os.path.exists(MESSAGES_DRIVE_PLAINTEXT_PATH):
        print('[warn] Plaintext Messages.txt exists on Drive:', MESSAGES_DRIVE_PLAINTEXT_PATH)
        print('[warn] Training now uses LOCAL plaintext path only. Remove Drive plaintext manually for security.')

    if IN_COLAB and (not DRIVE_OK):
        if os.path.exists('/content/Messages.txt') and not os.path.exists(MESSAGES_PATH):
            shutil.copy2('/content/Messages.txt', MESSAGES_PATH)
            print('Copied /content/Messages.txt ->', MESSAGES_PATH)
        elif (files is not None) and (not os.path.exists(MESSAGES_PATH)):
            print('Upload Messages.txt manually (fallback mode) ...')
            uploaded = files.upload()
            if 'Messages.txt' in uploaded:
                with open(MESSAGES_PATH, 'wb') as target_file:
                    target_file.write(uploaded['Messages.txt'])
                print('Saved uploaded file to', MESSAGES_PATH)


# Auto-print setup info when this module is imported
_print_setup_info()
