from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from src.models.usuario_db import UsuarioDB

class UsuarioRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def create(self, usuario: UsuarioDB) -> UsuarioDB:
        self.session.add(usuario)
        await self.session.commit()
        await self.session.refresh(usuario)
        return usuario

    async def get_all(self) -> list[UsuarioDB]:
        result = await self.session.execute(select(UsuarioDB))
        return result.scalars().all()

    async def get_by_id(self, id: int) -> UsuarioDB | None:
        return await self.session.get(UsuarioDB, id)

    async def get_by_email(self, email: str) -> UsuarioDB | None:
        result = await self.session.execute(select(UsuarioDB).where(UsuarioDB.email == email))
        return result.scalars().first()

    async def update(self, id: int, data: dict) -> UsuarioDB | None:
        usuario = await self.get_by_id(id)
        if usuario:
            for key, value in data.items():
                if hasattr(usuario, key):
                    setattr(usuario, key, value)
            await self.session.commit()
            await self.session.refresh(usuario)
        return usuario

    async def delete(self, id: int) -> bool:
        usuario = await self.get_by_id(id)
        if usuario:
            await self.session.delete(usuario)
            await self.session.commit()
            return True
        return False
