from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from src.models.mantencion_template_db import MantencionTemplateDB

class MantencionTemplateRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def create(self, template: MantencionTemplateDB) -> MantencionTemplateDB:
        self.session.add(template)
        await self.session.commit()
        await self.session.refresh(template)
        return template

    async def get_all(self) -> list[MantencionTemplateDB]:
        result = await self.session.execute(select(MantencionTemplateDB))
        return result.scalars().all()

    async def get_by_id(self, id: int) -> MantencionTemplateDB | None:
        return await self.session.get(MantencionTemplateDB, id)
