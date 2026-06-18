import asyncio
import os
from datetime import datetime, timedelta
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker
from sqlalchemy import select
from src.models.vehiculo_db import VehiculoDB
from src.models.mantencion_db import MantencionDB
from src.models.base import Base

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql+asyncpg://admin:admin123@localhost:5432/asdf_db")

async def seed_mantenciones():
    print("Seeding test mantenciones...")
    engine = create_async_engine(DATABASE_URL)
    async_session = async_sessionmaker(engine, expire_on_commit=False)

    async with async_session() as session:
        # Get first 5 vehicles
        stmt = select(VehiculoDB).limit(5)
        result = await session.execute(stmt)
        vehiculos = result.scalars().all()

        if not vehiculos:
            print("No vehicles found to seed mantenciones.")
            return

        for i, v in enumerate(vehiculos):
            # Create a "Completada" maintenance in the past
            past_m = MantencionDB(
                vehiculo_id=v.id,
                mecanico_id=(i % 3) + 1,
                tipo="Preventiva",
                fecha=datetime.utcnow() - timedelta(days=60),
                fecha_ingreso=datetime.utcnow() - timedelta(days=60, hours=4),
                fecha_salida=datetime.utcnow() - timedelta(days=60),
                odometro=100000 + (i * 1000), 
                tareas="Cambio de aceite, Filtros",
                estado="Completada"
            )
            session.add(past_m)

            # Create a "Pendiente" maintenance for some
            if i % 2 == 0:
                pend_m = MantencionDB(
                    vehiculo_id=v.id,
                    mecanico_id=(i % 3) + 1,
                    tipo="Correctiva",
                    fecha=datetime.utcnow(),
                    fecha_programada=datetime.utcnow() + timedelta(days=1),
                    odometro=None,
                    tareas="Revisión de frenos",
                    estado="Pendiente"
                )
                session.add(pend_m)

        await session.commit()
    print("Maintenance seeding complete.")

if __name__ == "__main__":
    asyncio.run(seed_mantenciones())
