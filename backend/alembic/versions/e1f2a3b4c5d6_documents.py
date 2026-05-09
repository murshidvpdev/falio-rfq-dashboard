"""Documents and document_line_items tables

Revision ID: e1f2a3b4c5d6
Revises: c1d2e3f4a5b6
Create Date: 2026-05-09
"""
from typing import Sequence, Union
from alembic import op

revision: str = 'e1f2a3b4c5d6'
down_revision: Union[str, Sequence[str], None] = 'c1d2e3f4a5b6'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute("""
        CREATE TABLE IF NOT EXISTS documents (
            id                 SERIAL PRIMARY KEY,
            original_filename  VARCHAR NOT NULL,
            stored_filename    VARCHAR NOT NULL UNIQUE,
            file_type          VARCHAR,
            file_size          INTEGER,
            status             VARCHAR DEFAULT 'Processing',
            error_message      TEXT,
            uploaded_by        INTEGER REFERENCES users(id) ON DELETE SET NULL,
            uploaded_at        TIMESTAMP WITH TIME ZONE DEFAULT now(),
            processed_at       TIMESTAMP WITH TIME ZONE,
            rfq_number         VARCHAR,
            account            VARCHAR,
            supplier           VARCHAR,
            issue_date         VARCHAR,
            due_date           VARCHAR,
            total_amount       DOUBLE PRECISION,
            currency           VARCHAR DEFAULT 'SAR',
            total_line_items   INTEGER DEFAULT 0
        )
    """)
    op.execute("CREATE INDEX IF NOT EXISTS ix_documents_uploaded_at ON documents (uploaded_at)")
    op.execute("CREATE INDEX IF NOT EXISTS ix_documents_rfq_number  ON documents (rfq_number)")

    op.execute("""
        CREATE TABLE IF NOT EXISTS document_line_items (
            id           SERIAL PRIMARY KEY,
            document_id  INTEGER NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
            item_no      VARCHAR,
            description  TEXT,
            part_number  VARCHAR,
            quantity     DOUBLE PRECISION,
            unit         VARCHAR,
            unit_price   DOUBLE PRECISION,
            total_price  DOUBLE PRECISION,
            notes        TEXT
        )
    """)
    op.execute("CREATE INDEX IF NOT EXISTS ix_document_line_items_document_id ON document_line_items (document_id)")


def downgrade() -> None:
    op.execute("DROP TABLE IF EXISTS document_line_items")
    op.execute("DROP TABLE IF EXISTS documents")
