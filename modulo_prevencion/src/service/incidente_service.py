from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from datetime import datetime
from src.repository.incidente_repository import IncidenteRepository
from src.models.incidente_db import IncidenteDB

class IncidenteDTO(BaseModel):
    titulo: str
    descripcion: Optional[str] = None
    nivel_gravedad: str

class IncidenteResponseDTO(IncidenteDTO):
    id: int
    fecha: datetime
    model_config = ConfigDict(from_attributes=True)

class IncidenteService:
    def __init__(self, repository: IncidenteRepository):
        self.repository = repository

    async def crear_incidente(self, data: dict) -> IncidenteResponseDTO:
        dto = IncidenteDTO(**data)
        nuevo = IncidenteDB(**dto.model_dump())
        creado = await self.repository.create(nuevo)
        return IncidenteResponseDTO.model_validate(creado)

    async def obtener_todos(self) -> List[IncidenteResponseDTO]:
        incidentes = await self.repository.get_all()
        return [IncidenteResponseDTO.model_validate(i) for i in incidentes]

    async def obtener_por_id(self, id: int) -> Optional[IncidenteResponseDTO]:
        incidente = await self.repository.get_by_id(id)
        if incidente:
            return IncidenteResponseDTO.model_validate(incidente)
        return None

    async def actualizar_incidente(self, id: int, data: dict) -> Optional[IncidenteResponseDTO]:
        actualizado = await self.repository.update(id, data)
        if actualizado:
            return IncidenteResponseDTO.model_validate(actualizado)
        return None

    async def eliminar_incidente(self, id: int) -> bool:
        return await self.repository.delete(id)
