from typing import List, Optional
from src.repository.orden_trabajo_repository import OrdenTrabajoRepository
from src.models.orden_trabajo_db import OrdenTrabajoDB, OrdenTrabajoRepuestoDB

class OrdenTrabajoService:
    def __init__(self, repository: OrdenTrabajoRepository):
        self.repository = repository

    async def crear_ot(self, data: dict) -> dict:
        ot = OrdenTrabajoDB(
            mantencion_id=data['mantencion_id'],
            mecanico_id=data['mecanico_id']
        )
        creada = await self.repository.create_ot(ot)
        return {"id": creada.id, "mantencion_id": creada.mantencion_id, "mecanico_id": creada.mecanico_id, "estado": creada.estado}

    async def agregar_repuesto_ot(self, ot_id: int, producto_id: int, cantidad: int) -> dict:
        repuesto = OrdenTrabajoRepuestoDB(
            ot_id=ot_id,
            producto_id=producto_id,
            cantidad_solicitada=cantidad
        )
        creado = await self.repository.create_ot_repuesto(repuesto)
        return {"id": creado.id, "ot_id": creado.ot_id, "producto_id": creado.producto_id, "cantidad_solicitada": creado.cantidad_solicitada}

    async def solicitar_devolucion_repuesto(self, repuesto_id: int, cantidad_devuelta: int) -> dict:
        # Aquí se marca como PENDIENTE, Bodega debe verificar
        actualizado = await self.repository.update_ot_repuesto(repuesto_id, {
            "cantidad_devuelta": cantidad_devuelta,
            "estado_devolucion": "Pendiente"
        })
        if actualizado:
            return {"id": actualizado.id, "estado_devolucion": actualizado.estado_devolucion}
        return {"error": "Repuesto en OT no encontrado"}
