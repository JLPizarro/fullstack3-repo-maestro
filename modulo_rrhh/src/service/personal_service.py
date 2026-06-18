from src.models.personal_db import PersonalDB
from src.repository.personal_repository import PersonalRepository


class PersonalService:
    def __init__(self, repository: PersonalRepository):
        self.repository = repository

    async def crear_nuevo_empleado(self, data: dict) -> PersonalDB:
        data['nombre'] = data['nombre'].upper()
        data['apellido1'] = data['apellido1'].upper()
        if data.get('nombre2'):
            data['nombre2'] = data['nombre2'].upper()
        if data.get('apellido2'):
            data['apellido2'] = data['apellido2'].upper()
        data['rut'] = data['rut'].replace(".", "").upper()

        personal = PersonalDB(**data)
        return await self.repository.save(personal)

    async def obtener_todos(self) -> list[PersonalDB]:
        return await self.repository.find_all()

    async def obtener_por_id(self, id: int) -> PersonalDB | None:
        return await self.repository.find_by_id(id)

    async def actualizar_personal(self, id: int, data: dict) -> PersonalDB | None:
        return await self.repository.update(id, data)

    async def eliminar_personal(self, id: int) -> bool:
        return await self.repository.delete(id)