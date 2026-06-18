import asyncio
import os
import httpx
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker
from sqlalchemy import select
from src.models.vehiculo_db import VehiculoDB
from src.models.base import Base

SITRACK_URL = "https://externalappgw.cl.sitrack.com/v2/report"
SITRACK_AUTH = ("cfab0764fec4461cb4016b3a40299c84", "MT6359")
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql+asyncpg://admin:admin123@localhost:5432/asdf_db")

async def fetch_sitrack_data():
    async with httpx.AsyncClient() as client:
        resp = await client.get(SITRACK_URL, auth=SITRACK_AUTH, timeout=20.0)
        resp.raise_for_status()
        return resp.json()

async def seed_vehicles():
    print("Fetching data from Sitrack...")
    data = await fetch_sitrack_data()
    print(f"Received {len(data)} items.")

    engine = create_async_engine(DATABASE_URL)
    async_session = async_sessionmaker(engine, expire_on_commit=False)

    async with async_session() as session:
        for item in data:
            patente = item.get("assetName")
            device_id_raw = item.get("deviceId")
            device_id = int(device_id_raw) if device_id_raw else None
            modelo = "Camión Sitrack" # Default
            
            if not patente or not device_id:
                continue

            # Check if vehicle exists
            stmt = select(VehiculoDB).where(VehiculoDB.patente == patente)
            result = await session.execute(stmt)
            vehiculo = result.scalar_one_or_none()

            if vehiculo:
                print(f"Updating vehicle: {patente}")
                vehiculo.device_id = device_id
                # vehiculo.numero_interno = ... (if available in sitrack, but we don't know the field)
            else:
                print(f"Creating vehicle: {patente}")
                new_v = VehiculoDB(
                    patente=patente,
                    device_id=device_id,
                    modelo=modelo,
                    estado="Disponible"
                )
                session.add(new_v)

        await session.commit()
    print("Seeding complete.")

if __name__ == "__main__":
    asyncio.run(seed_vehicles())
