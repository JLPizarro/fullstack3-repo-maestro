from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from datetime import date
from src.repository.ingreso_repository import IngresoRepository
from src.models.ingreso_db import IngresoBodegaDB

class IngresoDTO(BaseModel):
    usuario_entrega: Optional[str] = None
    usuario_recepcion: Optional[str] = None
    tipo_doc_origen: Optional[str] = None
    tipo_doc_recepcion: Optional[str] = None
    n_documento: Optional[str] = None
    fecha_requerimiento: Optional[date] = None
    descripcion: Optional[str] = None
    n_oc: Optional[str] = None
    n_salida: Optional[str] = None

class IngresoResponseDTO(IngresoDTO):
    id: int
    model_config = ConfigDict(from_attributes=True)

class IngresoService:
    def __init__(self, repository: IngresoRepository):
        self.repository = repository

    async def crear_ingreso(self, data: dict) -> IngresoResponseDTO:
        dto = IngresoDTO(**data)
        nuevo = IngresoBodegaDB(**dto.model_dump())
        creado = await self.repository.create(nuevo)
        return IngresoResponseDTO.model_validate(creado)

    async def obtener_todos(self) -> List[IngresoResponseDTO]:
        ingresos = await self.repository.get_all()
        return [IngresoResponseDTO.model_validate(i) for i in ingresos]
