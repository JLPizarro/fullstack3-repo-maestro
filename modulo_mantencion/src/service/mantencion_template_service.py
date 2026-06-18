from typing import List, Optional
from src.repository.mantencion_template_repository import MantencionTemplateRepository
from src.models.mantencion_template_db import MantencionTemplateDB

class MantencionTemplateService:
    def __init__(self, repository: MantencionTemplateRepository):
        self.repository = repository

    async def crear_template(self, data: dict) -> dict:
        template = MantencionTemplateDB(
            nombre=data['nombre'],
            descripcion=data.get('descripcion'),
            tareas_json=data.get('tareas_json'),
            repuestos_json_default=data.get('repuestos_json_default')
        )
        creado = await self.repository.create(template)
        return {"id": creado.id, "nombre": creado.nombre}

    async def obtener_todos(self) -> List[dict]:
        templates = await self.repository.get_all()
        return [{"id": t.id, "nombre": t.nombre} for t in templates]
