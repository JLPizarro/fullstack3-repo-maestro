from datetime import datetime
from sqlalchemy.future import select
from src.models.operacion_db import Viaje

class OperacionRepository:
    def __init__(self, session):
        self.session = session

    async def create_viaje(self, data):
        # Convert date strings to date objects
        for field in ['fecha', 'fecha_carga', 'fecha_descarga']:
            if field in data and isinstance(data[field], str) and data[field]:
                data[field] = datetime.strptime(data[field], "%Y-%m-%d").date()
        
        viaje = Viaje(**data)
        self.session.add(viaje)
        await self.session.commit()
        await self.session.refresh(viaje)
        return viaje

    async def get_viajes(self, fecha_inicio=None, fecha_fin=None):
        query = select(Viaje)
        if fecha_inicio:
            if isinstance(fecha_inicio, str) and fecha_inicio:
                fecha_inicio = datetime.strptime(fecha_inicio, "%Y-%m-%d").date()
            query = query.where(Viaje.fecha >= fecha_inicio)
        if fecha_fin:
            if isinstance(fecha_fin, str) and fecha_fin:
                fecha_fin = datetime.strptime(fecha_fin, "%Y-%m-%d").date()
            query = query.where(Viaje.fecha <= fecha_fin)
        
        result = await self.session.execute(query.order_by(Viaje.fecha.desc()))
        return result.scalars().all()

    async def get_viaje_by_id(self, id):
        return await self.session.get(Viaje, id)

    async def update_viaje(self, id, data):
        viaje = await self.get_viaje_by_id(id)
        if viaje:
            for key, value in data.items():
                setattr(viaje, key, value)
            await self.session.commit()
            await self.session.refresh(viaje)
        return viaje

    async def delete_viaje(self, id):
        viaje = await self.get_viaje_by_id(id)
        if viaje:
            await self.session.delete(viaje)
            await self.session.commit()
            return True
        return False
