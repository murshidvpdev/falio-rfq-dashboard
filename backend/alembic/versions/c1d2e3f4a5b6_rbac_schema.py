"""RBAC schema — roles, permissions, user_roles, role_permissions, audit_logs

Revision ID: c1d2e3f4a5b6
Revises: 0ae6e699a4e1
Create Date: 2026-05-09
"""
from typing import Sequence, Union
from alembic import op

revision: str = 'c1d2e3f4a5b6'
down_revision: Union[str, Sequence[str], None] = '0ae6e699a4e1'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # ── Extend users ──────────────────────────────────────────────────────────
    op.execute("""
        ALTER TABLE users
        ADD COLUMN IF NOT EXISTS last_login TIMESTAMP WITH TIME ZONE
    """)

    # ── Roles ─────────────────────────────────────────────────────────────────
    op.execute("""
        CREATE TABLE IF NOT EXISTS roles (
            id          SERIAL PRIMARY KEY,
            name        VARCHAR(100) NOT NULL UNIQUE,
            slug        VARCHAR(100) NOT NULL UNIQUE,
            description TEXT,
            is_active   BOOLEAN NOT NULL DEFAULT true,
            is_system   BOOLEAN NOT NULL DEFAULT false,
            created_at  TIMESTAMP WITH TIME ZONE DEFAULT now(),
            updated_at  TIMESTAMP WITH TIME ZONE
        )
    """)
    op.execute("CREATE INDEX IF NOT EXISTS ix_roles_slug ON roles (slug)")

    # ── Permissions ───────────────────────────────────────────────────────────
    op.execute("""
        CREATE TABLE IF NOT EXISTS permissions (
            id          SERIAL PRIMARY KEY,
            name        VARCHAR(200) NOT NULL,
            slug        VARCHAR(200) NOT NULL UNIQUE,
            description TEXT,
            module      VARCHAR(100) NOT NULL,
            action      VARCHAR(100) NOT NULL,
            created_at  TIMESTAMP WITH TIME ZONE DEFAULT now()
        )
    """)
    op.execute("CREATE INDEX IF NOT EXISTS ix_permissions_slug   ON permissions (slug)")
    op.execute("CREATE INDEX IF NOT EXISTS ix_permissions_module ON permissions (module)")

    # ── UserRoles ─────────────────────────────────────────────────────────────
    op.execute("""
        CREATE TABLE IF NOT EXISTS user_roles (
            id          SERIAL PRIMARY KEY,
            user_id     INTEGER NOT NULL REFERENCES users(id)       ON DELETE CASCADE,
            role_id     INTEGER NOT NULL REFERENCES roles(id)       ON DELETE CASCADE,
            assigned_by INTEGER          REFERENCES users(id)       ON DELETE SET NULL,
            assigned_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
            CONSTRAINT uq_user_role UNIQUE (user_id, role_id)
        )
    """)
    op.execute("CREATE INDEX IF NOT EXISTS ix_user_roles_user_id ON user_roles (user_id)")
    op.execute("CREATE INDEX IF NOT EXISTS ix_user_roles_role_id ON user_roles (role_id)")

    # ── RolePermissions ───────────────────────────────────────────────────────
    op.execute("""
        CREATE TABLE IF NOT EXISTS role_permissions (
            id            SERIAL PRIMARY KEY,
            role_id       INTEGER NOT NULL REFERENCES roles(id)       ON DELETE CASCADE,
            permission_id INTEGER NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
            assigned_at   TIMESTAMP WITH TIME ZONE DEFAULT now(),
            CONSTRAINT uq_role_permission UNIQUE (role_id, permission_id)
        )
    """)
    op.execute("CREATE INDEX IF NOT EXISTS ix_role_permissions_role_id       ON role_permissions (role_id)")
    op.execute("CREATE INDEX IF NOT EXISTS ix_role_permissions_permission_id ON role_permissions (permission_id)")

    # ── AuditLogs ─────────────────────────────────────────────────────────────
    op.execute("""
        CREATE TABLE IF NOT EXISTS audit_logs (
            id            SERIAL PRIMARY KEY,
            user_id       INTEGER REFERENCES users(id) ON DELETE SET NULL,
            username      VARCHAR(200),
            action        VARCHAR(200) NOT NULL,
            resource_type VARCHAR(100),
            resource_id   VARCHAR(100),
            details       TEXT,
            ip_address    VARCHAR(100),
            created_at    TIMESTAMP WITH TIME ZONE DEFAULT now()
        )
    """)
    op.execute("CREATE INDEX IF NOT EXISTS ix_audit_logs_user_id    ON audit_logs (user_id)")
    op.execute("CREATE INDEX IF NOT EXISTS ix_audit_logs_action     ON audit_logs (action)")
    op.execute("CREATE INDEX IF NOT EXISTS ix_audit_logs_created_at ON audit_logs (created_at)")


def downgrade() -> None:
    op.execute("DROP TABLE IF EXISTS audit_logs")
    op.execute("DROP TABLE IF EXISTS role_permissions")
    op.execute("DROP TABLE IF EXISTS user_roles")
    op.execute("DROP TABLE IF EXISTS permissions")
    op.execute("DROP TABLE IF EXISTS roles")
    op.execute("ALTER TABLE users DROP COLUMN IF EXISTS last_login")
