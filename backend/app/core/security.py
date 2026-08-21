import os
import hashlib
import hmac
import jwt
from datetime import datetime, timedelta, timezone
from typing import Optional, Union, Any
from app.core.config import settings

def get_password_hash(password: str) -> str:
    """Hash a password using PBKDF2 with HMAC-SHA256 (robust and standard without external C lib dependencies)."""
    salt = os.urandom(16)
    pwd_hash = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt, 100000)
    return f"pbkdf2:sha256:100000${salt.hex()}${pwd_hash.hex()}"

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plain password against stored hash."""
    if not hashed_password or "$" not in hashed_password:
        return False
    try:
        parts = hashed_password.split("$")
        if len(parts) == 3 and parts[0] == "pbkdf2:sha256:100000":
            salt = bytes.fromhex(parts[1])
            expected_hash = parts[2]
            computed_hash = hashlib.pbkdf2_hmac('sha256', plain_password.encode('utf-8'), salt, 100000).hex()
            return hmac.compare_digest(computed_hash, expected_hash)
    except Exception:
        pass
    return False

def create_access_token(subject: Union[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    """Create a JWT access token."""
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode = {
        "exp": int(expire.timestamp()),
        "sub": str(subject)
    }
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

def decode_access_token(token: str) -> Optional[dict]:
    """Decode and validate a JWT access token."""
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return payload
    except Exception:
        return None
