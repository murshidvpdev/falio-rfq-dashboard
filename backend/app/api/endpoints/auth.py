from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from datetime import timedelta, datetime, timezone

from ...core.security import create_access_token, verify_password, get_password_hash, verify_token
from ...core.database import get_db
from ...models.user import User
from ...services import rbac_service, audit_service

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")


# ── Schemas ────────────────────────────────────────────────────────────────────

class UserCreate(BaseModel):
    username: str
    password: str

class UserPasswordUpdate(BaseModel):
    old_password: str
    new_password: str


# ── Shared dependency ──────────────────────────────────────────────────────────

async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db),
) -> User:
    username = verify_token(token)
    if not username:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    result = await db.execute(select(User).where(User.username == username))
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if not user.is_active:
        raise HTTPException(status_code=403, detail="Account is inactive")
    return user


# ── Routes ─────────────────────────────────────────────────────────────────────

@router.post("/token")
async def login_for_access_token(
    request: Request,
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(User).where(User.username == form_data.username))
    user = result.scalars().first()

    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if not user.is_active:
        raise HTTPException(status_code=403, detail="Account is inactive")

    # Record last login
    user.last_login = datetime.now(timezone.utc)
    await db.commit()

    await audit_service.log(
        db, action="auth.login",
        user_id=user.id, username=user.username,
        ip_address=request.client.host if request.client else None,
    )

    access_token = create_access_token(
        data={"sub": user.username},
        expires_delta=timedelta(minutes=30),
    )
    return {"access_token": access_token, "token_type": "bearer"}


@router.post("/users", status_code=status.HTTP_201_CREATED)
async def create_user(user: UserCreate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.username == user.username))
    if result.scalars().first():
        raise HTTPException(status_code=400, detail="Username already registered")

    db_user = User(
        username=user.username,
        hashed_password=get_password_hash(user.password),
    )
    db.add(db_user)
    await db.commit()
    return {"message": "User created successfully"}


@router.put("/users/me/password")
async def update_password(
    password_update: UserPasswordUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if not verify_password(password_update.old_password, current_user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect old password")

    current_user.hashed_password = get_password_hash(password_update.new_password)
    await db.commit()
    return {"message": "Password updated successfully"}


@router.get("/users/exists")
async def check_user_exists(username: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.username == username))
    return {"exists": result.scalars().first() is not None}


@router.get("/users/me")
async def read_users_me(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    roles = await rbac_service.get_user_role_slugs(db, current_user.id)
    return {
        "id": current_user.id,
        "username": current_user.username,
        "is_superuser": current_user.is_superuser,
        "is_active": current_user.is_active,
        "roles": roles,
        "last_login": current_user.last_login.isoformat() if current_user.last_login else None,
    }


@router.get("/users/me/permissions")
async def get_my_permissions(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Returns the full permission/role set for the logged-in user.
    Called by the frontend PermissionContext on mount.
    Super Admin receives a special '*' marker — the frontend treats this as full access.
    """
    roles = await rbac_service.get_user_role_slugs(db, current_user.id)
    permissions = (
        ["*"] if current_user.is_superuser
        else sorted(await rbac_service.get_user_permission_slugs(db, current_user.id))
    )
    return {
        "user_id": current_user.id,
        "username": current_user.username,
        "is_superuser": current_user.is_superuser,
        "is_active": current_user.is_active,
        "roles": roles,
        "permissions": permissions,
    }
