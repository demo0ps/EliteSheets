from __future__ import annotations
import hashlib
import hmac
import os
import secrets

from cryptography.fernet import Fernet, InvalidToken


def password_hash(password):
    if not 12 <= len(password) <= 256:
        raise ValueError('Use a password between 12 and 256 characters.')
    salt = secrets.token_bytes(16)
    value = hashlib.scrypt(password.encode(), salt=salt, n=2**14, r=8, p=1, dklen=32)
    return 'scrypt$' + salt.hex() + '$' + value.hex()


def password_matches(password, encoded):
    try:
        _, salt, expected = encoded.split('$')
        value = hashlib.scrypt(password.encode(), salt=bytes.fromhex(salt), n=2**14, r=8, p=1, dklen=32)
        return hmac.compare_digest(value.hex(), expected)
    except (ValueError, TypeError):
        return False


class Vault:
    def __init__(self, key, demo=False):
        if not key:
            if not demo:
                raise ValueError('Production needs a stable SHEETQMS_ENCRYPTION_KEY from the cloud secret manager.')
            key = Fernet.generate_key().decode()
        self.fernet = Fernet(key.encode() if isinstance(key, str) else key)
    def seal(self, value):
        return self.fernet.encrypt(value.encode()).decode() if value else ''
    def open(self, value):
        try:
            return self.fernet.decrypt(value.encode()).decode() if value else ''
        except InvalidToken as exc:
            raise ValueError('The configured encryption key cannot unlock the stored credential; rotate/reconfigure securely.') from exc
