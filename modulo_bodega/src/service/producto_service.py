from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from src.repository.producto_repository import ProductoRepository
from src.models.producto_db import ProductoDB

class ProductoDTO(BaseModel):
    nombre: str
    descripcion: Optional[str] = None
    precio: float
    stock: int

class ProductoResponseDTO(ProductoDTO):
    id: int
    model_config = ConfigDict(from_attributes=True)

class ProductoService:
    def __init__(self, repository: ProductoRepository):
        self.repository = repository

    async def crear_producto(self, data: dict) -> ProductoResponseDTO:
        dto = ProductoDTO(**data)
        nuevo = ProductoDB(**dto.model_dump())
        creado = await self.repository.create(nuevo)
        return ProductoResponseDTO.model_validate(creado)

    async def obtener_todos(self) -> List[ProductoResponseDTO]:
        productos = await self.repository.get_all()
        return [ProductoResponseDTO.model_validate(p) for p in productos]

    async def obtener_por_id(self, id: int) -> Optional[ProductoResponseDTO]:
        producto = await self.repository.get_by_id(id)
        if producto:
            return ProductoResponseDTO.model_validate(producto)
        return None

    async def actualizar_producto(self, id: int, data: dict) -> Optional[ProductoResponseDTO]:
        actualizado = await self.repository.update(id, data)
        if actualizado:
            return ProductoResponseDTO.model_validate(actualizado)
        return None

    async def eliminar_producto(self, id: int) -> bool:
        return await self.repository.delete(id)

    async def verificar_devolucion_repuesto(self, producto_id: int, cantidad: int) -> Optional[ProductoResponseDTO]:
        producto = await self.repository.get_by_id(producto_id)
        if producto:
            nuevo_stock = producto.stock + cantidad
            return await self.actualizar_producto(producto_id, {"stock": nuevo_stock})
        return None
