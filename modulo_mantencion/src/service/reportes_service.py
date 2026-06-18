from typing import List, Optional
from src.models.reportes import ReportesCreate, ReportesResponse
from src.repository.reportes_repository import ReportesRepository

class ReportesService:
    def __init__(self, repository: ReportesRepository):
        self.repository = repository

    async def create_reporte(self, data: ReportesCreate) -> ReportesResponse:
        db_reporte = await self.repository.create(data)
        return ReportesResponse.model_validate(db_reporte)

    async def create_multiple_reportes(self, data: List[ReportesCreate]) -> dict:
        count = await self.repository.create_many(data)
        return {"inserted": count}

    async def get_reporte_by_id(self, report_id: str) -> Optional[ReportesResponse]:
        db_reporte = await self.repository.get_by_id(report_id)
        if not db_reporte:
            return None
        return ReportesResponse.model_validate(db_reporte)

    async def get_all_reportes(self, limit: int = 100, offset: int = 0) -> List[ReportesResponse]:
        db_reportes = await self.repository.get_all(limit, offset)
        return [ReportesResponse.model_validate(r) for r in db_reportes]
