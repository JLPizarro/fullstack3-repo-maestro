from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from src.models.orden_trabajo_db import OrdenTrabajoDB, OrdenTrabajoRepuestoDB

class OrdenTrabajoRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def create_ot(self, ot: OrdenTrabajoDB) -> OrdenTrabajoDB:
        self.session.add(ot)
        await self.session.commit()
        await self.session.refresh(ot)
        return ot

    async def create_ot_repuesto(self, repuesto: OrdenTrabajoRepuestoDB) -> OrdenTrabajoRepuestoDB:
        self.session.add(repuesto)
        await self.session.commit()
        await self.session.refresh(repuesto)
        return repuesto

    async def get_all_ots(self) -> list[OrdenTrabajoDB]:
        result = await self.session.execute(select(OrdenTrabajoDB))
        return result.scalars().all()

    async def get_ot_by_id(self, id: int) -> OrdenTrabajoDB | None:
        return await self.session.get(OrdenTrabajoDB, id)

    async def get_repuestos_by_ot(self, ot_id: int) -> list[OrdenTrabajoRepuestoDB]:
        result = await self.session.execute(select(OrdenTrabajoRepuestoDB).where(OrdenTrabajoRepuestoDB.ot_id == ot_id))
        return result.scalars().all()

    async def update_ot(self, id: int, data: dict) -> OrdenTrabajoDB | None:
        ot = await self.get_ot_by_id(id)
        if ot:
            for key, value in data.items():
                if hasattr(ot, key):
                    setattr(ot, key, value)
            await self.session.commit()
            await self.session.refresh(ot)
        return ot

    async def update_ot_repuesto(self, id: int, data: dict) -> OrdenTrabajoRepuestoDB | None:
        repuesto = await self.session.get(OrdenTrabajoRepuestoDB, id)
        if repuesto:
            for key, value in data.items():
                if hasattr(repuesto, key):
                    setattr(repuesto, key, value)
            await self.session.commit()
            await self.session.refresh(repuesto)
        return repuesto
