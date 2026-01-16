from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .api.endpoints import auth, dashboard, automation

from .core.database import engine
from .core.models import Base
from .models import user, file # Import models to register them with Base

app = FastAPI(title="RFQ Dashboard Backend")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth.router, tags=["Authentication"])
app.include_router(dashboard.router, tags=["Dashboard"])
app.include_router(automation.router, prefix="/automation", tags=["Automation"])

@app.get("/")
def read_root():
    return {"message": "RFQ Dashboard Backend is running"}
