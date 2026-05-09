"""
Permission slug constants, permission catalogue, default role mappings,
and the require_permission() FastAPI dependency factory.
"""
from fastapi import Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from .database import get_db


# ── Permission slug constants ──────────────────────────────────────────────────

class P:
    # Users
    USERS_VIEW         = "users.view"
    USERS_CREATE       = "users.create"
    USERS_EDIT         = "users.edit"
    USERS_DELETE       = "users.delete"
    USERS_MANAGE_ROLES = "users.manage_roles"

    # Roles
    ROLES_VIEW   = "roles.view"
    ROLES_CREATE = "roles.create"
    ROLES_EDIT   = "roles.edit"
    ROLES_DELETE = "roles.delete"

    # Permissions
    PERMISSIONS_VIEW   = "permissions.view"
    PERMISSIONS_ASSIGN = "permissions.assign"

    # Dashboard
    DASHBOARD_VIEW      = "dashboard.view"
    DASHBOARD_ANALYTICS = "dashboard.analytics"

    # Data
    DATA_VIEW   = "data.view"
    DATA_CREATE = "data.create"
    DATA_EDIT   = "data.edit"
    DATA_DELETE = "data.delete"
    DATA_APPROVE = "data.approve"
    DATA_REJECT  = "data.reject"
    DATA_EXPORT  = "data.export"

    # Reports
    REPORTS_VIEW   = "reports.view"
    REPORTS_EXPORT = "reports.export"

    # Settings
    SETTINGS_MANAGE = "settings.manage"

    # Files / Documents
    FILES_UPLOAD = "files.upload"
    FILES_VIEW   = "files.view"
    FILES_DELETE = "files.delete"


# ── Full permission catalogue ──────────────────────────────────────────────────

ALL_PERMISSIONS = [
    # Users
    {"name": "View Users",        "slug": P.USERS_VIEW,         "module": "users",       "action": "view",         "description": "List and view user profiles"},
    {"name": "Create Users",      "slug": P.USERS_CREATE,       "module": "users",       "action": "create",       "description": "Register new user accounts"},
    {"name": "Edit Users",        "slug": P.USERS_EDIT,         "module": "users",       "action": "edit",         "description": "Update existing user accounts"},
    {"name": "Delete Users",      "slug": P.USERS_DELETE,       "module": "users",       "action": "delete",       "description": "Remove user accounts"},
    {"name": "Manage User Roles", "slug": P.USERS_MANAGE_ROLES, "module": "users",       "action": "manage_roles", "description": "Assign and revoke roles"},
    # Roles
    {"name": "View Roles",        "slug": P.ROLES_VIEW,         "module": "roles",       "action": "view",         "description": "List and inspect roles"},
    {"name": "Create Roles",      "slug": P.ROLES_CREATE,       "module": "roles",       "action": "create",       "description": "Define new roles"},
    {"name": "Edit Roles",        "slug": P.ROLES_EDIT,         "module": "roles",       "action": "edit",         "description": "Modify role metadata"},
    {"name": "Delete Roles",      "slug": P.ROLES_DELETE,       "module": "roles",       "action": "delete",       "description": "Remove non-system roles"},
    # Permissions
    {"name": "View Permissions",  "slug": P.PERMISSIONS_VIEW,   "module": "permissions", "action": "view",         "description": "See the permission catalogue"},
    {"name": "Assign Permissions","slug": P.PERMISSIONS_ASSIGN, "module": "permissions", "action": "assign",       "description": "Attach permissions to roles"},
    # Dashboard
    {"name": "View Dashboard",    "slug": P.DASHBOARD_VIEW,     "module": "dashboard",   "action": "view",         "description": "Access main dashboard"},
    {"name": "Dashboard Analytics","slug": P.DASHBOARD_ANALYTICS,"module": "dashboard",  "action": "analytics",    "description": "View advanced analytics panels"},
    # Data
    {"name": "View Data",         "slug": P.DATA_VIEW,          "module": "data",        "action": "view",         "description": "Read data records"},
    {"name": "Create Data",       "slug": P.DATA_CREATE,        "module": "data",        "action": "create",       "description": "Submit new data records"},
    {"name": "Edit Data",         "slug": P.DATA_EDIT,          "module": "data",        "action": "edit",         "description": "Modify existing records"},
    {"name": "Delete Data",       "slug": P.DATA_DELETE,        "module": "data",        "action": "delete",       "description": "Remove data records"},
    {"name": "Approve Data",      "slug": P.DATA_APPROVE,       "module": "data",        "action": "approve",      "description": "Mark records as approved"},
    {"name": "Reject Data",       "slug": P.DATA_REJECT,        "module": "data",        "action": "reject",       "description": "Mark records as rejected"},
    {"name": "Export Data",       "slug": P.DATA_EXPORT,        "module": "data",        "action": "export",       "description": "Download data exports"},
    # Reports
    {"name": "View Reports",      "slug": P.REPORTS_VIEW,       "module": "reports",     "action": "view",         "description": "View generated reports"},
    {"name": "Export Reports",    "slug": P.REPORTS_EXPORT,     "module": "reports",     "action": "export",       "description": "Download reports"},
    # Settings
    {"name": "Manage Settings",   "slug": P.SETTINGS_MANAGE,   "module": "settings",    "action": "manage",       "description": "Configure system settings"},
    # Files
    {"name": "Upload Files",      "slug": P.FILES_UPLOAD,      "module": "files",       "action": "upload",       "description": "Upload documents for data extraction"},
    {"name": "View Files",        "slug": P.FILES_VIEW,        "module": "files",       "action": "view",         "description": "View and search uploaded documents"},
    {"name": "Delete Files",      "slug": P.FILES_DELETE,      "module": "files",       "action": "delete",       "description": "Delete uploaded documents"},
]


# ── Default role definitions ───────────────────────────────────────────────────

DEFAULT_ROLES = [
    {"name": "Super Admin", "slug": "super_admin", "description": "Full unrestricted system access",           "is_system": True},
    {"name": "Admin",       "slug": "admin",       "description": "Administrative access with user management","is_system": True},
    {"name": "Manager",     "slug": "manager",     "description": "Operational management with approvals",     "is_system": False},
    {"name": "Checker",     "slug": "checker",     "description": "Data validation and approval",             "is_system": False},
    {"name": "Data Entry",  "slug": "data_entry",  "description": "Create and edit data records",             "is_system": False},
    {"name": "Viewer",      "slug": "viewer",      "description": "Read-only access",                         "is_system": False},
]

from typing import Union as _Union
DEFAULT_ROLE_PERMISSIONS: dict[str, _Union[str, list[str]]] = {
    "super_admin": "*",
    "admin": [
        P.USERS_VIEW, P.USERS_CREATE, P.USERS_EDIT, P.USERS_MANAGE_ROLES,
        P.ROLES_VIEW, P.PERMISSIONS_VIEW,
        P.DASHBOARD_VIEW, P.DASHBOARD_ANALYTICS,
        P.DATA_VIEW, P.DATA_CREATE, P.DATA_EDIT, P.DATA_EXPORT,
        P.REPORTS_VIEW, P.REPORTS_EXPORT,
        P.FILES_UPLOAD, P.FILES_VIEW, P.FILES_DELETE,
    ],
    "manager": [
        P.USERS_VIEW,
        P.DASHBOARD_VIEW, P.DASHBOARD_ANALYTICS,
        P.DATA_VIEW, P.DATA_CREATE, P.DATA_EDIT,
        P.DATA_APPROVE, P.DATA_REJECT, P.DATA_EXPORT,
        P.REPORTS_VIEW, P.REPORTS_EXPORT,
        P.FILES_UPLOAD, P.FILES_VIEW, P.FILES_DELETE,
    ],
    "checker": [
        P.DASHBOARD_VIEW,
        P.DATA_VIEW, P.DATA_APPROVE, P.DATA_REJECT,
        P.REPORTS_VIEW,
        P.FILES_UPLOAD, P.FILES_VIEW,
    ],
    "data_entry": [
        P.DASHBOARD_VIEW,
        P.DATA_VIEW, P.DATA_CREATE, P.DATA_EDIT,
    ],
    "viewer": [
        P.DASHBOARD_VIEW,
        P.DATA_VIEW,
        P.REPORTS_VIEW,
    ],
}


# ── Dependency factory ─────────────────────────────────────────────────────────

def require_permission(*required_slugs: str):
    """
    FastAPI dependency factory. Accepts one or more permission slugs.
    Super Admin (is_superuser=True) bypasses all permission checks.

    Usage:
        current_user: User = Depends(require_permission(P.USERS_VIEW))
        current_user: User = Depends(require_permission(P.DATA_VIEW, P.DATA_EDIT))
    """
    return _make_guard(required_slugs)


def _make_guard(required_slugs: tuple[str, ...]):
    from fastapi.security import OAuth2PasswordBearer
    oauth2 = OAuth2PasswordBearer(tokenUrl="token")

    async def guard(
        token: str = Depends(oauth2),
        db: AsyncSession = Depends(get_db),
    ):
        from ..services import rbac_service
        from ..core.security import verify_token
        from ..models.user import User
        from sqlalchemy.future import select

        username = verify_token(token)
        if not username:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

        result = await db.execute(select(User).where(User.username == username))
        user = result.scalars().first()
        if not user:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
        if not user.is_active:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account is inactive")

        # Super Admin bypasses everything
        if user.is_superuser:
            return user

        user_perms = await rbac_service.get_user_permission_slugs(db, user.id)
        missing = [s for s in required_slugs if s not in user_perms]
        if missing:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Missing permissions: {', '.join(missing)}",
            )
        return user

    return guard
