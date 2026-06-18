from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from src.models.incidente_db import IncidenteDB

class IncidenteRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def create(self, incidente: IncidenteDB) -> IncidenteDB:
        self.session.add(incidente)
        await self.session.commit()
        await self.session.refresh(incidente)
        return incidente

    async def get_all(self) -> list[IncidenteDB]:
        result = await self.session.execute(select(IncidenteDB))
        return result.scalars().all()

    async def get_by_id(self, id: int) -> IncidenteDB:
        return await self.session.get(IncidenteDB, id)

    async def update(self, id: int, data: dict) -> IncidenteDB:
        incidente = await self.get_by_id(id)
        if incidente:
            for key, value in data.items():
                if hasattr(incidente, key):
                    setattr(incidente, key, value)
            await self.session.commit()
            await self.session.refresh(incidente)
        return incidente

    async def delete(self, id: int) -> bool:
        incidente = await self.get_by_id(id)
        if incidente:
            await self.session.delete(incidente)
            await self.session.commit()
            return True
        return False
