import json
from typing import Any, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from ..models.audit_log import AuditLog


async def log(
    db: AsyncSession,
    action: str,
    *,
    user_id: Optional[int] = None,
    username: Optional[str] = None,
    resource_type: Optional[str] = None,
    resource_id: Optional[Any] = None,
    details: Optional[Any] = None,
    ip_address: Optional[str] = None,
) -> None:
    entry = AuditLog(
        user_id=user_id,
        username=username,
        action=action,
        resource_type=resource_type,
        resource_id=str(resource_id) if resource_id is not None else None,
        details=json.dumps(details) if details is not None else None,
        ip_address=ip_address,
    )
    db.add(entry)
    # Use a separate flush so this doesn't block the main request commit
    await db.commit()
