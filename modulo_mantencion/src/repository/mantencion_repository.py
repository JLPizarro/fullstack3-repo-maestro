from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List, Optional
from src.models.mantencion_db import MantencionDB
from src.models.mantencion import MantencionCreate, MantencionUpdate

class MantencionRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def create(self, data: MantencionCreate) -> MantencionDB:
        # Avoid setting fecha externally if None, let DB handle default if needed. 
        # But we also have a default in DB. 
        db_obj = MantencionDB(**data.model_dump(exclude_unset=True))
        self.session.add(db_obj)
        await self.session.commit()
        await self.session.refresh(db_obj)
        return db_obj

    async def get_by_id(self, id: int) -> Optional[MantencionDB]:
        stmt = select(MantencionDB).where(MantencionDB.id == id)
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def get_all(self, limit: int = 100, offset: int = 0) -> List[MantencionDB]:
        stmt = select(MantencionDB).order_by(MantencionDB.id.desc()).limit(limit).offset(offset)
        result = await self.session.execute(stmt)
        return list(result.scalars().all())

    async def get_latest_for_vehiculo(self, vehiculo_id: int) -> Optional[MantencionDB]:
        query = select(MantencionDB).where(MantencionDB.vehiculo_id == vehiculo_id).order_by(MantencionDB.fecha.desc()).limit(1)
        result = await self.session.execute(query)
        return result.scalar_one_or_none()

    async def update(self, db_obj: MantencionDB, data: MantencionUpdate) -> MantencionDB:
        update_data = data.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_obj, key, value)
        await self.session.commit()
        await self.session.refresh(db_obj)
        return db_obj

    async def delete(self, db_obj: MantencionDB) -> None:
        await self.session.delete(db_obj)
        await self.session.commit()
