from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import Optional

from ...core.database import get_db
from ...core.permissions import require_permission, P
from ...models.user import User
from ...models.role import Role
from ...models.permission import Permission
from ...models.associations import RolePermission
from ...services import rbac_service, audit_service

router = APIRouter(prefix="/admin/roles", tags=["Role Management"])


# ── Schemas ────────────────────────────────────────────────────────────────────

class RoleCreateSchema(BaseModel):
    name: str
    slug: str
    description: Optional[str] = None

class RoleUpdateSchema(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    is_active: Optional[bool] = None

class AssignPermissionsSchema(BaseModel):
    permission_ids: list[int]

class CloneRoleSchema(BaseModel):
    name: str
    slug: str
    description: Optional[str] = None


# ── Routes ─────────────────────────────────────────────────────────────────────

@router.get("")
async def list_roles(
    current_user: User = Depends(require_permission(P.ROLES_VIEW)),
    db: AsyncSession = Depends(get_db),
):
    roles = (await db.execute(select(Role).order_by(Role.id))).scalars().all()
    out = []
    for r in roles:
        perms = (await db.execute(
            select(Permission)
            .join(RolePermission, Permission.id == RolePermission.permission_id)
            .where(RolePermission.role_id == r.id)
            .order_by(Permission.module, Permission.action)
        )).scalars().all()
        out.append({
            "id": r.id,
            "name": r.name,
            "slug": r.slug,
            "description": r.description,
            "is_active": r.is_active,
            "is_system": r.is_system,
            "permission_count": len(perms),
            "permission_ids": [p.id for p in perms],
            "permissions": [{"id": p.id, "slug": p.slug, "name": p.name, "module": p.module} for p in perms],
        })
    return out


@router.post("", status_code=201)
async def create_role(
    payload: RoleCreateSchema,
    request: Request,
    current_user: User = Depends(require_permission(P.ROLES_CREATE)),
    db: AsyncSession = Depends(get_db),
):
    slug = payload.slug.lower().replace(" ", "_")
    if (await db.execute(select(Role).where(Role.slug == slug))).scalars().first():
        raise HTTPException(400, "Role slug already exists")

    role = Role(name=payload.name, slug=slug, description=payload.description)
    db.add(role)
    await db.commit()
    await db.refresh(role)
    await audit_service.log(db, action="role.created", user_id=current_user.id,
        username=current_user.username, resource_type="role", resource_id=role.id,
        details={"name": role.name, "slug": role.slug},
        ip_address=request.client.host if request.client else None)
    return {"id": role.id, "name": role.name, "slug": role.slug}


@router.put("/{role_id}")
async def update_role(
    role_id: int,
    payload: RoleUpdateSchema,
    request: Request,
    current_user: User = Depends(require_permission(P.ROLES_EDIT)),
    db: AsyncSession = Depends(get_db),
):
    role = (await db.execute(select(Role).where(Role.id == role_id))).scalars().first()
    if not role:
        raise HTTPException(404, "Role not found")
    if role.is_system and not current_user.is_superuser:
        raise HTTPException(403, "Cannot edit system roles")

    if payload.name is not None:     role.name = payload.name
    if payload.description is not None: role.description = payload.description
    if payload.is_active is not None:   role.is_active = payload.is_active
    await db.commit()
    await audit_service.log(db, action="role.updated", user_id=current_user.id,
        username=current_user.username, resource_type="role", resource_id=role_id,
        ip_address=request.client.host if request.client else None)
    return {"message": "Role updated"}


@router.delete("/{role_id}")
async def delete_role(
    role_id: int,
    request: Request,
    current_user: User = Depends(require_permission(P.ROLES_DELETE)),
    db: AsyncSession = Depends(get_db),
):
    role = (await db.execute(select(Role).where(Role.id == role_id))).scalars().first()
    if not role:
        raise HTTPException(404, "Role not found")
    if role.is_system:
        raise HTTPException(400, "Cannot delete system roles")

    await db.delete(role)
    await db.commit()
    await audit_service.log(db, action="role.deleted", user_id=current_user.id,
        username=current_user.username, resource_type="role", resource_id=role_id,
        ip_address=request.client.host if request.client else None)
    return {"message": "Role deleted"}


@router.put("/{role_id}/permissions")
async def assign_permissions(
    role_id: int,
    payload: AssignPermissionsSchema,
    request: Request,
    current_user: User = Depends(require_permission(P.PERMISSIONS_ASSIGN)),
    db: AsyncSession = Depends(get_db),
):
    role = (await db.execute(select(Role).where(Role.id == role_id))).scalars().first()
    if not role:
        raise HTTPException(404, "Role not found")
    if role.slug == "super_admin" and not current_user.is_superuser:
        raise HTTPException(403, "Cannot modify Super Admin permissions")

    await rbac_service.assign_permissions_to_role(db, role_id, payload.permission_ids)
    await audit_service.log(db, action="role.permissions_updated", user_id=current_user.id,
        username=current_user.username, resource_type="role", resource_id=role_id,
        details={"permission_ids": payload.permission_ids},
        ip_address=request.client.host if request.client else None)
    return {"message": "Permissions assigned"}


@router.post("/{role_id}/clone", status_code=201)
async def clone_role(
    role_id: int,
    payload: CloneRoleSchema,
    request: Request,
    current_user: User = Depends(require_permission(P.ROLES_CREATE)),
    db: AsyncSession = Depends(get_db),
):
    source = (await db.execute(select(Role).where(Role.id == role_id))).scalars().first()
    if not source:
        raise HTTPException(404, "Source role not found")

    slug = payload.slug.lower().replace(" ", "_")
    if (await db.execute(select(Role).where(Role.slug == slug))).scalars().first():
        raise HTTPException(400, "Role slug already exists")

    new_role = Role(
        name=payload.name,
        slug=slug,
        description=payload.description or f"Cloned from {source.name}",
    )
    db.add(new_role)
    await db.flush()

    # Copy permissions from source
    source_perms = (await db.execute(
        select(RolePermission).where(RolePermission.role_id == role_id)
    )).scalars().all()
    for rp in source_perms:
        db.add(RolePermission(role_id=new_role.id, permission_id=rp.permission_id))

    await db.commit()
    await db.refresh(new_role)
    await audit_service.log(db, action="role.cloned", user_id=current_user.id,
        username=current_user.username, resource_type="role", resource_id=new_role.id,
        details={"source_role_id": role_id, "new_slug": slug},
        ip_address=request.client.host if request.client else None)
    return {"id": new_role.id, "name": new_role.name, "slug": new_role.slug}
