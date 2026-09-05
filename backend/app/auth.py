import base64, hashlib, hmac, json, os, secrets
from datetime import datetime, timedelta, timezone
from fastapi import Depends, HTTPException, Request
from sqlalchemy.orm import Session
from .db import get_db
from .models import User

TOKEN_TTL_HOURS = 24 * 7

def hash_password(password: str) -> str:
    salt = secrets.token_bytes(16)
    digest = hashlib.pbkdf2_hmac('sha256', password.encode(), salt, 310_000)
    return f'pbkdf2_sha256$310000${base64.urlsafe_b64encode(salt).decode()}${base64.urlsafe_b64encode(digest).decode()}'

def verify_password(password: str, encoded: str) -> bool:
    try:
        _, rounds, salt_b64, digest_b64 = encoded.split('$')
        salt = base64.urlsafe_b64decode(salt_b64.encode())
        expected = base64.urlsafe_b64decode(digest_b64.encode())
        actual = hashlib.pbkdf2_hmac('sha256', password.encode(), salt, int(rounds))
        return hmac.compare_digest(actual, expected)
    except Exception:
        return False

def _b64(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).rstrip(b'=').decode()

def create_token(user: User) -> str:
    secret = os.getenv('AUTH_SECRET', 'change-this-local-secret')
    header = _b64(json.dumps({'alg':'HS256','typ':'JWT'}, separators=(',',':')).encode())
    payload = _b64(json.dumps({'sub':user.id,'sv':user.session_version,'exp':int((datetime.now(timezone.utc)+timedelta(hours=TOKEN_TTL_HOURS)).timestamp())}, separators=(',',':')).encode())
    sig = _b64(hmac.new(secret.encode(), f'{header}.{payload}'.encode(), hashlib.sha256).digest())
    return f'{header}.{payload}.{sig}'

def decode_token(token: str) -> dict:
    try:
        header, payload, signature = token.split('.')
        secret = os.getenv('AUTH_SECRET', 'change-this-local-secret')
        expected = _b64(hmac.new(secret.encode(), f'{header}.{payload}'.encode(), hashlib.sha256).digest())
        if not hmac.compare_digest(signature, expected): raise ValueError('signature')
        data = json.loads(base64.urlsafe_b64decode(payload + '=' * (-len(payload)%4)))
        if int(data.get('exp',0)) < int(datetime.now(timezone.utc).timestamp()): raise ValueError('expired')
        return data
    except Exception as exc:
        raise HTTPException(401, 'Invalid or expired authentication token.') from exc

def get_current_user(request: Request, db: Session = Depends(get_db)) -> User:
    auth = request.headers.get('Authorization','')
    if not auth.startswith('Bearer '): raise HTTPException(401, 'Authentication required.')
    data = decode_token(auth[7:].strip())
    user = db.get(User, data.get('sub'))
    if not user or user.session_version != data.get('sv'): raise HTTPException(401, 'Session is no longer valid.')
    return user
