from sqlalchemy import Column, Integer, String, DateTime, Boolean
from sqlalchemy.sql import func
from ..core.models import Base

class ProcessedFile(Base):
    __tablename__ = "processed_files"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String, index=True)
    uploaded_at = Column(DateTime(timezone=True), server_default=func.now())
    completed_at = Column(DateTime(timezone=True), nullable=True)
    processed_time = Column(String, nullable=True) # Duration string e.g., "00:00:01"
    status = Column(String, default="Pending") # Complete, Exception, Processing
    validation = Column(Boolean, default=False)
