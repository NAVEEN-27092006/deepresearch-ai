from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.models import User
from app.schemas.schemas import UserResponse
from app.api.deps import get_current_user
from app.core.security import get_password_hash, verify_password

router = APIRouter(prefix="/user", tags=["User Settings & Profile"])

class ProfileUpdateSchema(BaseModel):
    name: str
    email: EmailStr

class PasswordChangeSchema(BaseModel):
    current_password: str
    new_password: str

@router.put("/profile", response_model=UserResponse)
def update_profile(
    profile_in: ProfileUpdateSchema,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update user profile name or email."""
    if profile_in.email.lower() != current_user.email.lower():
        existing = db.query(User).filter(User.email == profile_in.email.lower()).first()
        if existing:
            raise HTTPException(status_code=400, detail="Email is already taken by another user.")
        current_user.email = profile_in.email.lower()

    current_user.name = profile_in.name
    db.commit()
    db.refresh(current_user)
    return current_user

@router.post("/change-password")
def change_password(
    pwd_in: PasswordChangeSchema,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Securely change user password."""
    if not verify_password(pwd_in.current_password, current_user.password_hash):
        raise HTTPException(status_code=400, detail="Current password incorrect.")

    current_user.password_hash = get_password_hash(pwd_in.new_password)
    db.commit()
    return {"message": "Password updated successfully."}
