import asyncio
import sys
import os

# Ensure backend can be imported
sys.path.append(os.getcwd())

from app.core.database import AsyncSessionLocal
from app.models.user import User
from app.core.security import get_password_hash
from sqlalchemy.future import select

async def create_superuser():
    async with AsyncSessionLocal() as session:
        result = await session.execute(select(User).where(User.username == "admin"))
        user = result.scalars().first()
        
        if not user:
            print("Creating superuser 'admin'...")
            user = User(
                username="admin",
                hashed_password=get_password_hash("admin"), # Keeping it same since user asked for it, or we can change it.
                is_superuser=True
            )
            session.add(user)
            await session.commit()
            print("Superuser created.")
        else:
            print("Superuser 'admin' already exists.")

if __name__ == "__main__":
    asyncio.run(create_superuser())
