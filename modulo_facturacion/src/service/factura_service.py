from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from datetime import datetime
from src.repository.factura_repository import FacturaRepository
from src.models.factura_db import FacturaDB

class FacturaDTO(BaseModel):
    cliente: str
    total: float
    estado: Optional[str] = "Emitida"

class FacturaResponseDTO(FacturaDTO):
    id: int
    fecha: datetime
    model_config = ConfigDict(from_attributes=True)

class FacturaService:
    def __init__(self, repository: FacturaRepository):
        self.repository = repository

    async def crear_factura(self, data: dict) -> FacturaResponseDTO:
        dto = FacturaDTO(**data)
        nueva = FacturaDB(**dto.model_dump())
        creada = await self.repository.create(nueva)
        return FacturaResponseDTO.model_validate(creada)

    async def obtener_todas(self) -> List[FacturaResponseDTO]:
        facturas = await self.repository.get_all()
        return [FacturaResponseDTO.model_validate(f) for f in facturas]

    async def obtener_por_id(self, id: int) -> Optional[FacturaResponseDTO]:
        factura = await self.repository.get_by_id(id)
        if factura:
            return FacturaResponseDTO.model_validate(factura)
        return None

    async def actualizar_factura(self, id: int, data: dict) -> Optional[FacturaResponseDTO]:
        actualizada = await self.repository.update(id, data)
        if actualizada:
            return FacturaResponseDTO.model_validate(actualizada)
        return None

    async def eliminar_factura(self, id: int) -> bool:
        return await self.repository.delete(id)
