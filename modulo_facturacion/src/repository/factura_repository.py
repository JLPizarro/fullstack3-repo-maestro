from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from src.models.factura_db import FacturaDB

class FacturaRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def create(self, factura: FacturaDB) -> FacturaDB:
        self.session.add(factura)
        await self.session.commit()
        await self.session.refresh(factura)
        return factura

    async def get_all(self) -> list[FacturaDB]:
        result = await self.session.execute(select(FacturaDB))
        return result.scalars().all()

    async def get_by_id(self, id: int) -> FacturaDB:
        return await self.session.get(FacturaDB, id)

    async def update(self, id: int, data: dict) -> FacturaDB:
        factura = await self.get_by_id(id)
        if factura:
            for key, value in data.items():
                if hasattr(factura, key):
                    setattr(factura, key, value)
            await self.session.commit()
            await self.session.refresh(factura)
        return factura

    async def delete(self, id: int) -> bool:
        factura = await self.get_by_id(id)
        if factura:
            await self.session.delete(factura)
            await self.session.commit()
            return True
        return False
