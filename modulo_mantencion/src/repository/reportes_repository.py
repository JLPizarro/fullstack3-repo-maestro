from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List, Optional
from src.models.reportes_db import ReportesDB
from src.models.reportes import ReportesCreate

class ReportesRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def create(self, reporte_data: ReportesCreate) -> ReportesDB:
        db_obj = ReportesDB(**reporte_data.model_dump())
        self.session.add(db_obj)
        await self.session.commit()
        await self.session.refresh(db_obj)
        return db_obj

    async def create_many(self, reportes_data: List[ReportesCreate]) -> int:
        db_objs = [ReportesDB(**r.model_dump()) for r in reportes_data]
        self.session.add_all(db_objs)
        await self.session.commit()
        return len(db_objs)

    async def get_by_id(self, report_id: str) -> Optional[ReportesDB]:
        stmt = select(ReportesDB).where(ReportesDB.report_id == report_id)
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def get_all(self, limit: int = 100, offset: int = 0) -> List[ReportesDB]:
        stmt = select(ReportesDB).order_by(ReportesDB.fecha_registro.desc()).limit(limit).offset(offset)
        result = await self.session.execute(stmt)
        return result.scalars().all()
