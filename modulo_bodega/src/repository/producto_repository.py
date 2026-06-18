from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from src.models.producto_db import ProductoDB

class ProductoRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def create(self, producto: ProductoDB) -> ProductoDB:
        self.session.add(producto)
        await self.session.commit()
        await self.session.refresh(producto)
        return producto

    async def get_all(self) -> list[ProductoDB]:
        result = await self.session.execute(select(ProductoDB))
        return result.scalars().all()

    async def get_by_id(self, id: int) -> ProductoDB:
        return await self.session.get(ProductoDB, id)

    async def update(self, id: int, data: dict) -> ProductoDB:
        producto = await self.get_by_id(id)
        if producto:
            for key, value in data.items():
                if hasattr(producto, key):
                    setattr(producto, key, value)
            await self.session.commit()
            await self.session.refresh(producto)
        return producto

    async def delete(self, id: int) -> bool:
        producto = await self.get_by_id(id)
        if producto:
            await self.session.delete(producto)
            await self.session.commit()
            return True
        return False
