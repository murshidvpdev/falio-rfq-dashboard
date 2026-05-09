"""Add extra_fields column to documents

Revision ID: f1a2b3c4d5e6
Revises: e1f2a3b4c5d6
Create Date: 2026-05-09
"""
from typing import Sequence, Union
from alembic import op

revision: str = 'f1a2b3c4d5e6'
down_revision: Union[str, Sequence[str], None] = 'e1f2a3b4c5d6'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute("ALTER TABLE documents ADD COLUMN IF NOT EXISTS extra_fields TEXT")


def downgrade() -> None:
    op.execute("ALTER TABLE documents DROP COLUMN IF EXISTS extra_fields")
