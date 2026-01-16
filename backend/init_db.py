import asyncio
from app.core.database import engine
from app.core.models import Base
from app.models import user, file

async def init_models():
    async with engine.begin() as conn:
        # await conn.run_sync(Base.metadata.drop_all) # Optional: Drop all to ensure clean state if schema changed greatly, but CAREFUL with data loss. 
        # Actually user has data. I should NOT drop_all.
        # Just create_all.
        await conn.run_sync(Base.metadata.create_all)
    print("Tables created successfully.")

if __name__ == "__main__":
    asyncio.run(init_models())
