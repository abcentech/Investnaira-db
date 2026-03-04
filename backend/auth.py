"""
auth.py — JWT token creation/verification + password hashing
"""

import os, hmac, hashlib, base64, json, time
from typing import Optional

# ── SECRETS ───────────────────────────────────────────────────────────
# In production, set these as environment variables.
JWT_SECRET = os.environ.get("JWT_SECRET", "investnaira-secret-change-in-production-2024")
ADMIN_EMAIL = os.environ.get("ADMIN_EMAIL", "admin@investnaira.ng").lower()

# Admin password default: "InvestNaira2024!" — change via env var ADMIN_PASSWORD_HASH
# To generate a new hash: python3 -c "from auth import hash_password; print(hash_password('yourpassword'))"
_DEFAULT_ADMIN_PASS = "InvestNaira2024!"
ADMIN_PASSWORD_HASH = os.environ.get(
    "ADMIN_PASSWORD_HASH",
    hashlib.sha256((_DEFAULT_ADMIN_PASS + JWT_SECRET).encode()).hexdigest()
)


# ── SIMPLE JWT (no external library needed) ───────────────────────────
# We implement HS256 JWT manually to avoid the python-jose / PyJWT dep
# for minimal deployments. For production, swap to python-jose.

def _b64url_encode(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).rstrip(b"=").decode()

def _b64url_decode(s: str) -> bytes:
    padding = 4 - len(s) % 4
    return base64.urlsafe_b64decode(s + "=" * (padding % 4))

def _sign(msg: str) -> str:
    return _b64url_encode(
        hmac.new(JWT_SECRET.encode(), msg.encode(), hashlib.sha256).digest()
    )

def create_token(payload: dict, expires_hours: int = 24) -> str:
    """Create a signed JWT token."""
    header = _b64url_encode(json.dumps({"alg": "HS256", "typ": "JWT"}).encode())
    payload = {**payload, "iat": int(time.time()), "exp": int(time.time()) + expires_hours * 3600}
    body = _b64url_encode(json.dumps(payload).encode())
    sig = _sign(f"{header}.{body}")
    return f"{header}.{body}.{sig}"

def verify_token(token: str) -> Optional[dict]:
    """Verify a JWT token, return payload or None."""
    try:
        parts = token.split(".")
        if len(parts) != 3:
            return None
        header, body, sig = parts
        expected_sig = _sign(f"{header}.{body}")
        if not hmac.compare_digest(sig, expected_sig):
            return None
        payload = json.loads(_b64url_decode(body))
        if payload.get("exp", 0) < time.time():
            return None  # expired
        return payload
    except Exception:
        return None


# ── PASSWORD HASHING ──────────────────────────────────────────────────

def hash_password(password: str) -> str:
    """Hash a password using SHA-256 + secret as salt."""
    return hashlib.sha256((password + JWT_SECRET).encode()).hexdigest()

def check_password(password: str, hashed: str) -> bool:
    """Verify a password against its hash."""
    return hmac.compare_digest(hash_password(password), hashed)
