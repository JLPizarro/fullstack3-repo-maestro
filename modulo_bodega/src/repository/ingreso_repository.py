from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from src.models.ingreso_db import IngresoBodegaDB

class IngresoRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def create(self, ingreso: IngresoBodegaDB) -> IngresoBodegaDB:
        self.session.add(ingreso)
        await self.session.commit()
        await self.session.refresh(ingreso)
        return ingreso

    async def get_all(self) -> list[IngresoBodegaDB]:
        result = await self.session.execute(select(IngresoBodegaDB))
        return result.scalars().all()

    async def get_by_id(self, id: int) -> IngresoBodegaDB:
        return await self.session.get(IngresoBodegaDB, id)
