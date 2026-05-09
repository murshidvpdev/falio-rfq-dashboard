"""Replace extra_fields JSON with proper document columns

Revision ID: g1h2i3j4k5l6
Revises: f1a2b3c4d5e6
Create Date: 2026-05-09
"""
from typing import Sequence, Union
from alembic import op

revision: str = 'g1h2i3j4k5l6'
down_revision: Union[str, Sequence[str], None] = 'f1a2b3c4d5e6'
branch_labels = None
depends_on = None

NEW_COLS = [
    ("rfq_case_id",  "VARCHAR"),
    ("owner",        "VARCHAR"),
    ("address",      "VARCHAR"),
    ("event_type",   "VARCHAR"),
    ("commodity",    "TEXT"),
    ("response_id",  "VARCHAR"),
    ("po_id",        "VARCHAR"),
    ("po_number",    "VARCHAR"),
    ("agreement_no", "VARCHAR"),
    ("contact",      "VARCHAR"),
    ("phone",        "VARCHAR"),
    ("email",        "VARCHAR"),
]


def upgrade() -> None:
    for col, typ in NEW_COLS:
        op.execute(f"ALTER TABLE documents ADD COLUMN IF NOT EXISTS {col} {typ}")
    op.execute("CREATE INDEX IF NOT EXISTS ix_documents_rfq_case_id ON documents (rfq_case_id)")


def downgrade() -> None:
    op.execute("DROP INDEX IF EXISTS ix_documents_rfq_case_id")
    for col, _ in NEW_COLS:
        op.execute(f"ALTER TABLE documents DROP COLUMN IF EXISTS {col}")
