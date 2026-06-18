import asyncio
import os
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker
from sqlalchemy import select
from src.models.personal_db import PersonalDB, Base

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql+asyncpg://admin:admin123@localhost:5432/asdf_db")

async def seed_personal():
    print("Seeding personal data...")
    engine = create_async_engine(DATABASE_URL)
    async_session = async_sessionmaker(engine, expire_on_commit=False)

    sample_data = [
        {
            "nombre": "JUAN",
            "apellido1": "PEREZ",
            "rut": "12345678-K",
            "cargo": "Mecánico",
            "base": "Casa Matriz",
            "estado": True
        },
        {
            "nombre": "PEDRO",
            "apellido1": "GARCIA",
            "rut": "87654321-0",
            "cargo": "Mecánico",
            "base": "Antofagasta",
            "estado": True
        },
        {
            "nombre": "MARIA",
            "apellido1": "LOPEZ",
            "rut": "11223344-5",
            "cargo": "Supervisor",
            "base": "Calama",
            "estado": True
        }
    ]

    async with async_session() as session:
        for item in sample_data:
            # Check if exists
            stmt = select(PersonalDB).where(PersonalDB.rut == item["rut"])
            result = await session.execute(stmt)
            if not result.scalar_one_or_none():
                print(f"Creating personal: {item['nombre']} {item['apellido1']}")
                new_p = PersonalDB(**item)
                session.add(new_p)
            else:
                print(f"Personal already exists: {item['rut']}")
        
        await session.commit()
    print("Seeding complete.")

if __name__ == "__main__":
    asyncio.run(seed_personal())
