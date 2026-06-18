from typing import List, Optional
from src.models.mantencion import MantencionCreate, MantencionUpdate, MantencionResponse
from src.repository.mantencion_repository import MantencionRepository
from src.repository.vehiculo_repository import VehiculoRepository
from src.models.vehiculo import VehiculoUpdate

class MantencionService:
    def __init__(self, repository: MantencionRepository, vehiculo_repository: VehiculoRepository):
        self.repository = repository
        self.vehiculo_repository = vehiculo_repository

    async def create_mantencion(self, data: MantencionCreate) -> MantencionResponse:
        db_obj = await self.repository.create(data)
        
        # Blocking logic: update vehicle status
        vehiculo = await self.vehiculo_repository.get_by_id(data.vehiculo_id)
        if vehiculo:
            update_data = VehiculoUpdate(estado=f"BLOQUEADO POR MANTENCIÓN {data.tipo}")
            await self.vehiculo_repository.update(vehiculo, update_data)
            
        return MantencionResponse.model_validate(db_obj)

    async def get_mantencion(self, id: int) -> Optional[MantencionResponse]:
        db_obj = await self.repository.get_by_id(id)
        if not db_obj:
            return None
        return MantencionResponse.model_validate(db_obj)

    async def get_all_mantenciones(self, limit: int = 100, offset: int = 0) -> List[MantencionResponse]:
        db_objs = await self.repository.get_all(limit, offset)
        return [MantencionResponse.model_validate(r) for r in db_objs]

    async def update_mantencion(self, id: int, data: MantencionUpdate) -> Optional[MantencionResponse]:
        db_obj = await self.repository.get_by_id(id)
        if not db_obj:
            return None
        
        updated_obj = await self.repository.update(db_obj, data)
        
        # Unblocking logic: if completed, set vehicle to Disponible
        if data.estado == "Completada":
            vehiculo = await self.vehiculo_repository.get_by_id(updated_obj.vehiculo_id)
            if vehiculo:
                await self.vehiculo_repository.update(vehiculo, VehiculoUpdate(estado="Disponible"))
                
        return MantencionResponse.model_validate(updated_obj)

    async def delete_mantencion(self, id: int) -> bool:
        db_obj = await self.repository.get_by_id(id)
        if not db_obj:
            return False
        
        vehiculo_id = db_obj.vehiculo_id
        await self.repository.delete(db_obj)
        
        # Unblocking logic: if deleted, set vehicle to Disponible (optional but safer)
        vehiculo = await self.vehiculo_repository.get_by_id(vehiculo_id)
        if vehiculo:
            await self.vehiculo_repository.update(vehiculo, VehiculoUpdate(estado="Disponible"))
            
        return True
