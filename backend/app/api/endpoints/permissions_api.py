from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from ...core.database import get_db
from ...core.permissions import require_permission, P
from ...models.user import User
from ...services import rbac_service

router = APIRouter(prefix="/admin/permissions", tags=["Permissions"])


@router.get("")
async def list_permissions(
    current_user: User = Depends(require_permission(P.PERMISSIONS_VIEW)),
    db: AsyncSession = Depends(get_db),
):
    """Return all permissions grouped by module."""
    grouped = await rbac_service.get_all_permissions_grouped(db)
    return {"permissions": grouped}
