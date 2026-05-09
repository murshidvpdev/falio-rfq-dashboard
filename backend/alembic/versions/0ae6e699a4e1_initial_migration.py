"""Initial migration

Revision ID: 0ae6e699a4e1
Revises:
Create Date: 2026-01-16 01:47:38.737313
"""
from typing import Sequence, Union
from alembic import op

revision: str = '0ae6e699a4e1'
down_revision: Union[str, Sequence[str], None] = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            username VARCHAR UNIQUE,
            hashed_password VARCHAR,
            is_active BOOLEAN DEFAULT true,
            is_superuser BOOLEAN DEFAULT false
        )
    """)
    op.execute("CREATE INDEX IF NOT EXISTS ix_users_id ON users (id)")
    op.execute("CREATE UNIQUE INDEX IF NOT EXISTS ix_users_username ON users (username)")


def downgrade() -> None:
    op.execute("DROP INDEX IF EXISTS ix_users_username")
    op.execute("DROP INDEX IF EXISTS ix_users_id")
    op.execute("DROP TABLE IF EXISTS users")
