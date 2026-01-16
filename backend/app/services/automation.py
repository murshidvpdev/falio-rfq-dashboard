import os
import shutil
import time
import asyncio
from datetime import datetime
from pathlib import Path
from app.core.database import AsyncSessionLocal
from app.models.file import ProcessedFile

# Paths
BASE_DIR = Path(__file__).resolve().parent.parent.parent / "files"
SOURCE_DIR = BASE_DIR / "source"
PROCESSED_DIR = BASE_DIR / "processed"
EXCEPTION_DIR = BASE_DIR / "exception"

class FileAutomator:
    def __init__(self):
        self.is_running = False
        self._ensure_directories()

    def _ensure_directories(self):
        SOURCE_DIR.mkdir(parents=True, exist_ok=True)
        PROCESSED_DIR.mkdir(parents=True, exist_ok=True)
        EXCEPTION_DIR.mkdir(parents=True, exist_ok=True)

    async def start(self):
        if self.is_running:
            return
        self.is_running = True
        print("Automation started...")
        asyncio.create_task(self._process_loop())

    def stop(self):
        print("Automation stopping...")
        self.is_running = False

    async def _process_loop(self):
        while self.is_running:
            try:
                await self._process_files()
            except Exception as e:
                print(f"Error in automation loop: {e}")
            
            await asyncio.sleep(2) # Poll every 2 seconds

    async def _process_files(self):
        files = list(SOURCE_DIR.glob("*"))
        for file_path in files:
            if not self.is_running:
                break
            
            if file_path.is_file():
                try:
                    print(f"Processing {file_path.name}...")
                    # Simulate processing time
                    await asyncio.sleep(1)
                    
                    # Logic: if filename contains "error", move to exception, else process
                    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
                    new_name = f"{file_path.stem}_{timestamp}{file_path.suffix}"
                    
                    status_str = "Complete"
                    destination_dir = PROCESSED_DIR
                    
                    if "error" in file_path.name.lower():
                        status_str = "Exception"
                        destination_dir = EXCEPTION_DIR
                    
                    target = destination_dir / new_name
                    shutil.move(str(file_path), str(target))
                    print(f"Moved to {status_str}: {target}")

                    # Save to DB
                    print(f"Saving to DB: {file_path.name}")
                    async with AsyncSessionLocal() as session:
                        print("Session opened")
                        new_record = ProcessedFile(
                            filename=file_path.name,
                            completed_at=datetime.utcnow(),
                            processed_time="00:00:01",
                            status=status_str,
                            validation=(status_str == "Complete")
                        )
                        session.add(new_record)
                        await session.commit()
                        print("Saved to DB")

                except Exception as e:
                    print(f"Failed to process {file_path.name}: {e}")

automator = FileAutomator()
