from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, delete
from src.models.personal_db import PersonalDB


class PersonalRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def save(self, obj: PersonalDB) -> PersonalDB:
        self.session.add(obj)
        await self.session.commit()
        await self.session.refresh(obj)
        return obj

    async def find_all(self) -> list[PersonalDB]:
        result = await self.session.execute(select(PersonalDB))
        return list(result.scalars().all())

    async def find_by_id(self, id_val: int) -> PersonalDB | None:
        result = await self.session.execute(
            select(PersonalDB).where(PersonalDB.id == id_val)
        )
        return result.scalar_one_or_none()

    async def update(self, id_val: int, data: dict) -> PersonalDB | None:
        # Filtrar campos None para no sobreescribir con nulos
        update_data = {k: v for k, v in data.items() if v is not None}
        if not update_data:
            return await self.find_by_id(id_val)

        await self.session.execute(
            update(PersonalDB).where(PersonalDB.id == id_val).values(**update_data)
        )
        await self.session.commit()
        return await self.find_by_id(id_val)

    async def delete(self, id_val: int) -> bool:
        result = await self.session.execute(
            delete(PersonalDB).where(PersonalDB.id == id_val)
        )
        await self.session.commit()
        return result.rowcount > 0