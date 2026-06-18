from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List, Optional
from src.models.vehiculo_db import VehiculoDB
from src.models.vehiculo import VehiculoCreate, VehiculoUpdate

class VehiculoRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def create(self, data: VehiculoCreate) -> VehiculoDB:
        db_obj = VehiculoDB(**data.model_dump())
        self.session.add(db_obj)
        await self.session.commit()
        await self.session.refresh(db_obj)
        return db_obj

    async def get_by_id(self, id: int) -> Optional[VehiculoDB]:
        stmt = select(VehiculoDB).where(VehiculoDB.id == id)
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def get_all(self, limit: int = 100, offset: int = 0) -> List[VehiculoDB]:
        stmt = select(VehiculoDB).limit(limit).offset(offset)
        result = await self.session.execute(stmt)
        return result.scalars().all()

    async def update(self, db_obj: VehiculoDB, data: VehiculoUpdate) -> VehiculoDB:
        update_data = data.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_obj, key, value)
        await self.session.commit()
        await self.session.refresh(db_obj)
        return db_obj

    async def delete(self, db_obj: VehiculoDB) -> None:
        await self.session.delete(db_obj)
        await self.session.commit()
