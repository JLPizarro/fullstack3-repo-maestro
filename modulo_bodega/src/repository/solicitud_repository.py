from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from src.models.solicitud_db import SolicitudBodegaDB

class SolicitudRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def create(self, solicitud: SolicitudBodegaDB) -> SolicitudBodegaDB:
        self.session.add(solicitud)
        await self.session.commit()
        await self.session.refresh(solicitud)
        return solicitud

    async def get_all(self) -> list[SolicitudBodegaDB]:
        result = await self.session.execute(select(SolicitudBodegaDB).order_by(SolicitudBodegaDB.fecha_solicitud.desc()))
        return result.scalars().all()

    async def get_by_id(self, id: int) -> SolicitudBodegaDB | None:
        return await self.session.get(SolicitudBodegaDB, id)

    async def update(self, id: int, data: dict) -> SolicitudBodegaDB | None:
        solicitud = await self.get_by_id(id)
        if solicitud:
            for key, value in data.items():
                if hasattr(solicitud, key):
                    setattr(solicitud, key, value)
            await self.session.commit()
            await self.session.refresh(solicitud)
        return solicitud
