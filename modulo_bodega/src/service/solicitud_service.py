from src.repository.solicitud_repository import SolicitudRepository
from src.repository.producto_repository import ProductoRepository
from src.models.solicitud_db import SolicitudBodegaDB

class SolicitudService:
    def __init__(self, repository: SolicitudRepository, producto_repo: ProductoRepository):
        self.repository = repository
        self.producto_repo = producto_repo

    async def crear_solicitud(self, data: dict) -> dict:
        nueva = SolicitudBodegaDB(
            area_solicitante=data.get('area_solicitante', 'Desconocida'),
            usuario_solicitante=data.get('usuario_solicitante', 'Desconocido'),
            estado="Pendiente",
            detalles_json=data.get('detalles_json', []),
            comentarios=data.get('comentarios', '')
        )
        creada = await self.repository.create(nueva)
        return self._format_solicitud(creada)

    async def obtener_todas(self) -> list[dict]:
        solicitudes = await self.repository.get_all()
        return [self._format_solicitud(s) for s in solicitudes]

    async def entregar_solicitud(self, id: int) -> dict:
        solicitud = await self.repository.get_by_id(id)
        if not solicitud:
            raise ValueError("Solicitud no encontrada")
        
        if solicitud.estado == "Entregada":
            raise ValueError("La solicitud ya ha sido entregada previamente")

        # Descontar stock
        for item in solicitud.detalles_json:
            prod_id = item.get('producto_id')
            cantidad = item.get('cantidad', 0)
            
            if prod_id and cantidad > 0:
                producto = await self.producto_repo.get_by_id(prod_id)
                if not producto:
                    raise ValueError(f"Producto con ID {prod_id} no existe")
                
                if producto.stock < cantidad:
                    raise ValueError(f"Stock insuficiente para {producto.nombre}. Disponible: {producto.stock}, Solicitado: {cantidad}")
                
                # Actualizar stock
                producto.stock -= cantidad
                # No hacemos commit aquí porque el update principal lo hará
        
        # Marcar como entregada
        actualizada = await self.repository.update(id, {"estado": "Entregada"})
        return self._format_solicitud(actualizada)

    async def rechazar_solicitud(self, id: int) -> dict:
        solicitud = await self.repository.get_by_id(id)
        if not solicitud:
            raise ValueError("Solicitud no encontrada")
        
        if solicitud.estado == "Entregada":
            raise ValueError("No se puede rechazar una solicitud ya entregada")
            
        actualizada = await self.repository.update(id, {"estado": "Rechazada"})
        return self._format_solicitud(actualizada)

    def _format_solicitud(self, s: SolicitudBodegaDB) -> dict:
        return {
            "id": s.id,
            "area_solicitante": s.area_solicitante,
            "usuario_solicitante": s.usuario_solicitante,
            "fecha_solicitud": s.fecha_solicitud.isoformat() if s.fecha_solicitud else None,
            "estado": s.estado,
            "detalles_json": s.detalles_json,
            "comentarios": s.comentarios
        }
