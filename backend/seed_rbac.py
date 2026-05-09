"""
RBAC Seeder — run once after applying migrations.

Creates:
  - All permission definitions
  - Default roles (super_admin, admin, manager, checker, data_entry, viewer)
  - Default permission assignments per role
  - A superadmin user if none exists

Usage:
    cd backend
    python seed_rbac.py

Default super admin credentials:
    username : superadmin
    password : Admin@1234!
    ⚠  Change this password immediately after first login.
"""
import asyncio
import sys
import os

sys.path.insert(0, os.path.dirname(__file__))

from app.core.database import AsyncSessionLocal, engine
from app.core.models import Base
from app.core.security import get_password_hash
from app.core.permissions import ALL_PERMISSIONS, DEFAULT_ROLES, DEFAULT_ROLE_PERMISSIONS
from app.models.user import User
from app.models.role import Role
from app.models.permission import Permission
from app.models.associations import UserRole, RolePermission
from app.models import file as _file  # ensure ProcessedFile registered
from sqlalchemy.future import select


async def seed():
    print("── Creating tables ──────────────────────────────────────────")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as db:

        # ── Permissions ───────────────────────────────────────────────────────
        print("── Seeding permissions ──────────────────────────────────────")
        perm_map: dict[str, Permission] = {}
        for pd in ALL_PERMISSIONS:
            existing = (await db.execute(
                select(Permission).where(Permission.slug == pd["slug"])
            )).scalars().first()
            if not existing:
                p = Permission(**pd)
                db.add(p)
                await db.flush()
                perm_map[pd["slug"]] = p
                print(f"  + {pd['slug']}")
            else:
                perm_map[pd["slug"]] = existing

        await db.commit()

        # Reload to get IDs for any that already existed
        for row in (await db.execute(select(Permission))).scalars().all():
            perm_map[row.slug] = row

        # ── Roles ─────────────────────────────────────────────────────────────
        print("── Seeding roles ────────────────────────────────────────────")
        role_map: dict[str, Role] = {}
        for rd in DEFAULT_ROLES:
            existing = (await db.execute(
                select(Role).where(Role.slug == rd["slug"])
            )).scalars().first()
            if not existing:
                r = Role(**rd)
                db.add(r)
                await db.flush()
                role_map[rd["slug"]] = r
                print(f"  + {rd['slug']}")
            else:
                role_map[rd["slug"]] = existing

        await db.commit()

        for row in (await db.execute(select(Role))).scalars().all():
            role_map[row.slug] = row

        # ── Role → permission assignments ─────────────────────────────────────
        print("── Assigning permissions to roles ───────────────────────────")
        all_perm_ids = [p.id for p in perm_map.values()]

        for role_slug, perms in DEFAULT_ROLE_PERMISSIONS.items():
            if role_slug not in role_map:
                continue
            r = role_map[role_slug]
            # Clear existing
            await db.execute(
                __import__("sqlalchemy", fromlist=["delete"]).delete(RolePermission)
                .where(RolePermission.role_id == r.id)
            )
            ids = all_perm_ids if perms == "*" else [
                perm_map[s].id for s in perms if s in perm_map
            ]
            for pid in ids:
                db.add(RolePermission(role_id=r.id, permission_id=pid))
            print(f"  {role_slug}: {len(ids)} permissions")

        await db.commit()

        # ── Super admin user ──────────────────────────────────────────────────
        print("── Super admin user ─────────────────────────────────────────")
        existing_sa = (await db.execute(
            select(User).where(User.is_superuser.is_(True))
        )).scalars().first()

        if not existing_sa:
            sa_user = User(
                username="superadmin",
                hashed_password=get_password_hash("Admin@1234!"),
                is_active=True,
                is_superuser=True,
            )
            db.add(sa_user)
            await db.flush()
            print("  Created user: superadmin")
        else:
            sa_user = existing_sa
            print(f"  Super admin already exists: {sa_user.username}")

        # Assign super_admin role to all is_superuser users
        if "super_admin" in role_map:
            sa_role_id = role_map["super_admin"].id
            all_sa_users = (await db.execute(
                select(User).where(User.is_superuser.is_(True))
            )).scalars().all()
            for u in all_sa_users:
                has = (await db.execute(
                    select(UserRole).where(
                        UserRole.user_id == u.id, UserRole.role_id == sa_role_id
                    )
                )).scalars().first()
                if not has:
                    db.add(UserRole(user_id=u.id, role_id=sa_role_id))
                    print(f"  Assigned super_admin role → {u.username}")

        await db.commit()

    print("\n✓ Seed complete.")
    print("  Super Admin  →  username: superadmin  |  password: Admin@1234!")
    print("  ⚠  Change the password immediately after first login.\n")


if __name__ == "__main__":
    asyncio.run(seed())
