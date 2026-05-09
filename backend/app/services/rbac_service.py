from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import delete
from typing import Optional

from ..models.user import User
from ..models.role import Role
from ..models.permission import Permission
from ..models.associations import UserRole, RolePermission


async def get_user_permission_slugs(db: AsyncSession, user_id: int) -> set[str]:
    """Return all permission slugs a user has via their active roles."""
    result = await db.execute(
        select(Permission.slug)
        .join(RolePermission, Permission.id == RolePermission.permission_id)
        .join(UserRole, RolePermission.role_id == UserRole.role_id)
        .join(Role, UserRole.role_id == Role.id)
        .where(UserRole.user_id == user_id)
        .where(Role.is_active.is_(True))
    )
    return {row[0] for row in result.fetchall()}


async def get_user_role_slugs(db: AsyncSession, user_id: int) -> list[str]:
    """Return list of role slugs assigned to a user."""
    result = await db.execute(
        select(Role.slug)
        .join(UserRole, Role.id == UserRole.role_id)
        .where(UserRole.user_id == user_id)
        .where(Role.is_active.is_(True))
    )
    return [row[0] for row in result.fetchall()]


async def get_user_role_ids(db: AsyncSession, user_id: int) -> list[int]:
    result = await db.execute(
        select(UserRole.role_id).where(UserRole.user_id == user_id)
    )
    return [row[0] for row in result.fetchall()]


async def assign_roles_to_user(
    db: AsyncSession,
    user_id: int,
    role_ids: list[int],
    assigned_by: Optional[int] = None,
) -> None:
    await db.execute(delete(UserRole).where(UserRole.user_id == user_id))
    for role_id in role_ids:
        db.add(UserRole(user_id=user_id, role_id=role_id, assigned_by=assigned_by))
    await db.commit()


async def assign_permissions_to_role(
    db: AsyncSession, role_id: int, permission_ids: list[int]
) -> None:
    await db.execute(delete(RolePermission).where(RolePermission.role_id == role_id))
    for pid in permission_ids:
        db.add(RolePermission(role_id=role_id, permission_id=pid))
    await db.commit()


async def get_all_permissions_grouped(db: AsyncSession) -> dict:
    """Return permissions keyed by module, sorted."""
    result = await db.execute(
        select(Permission).order_by(Permission.module, Permission.action)
    )
    grouped: dict[str, list] = {}
    for p in result.scalars().all():
        grouped.setdefault(p.module, []).append({
            "id": p.id,
            "name": p.name,
            "slug": p.slug,
            "description": p.description,
            "action": p.action,
        })
    return grouped


async def user_has_permission(
    db: AsyncSession, user_id: int, slug: str, is_superuser: bool = False
) -> bool:
    if is_superuser:
        return True
    slugs = await get_user_permission_slugs(db, user_id)
    return slug in slugs
