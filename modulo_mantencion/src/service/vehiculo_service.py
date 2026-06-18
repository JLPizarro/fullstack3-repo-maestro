from typing import List, Optional
from src.models.vehiculo import VehiculoCreate, VehiculoUpdate, VehiculoResponse
from src.repository.vehiculo_repository import VehiculoRepository

class VehiculoService:
    def __init__(self, repository: VehiculoRepository):
        self.repository = repository

    async def create_vehiculo(self, data: VehiculoCreate) -> VehiculoResponse:
        db_obj = await self.repository.create(data)
        return VehiculoResponse.model_validate(db_obj)

    async def get_vehiculo(self, id: int) -> Optional[VehiculoResponse]:
        db_obj = await self.repository.get_by_id(id)
        if not db_obj:
            return None
        return VehiculoResponse.model_validate(db_obj)

    async def get_all_vehiculos(self, limit: int = 100, offset: int = 0) -> List[VehiculoResponse]:
        db_objs = await self.repository.get_all(limit, offset)
        return [VehiculoResponse.model_validate(r) for r in db_objs]

    async def update_vehiculo(self, id: int, data: VehiculoUpdate) -> Optional[VehiculoResponse]:
        db_obj = await self.repository.get_by_id(id)
        if not db_obj:
            return None
        updated_obj = await self.repository.update(db_obj, data)
        return VehiculoResponse.model_validate(updated_obj)

    async def delete_vehiculo(self, id: int) -> bool:
        db_obj = await self.repository.get_by_id(id)
        if not db_obj:
            return False
        await self.repository.delete(db_obj)
        return True
