from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..core.models import Base


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    username = Column(String(200), nullable=True)       # Denormalised — survives user deletion
    action = Column(String(200), nullable=False, index=True)   # "user.created", "role.assigned"
    resource_type = Column(String(100), nullable=True)  # "user", "role", "permission"
    resource_id = Column(String(100), nullable=True)
    details = Column(Text, nullable=True)               # JSON payload
    ip_address = Column(String(100), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)

    user = relationship("User", back_populates="audit_logs")
