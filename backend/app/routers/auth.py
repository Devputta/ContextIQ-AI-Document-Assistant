from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import or_
from sqlalchemy.orm import Session
from ..auth import create_token, get_current_user, hash_password, verify_password
from ..db import get_db
from ..models import User
from ..schemas import AuthResponse, ChangePasswordRequest, LoginRequest, RegisterRequest, UserOut
router=APIRouter(prefix='/auth',tags=['authentication'])

def dto(u): return {'id':u.id,'username':u.username,'email':u.email,'createdAt':u.created_at}

def password_policy(p):
    if len(p)<8 or not any(c.isupper() for c in p) or not any(c.islower() for c in p) or not any(c.isdigit() for c in p): raise HTTPException(400,'Password must be at least 8 characters and include uppercase, lowercase and a number.')

@router.post('/register',response_model=AuthResponse)
def register(req:RegisterRequest,db:Session=Depends(get_db)):
    password_policy(req.password)
    if db.query(User).filter(or_(User.username==req.username,User.email==req.email.lower())).first(): raise HTTPException(409,'Username or email is already registered.')
    u=User(username=req.username,email=req.email.lower(),password_hash=hash_password(req.password));db.add(u);db.commit();db.refresh(u)
    return {'accessToken':create_token(u),'user':dto(u)}

@router.post('/login',response_model=AuthResponse)
def login(req:LoginRequest,db:Session=Depends(get_db)):
    ident=req.identifier.lower().strip();u=db.query(User).filter(or_(User.email==ident,User.username==req.identifier.strip())).first()
    if not u or not verify_password(req.password,u.password_hash): raise HTTPException(401,'Invalid credentials.')
    return {'accessToken':create_token(u),'user':dto(u)}

@router.get('/me',response_model=UserOut)
def me(u:User=Depends(get_current_user)): return dto(u)

@router.post('/change-password')
def change_password(req:ChangePasswordRequest,db:Session=Depends(get_db),u:User=Depends(get_current_user)):
    password_policy(req.newPassword)
    if not verify_password(req.currentPassword,u.password_hash): raise HTTPException(401,'Current password is incorrect.')
    u.password_hash=hash_password(req.newPassword);u.session_version+=1;db.commit();return {'changed':True}

@router.post('/logout-all')
def logout_all(db:Session=Depends(get_db),u:User=Depends(get_current_user)):
    u.session_version+=1;db.commit();return {'loggedOut':True}
