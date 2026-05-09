from sqlalchemy import Column, Integer, String, Float, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..core.models import Base


class Document(Base):
    __tablename__ = "documents"

    id                = Column(Integer, primary_key=True, index=True)
    original_filename = Column(String,  nullable=False)
    stored_filename   = Column(String,  nullable=False, unique=True)
    file_type         = Column(String,  nullable=True)
    file_size         = Column(Integer, nullable=True)
    status            = Column(String,  default="Processing")  # Processing | Completed | Failed
    error_message     = Column(Text,    nullable=True)

    uploaded_by  = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    uploaded_at  = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    processed_at = Column(DateTime(timezone=True), nullable=True)

    # ── Core extracted fields (indexed, queryable) ────────────────────────────
    rfq_number       = Column(String, nullable=True, index=True)
    rfq_case_id      = Column(String, nullable=True, index=True)  # e.g. 54010
    account          = Column(String, nullable=True)              # company / customer
    owner            = Column(String, nullable=True)              # contact person
    supplier         = Column(String, nullable=True)
    address          = Column(String, nullable=True)
    event_type       = Column(String, nullable=True)
    commodity        = Column(Text,   nullable=True)
    issue_date       = Column(String, nullable=True)              # Publish / Received date
    due_date         = Column(String, nullable=True)              # Bid / Closing date
    currency         = Column(String, default="SAR")
    total_amount     = Column(Float,  nullable=True)
    total_line_items = Column(Integer, default=0)

    # ── Secondary fields (proper columns, no JSON) ────────────────────────────
    response_id  = Column(String, nullable=True)
    po_id        = Column(String, nullable=True)
    po_number    = Column(String, nullable=True)
    agreement_no = Column(String, nullable=True)
    contact      = Column(String, nullable=True)
    phone        = Column(String, nullable=True)
    email        = Column(String, nullable=True)

    uploader   = relationship("User")
    line_items = relationship(
        "DocumentLineItem", back_populates="document",
        cascade="all, delete-orphan", order_by="DocumentLineItem.id"
    )


class DocumentLineItem(Base):
    __tablename__ = "document_line_items"

    id          = Column(Integer, primary_key=True, index=True)
    document_id = Column(Integer, ForeignKey("documents.id", ondelete="CASCADE"), nullable=False, index=True)
    item_no     = Column(String,  nullable=True)
    description = Column(Text,    nullable=True)
    part_number = Column(String,  nullable=True)
    quantity    = Column(Float,   nullable=True)
    unit        = Column(String,  nullable=True)
    unit_price  = Column(Float,   nullable=True)
    total_price = Column(Float,   nullable=True)
    notes       = Column(Text,    nullable=True)

    document = relationship("Document", back_populates="line_items")
