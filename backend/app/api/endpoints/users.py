from fastapi import APIRouter, Depends, HTTPException, Query, Request
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func
from typing import Optional
from datetime import datetime, timezone

from ...core.database import get_db
from ...core.security import get_password_hash
from ...core.permissions import require_permission, P
from ...models.user import User
from ...models.role import Role
from ...models.associations import UserRole
from ...services import rbac_service, audit_service

router = APIRouter(prefix="/admin/users", tags=["User Management"])


# ── Schemas ────────────────────────────────────────────────────────────────────

class UserUpdateSchema(BaseModel):
    username: Optional[str] = None
    is_active: Optional[bool] = None

class AssignRolesSchema(BaseModel):
    role_ids: list[int]

class ResetPasswordSchema(BaseModel):
    new_password: str

class CreateUserSchema(BaseModel):
    username: str
    password: str
    is_superuser: bool = False
    role_ids: list[int] = []


# ── Helpers ────────────────────────────────────────────────────────────────────

def _ip(request: Request) -> str:
    return request.client.host if request.client else "unknown"

async def _get_or_404(db: AsyncSession, user_id: int) -> User:
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalars().first()
    if not user:
        raise HTTPException(404, "User not found")
    return user


# ── Routes ─────────────────────────────────────────────────────────────────────

@router.get("")
async def list_users(
    search: Optional[str] = Query(None),
    is_active: Optional[bool] = Query(None),
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    current_user: User = Depends(require_permission(P.USERS_VIEW)),
    db: AsyncSession = Depends(get_db),
):
    q = select(User)
    if search:
        q = q.where(User.username.ilike(f"%{search}%"))
    if is_active is not None:
        q = q.where(User.is_active == is_active)

    total_result = await db.execute(select(func.count()).select_from(q.subquery()))
    total = total_result.scalar() or 0

    q = q.order_by(User.id).offset((page - 1) * per_page).limit(per_page)
    users = (await db.execute(q)).scalars().all()

    users_out = []
    for u in users:
        roles = await rbac_service.get_user_role_slugs(db, u.id)
        role_ids = await rbac_service.get_user_role_ids(db, u.id)
        users_out.append({
            "id": u.id,
            "username": u.username,
            "is_active": u.is_active,
            "is_superuser": u.is_superuser,
            "last_login": u.last_login.isoformat() if u.last_login else None,
            "roles": roles,
            "role_ids": role_ids,
        })

    return {
        "users": users_out,
        "total": total,
        "page": page,
        "per_page": per_page,
        "pages": max(1, -(-total // per_page)),
    }


@router.post("", status_code=201)
async def create_user(
    payload: CreateUserSchema,
    request: Request,
    current_user: User = Depends(require_permission(P.USERS_CREATE)),
    db: AsyncSession = Depends(get_db),
):
    existing = (await db.execute(select(User).where(User.username == payload.username))).scalars().first()
    if existing:
        raise HTTPException(400, "Username already registered")

    # Only super admin can create other super admins
    if payload.is_superuser and not current_user.is_superuser:
        raise HTTPException(403, "Only Super Admin can create super admin accounts")

    user = User(
        username=payload.username,
        hashed_password=get_password_hash(payload.password),
        is_superuser=payload.is_superuser,
    )
    db.add(user)
    await db.flush()

    for role_id in payload.role_ids:
        db.add(UserRole(user_id=user.id, role_id=role_id, assigned_by=current_user.id))

    await db.commit()
    await db.refresh(user)
    await audit_service.log(db, action="user.created", user_id=current_user.id,
        username=current_user.username, resource_type="user", resource_id=user.id,
        details={"new_username": payload.username}, ip_address=_ip(request))
    return {"id": user.id, "username": user.username}


@router.get("/{user_id}")
async def get_user(
    user_id: int,
    current_user: User = Depends(require_permission(P.USERS_VIEW)),
    db: AsyncSession = Depends(get_db),
):
    user = await _get_or_404(db, user_id)
    roles = await rbac_service.get_user_role_slugs(db, user.id)
    role_ids = await rbac_service.get_user_role_ids(db, user.id)
    permissions = await rbac_service.get_user_permission_slugs(db, user.id)
    return {
        "id": user.id,
        "username": user.username,
        "is_active": user.is_active,
        "is_superuser": user.is_superuser,
        "last_login": user.last_login.isoformat() if user.last_login else None,
        "roles": roles,
        "role_ids": role_ids,
        "permissions": sorted(permissions),
    }


@router.put("/{user_id}")
async def update_user(
    user_id: int,
    payload: UserUpdateSchema,
    request: Request,
    current_user: User = Depends(require_permission(P.USERS_EDIT)),
    db: AsyncSession = Depends(get_db),
):
    user = await _get_or_404(db, user_id)
    if user.is_superuser and not current_user.is_superuser:
        raise HTTPException(403, "Cannot edit Super Admin accounts")

    if payload.username is not None:
        clash = (await db.execute(
            select(User).where(User.username == payload.username, User.id != user_id)
        )).scalars().first()
        if clash:
            raise HTTPException(400, "Username already taken")
        user.username = payload.username

    if payload.is_active is not None:
        if user.id == current_user.id and not payload.is_active:
            raise HTTPException(400, "Cannot deactivate your own account")
        user.is_active = payload.is_active

    await db.commit()
    await audit_service.log(db, action="user.updated", user_id=current_user.id,
        username=current_user.username, resource_type="user", resource_id=user_id,
        ip_address=_ip(request))
    return {"message": "User updated"}


@router.post("/{user_id}/toggle-active")
async def toggle_active(
    user_id: int,
    request: Request,
    current_user: User = Depends(require_permission(P.USERS_EDIT)),
    db: AsyncSession = Depends(get_db),
):
    user = await _get_or_404(db, user_id)
    if user.id == current_user.id:
        raise HTTPException(400, "Cannot deactivate your own account")
    if user.is_superuser and not current_user.is_superuser:
        raise HTTPException(403, "Cannot modify Super Admin accounts")

    user.is_active = not user.is_active
    await db.commit()
    action = "user.activated" if user.is_active else "user.deactivated"
    await audit_service.log(db, action=action, user_id=current_user.id,
        username=current_user.username, resource_type="user", resource_id=user_id,
        ip_address=_ip(request))
    return {"id": user_id, "is_active": user.is_active}


@router.put("/{user_id}/roles")
async def assign_roles(
    user_id: int,
    payload: AssignRolesSchema,
    request: Request,
    current_user: User = Depends(require_permission(P.USERS_MANAGE_ROLES)),
    db: AsyncSession = Depends(get_db),
):
    user = await _get_or_404(db, user_id)
    if user.is_superuser and not current_user.is_superuser:
        raise HTTPException(403, "Cannot modify Super Admin roles")

    await rbac_service.assign_roles_to_user(db, user_id, payload.role_ids, current_user.id)
    await audit_service.log(db, action="user.roles_assigned", user_id=current_user.id,
        username=current_user.username, resource_type="user", resource_id=user_id,
        details={"role_ids": payload.role_ids}, ip_address=_ip(request))
    return {"message": "Roles assigned"}


@router.post("/{user_id}/reset-password")
async def reset_password(
    user_id: int,
    payload: ResetPasswordSchema,
    request: Request,
    current_user: User = Depends(require_permission(P.USERS_EDIT)),
    db: AsyncSession = Depends(get_db),
):
    user = await _get_or_404(db, user_id)
    if user.is_superuser and not current_user.is_superuser:
        raise HTTPException(403, "Cannot reset Super Admin password")

    user.hashed_password = get_password_hash(payload.new_password)
    await db.commit()
    await audit_service.log(db, action="user.password_reset", user_id=current_user.id,
        username=current_user.username, resource_type="user", resource_id=user_id,
        ip_address=_ip(request))
    return {"message": "Password reset successfully"}


@router.delete("/{user_id}")
async def delete_user(
    user_id: int,
    request: Request,
    current_user: User = Depends(require_permission(P.USERS_DELETE)),
    db: AsyncSession = Depends(get_db),
):
    user = await _get_or_404(db, user_id)
    if user.id == current_user.id:
        raise HTTPException(400, "Cannot delete your own account")
    if user.is_superuser and not current_user.is_superuser:
        raise HTTPException(403, "Cannot delete Super Admin accounts")

    await db.delete(user)
    await db.commit()
    await audit_service.log(db, action="user.deleted", user_id=current_user.id,
        username=current_user.username, resource_type="user", resource_id=user_id,
        ip_address=_ip(request))
    return {"message": "User deleted"}
