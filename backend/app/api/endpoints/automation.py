from fastapi import APIRouter
from app.services.automation import automator

router = APIRouter()

@router.post("/start")
async def start_automation():
    await automator.start()
    return {"status": "started", "running": True}

@router.post("/stop")
async def stop_automation():
    automator.stop()
    return {"status": "stopped", "running": False}

@router.get("/status")
async def get_status():
    return {"running": automator.is_running}

from sqlalchemy.future import select
from fastapi import Depends
from app.core.database import get_db
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.file import ProcessedFile

@router.get("/files")
async def get_files(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(ProcessedFile).order_by(ProcessedFile.uploaded_at.desc()))
    files = result.scalars().all()
    return files
