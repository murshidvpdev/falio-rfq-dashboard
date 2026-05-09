from sqlalchemy import Column, Integer, String, DateTime, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..core.models import Base


class Permission(Base):
    __tablename__ = "permissions"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False)                       # "View Users"
    slug = Column(String(200), unique=True, nullable=False, index=True)  # "users.view"
    description = Column(Text, nullable=True)
    module = Column(String(100), nullable=False, index=True)         # "users"
    action = Column(String(100), nullable=False)                     # "view"
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    role_permissions = relationship("RolePermission", back_populates="permission")
