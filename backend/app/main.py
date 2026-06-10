from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .api.endpoints import auth, dashboard, automation
from .api.endpoints import users as users_mgmt
from .api.endpoints import roles as roles_mgmt
from .api.endpoints import permissions_api
from .api.endpoints import documents as documents_api

from .core.config import settings
from .core.database import engine
from .core.models import Base
from .models import user, file, role, permission, associations, audit_log, document  # register with Base

app = FastAPI(title="Falio RFQ Dashboard API", version="2.0.0")

# ── CORS ───────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ────────────────────────────────────────────────────────────────────
app.include_router(auth.router,             tags=["Authentication"])
app.include_router(dashboard.router,        tags=["Dashboard"])
app.include_router(automation.router,       prefix="/automation",      tags=["Automation"])
app.include_router(users_mgmt.router,                                  tags=["User Management"])
app.include_router(roles_mgmt.router,                                  tags=["Role Management"])
app.include_router(permissions_api.router,                             tags=["Permissions"])
app.include_router(documents_api.router,                               tags=["Documents"])


@app.get("/")
def read_root():
    return {"message": "Falio RFQ Dashboard API is running", "version": "2.0.0"}
