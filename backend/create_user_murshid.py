import asyncio
import sys
import os

# Ensure backend can be imported
sys.path.append(os.getcwd())

from app.core.database import AsyncSessionLocal
from app.models.user import User
from app.core.security import get_password_hash
from sqlalchemy.future import select

async def create_user_murshid():
    async with AsyncSessionLocal() as session:
        result = await session.execute(select(User).where(User.username == "murshid"))
        user = result.scalars().first()
        
        if not user:
            print("Creating user 'murshid'...")
            user = User(
                username="murshid",
                hashed_password=get_password_hash("admin"), 
                is_superuser=True
            )
            session.add(user)
            await session.commit()
            print("User 'murshid' created with password 'admin'.")
        else:
            print("User 'murshid' already exists.")

if __name__ == "__main__":
    asyncio.run(create_user_murshid())
