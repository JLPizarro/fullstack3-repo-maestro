from datetime import datetime
from sqlalchemy.future import select
from src.models.acreditacion_db import Cliente, Requerimiento, Acreditacion

class AcreditacionRepository:
    def __init__(self, session):
        self.session = session

    # --- Cliente Repository ---
    async def create_cliente(self, data):
        cliente = Cliente(**data)
        self.session.add(cliente)
        await self.session.commit()
        await self.session.refresh(cliente)
        return cliente

    async def get_all_clientes(self):
        result = await self.session.execute(select(Cliente))
        return result.scalars().all()

    async def get_cliente_by_id(self, id):
        return await self.session.get(Cliente, id)

    # --- Requerimiento Repository ---
    async def create_requerimiento(self, data):
        req = Requerimiento(**data)
        self.session.add(req)
        await self.session.commit()
        await self.session.refresh(req)
        return req

    async def get_requerimientos_by_cliente(self, cliente_id):
        result = await self.session.execute(select(Requerimiento).where(Requerimiento.cliente_id == cliente_id))
        return result.scalars().all()

    # --- Acreditacion Repository ---
    async def create_acreditacion(self, data):
        # Convert date strings to date objects
        for field in ['fecha_emision', 'fecha_vencimiento']:
            if field in data and isinstance(data[field], str) and data[field]:
                data[field] = datetime.strptime(data[field], "%Y-%m-%d").date()
        
        acred = Acreditacion(**data)
        self.session.add(acred)
        await self.session.commit()
        await self.session.refresh(acred)
        return acred

    async def get_acreditaciones_by_sujeto(self, sujeto_id, tipo_sujeto):
        # We join with Requerimiento to filter by tipo_sujeto
        result = await self.session.execute(
            select(Acreditacion).join(Requerimiento).where(
                Acreditacion.sujeto_id == sujeto_id,
                Requerimiento.tipo_sujeto == tipo_sujeto
            )
        )
        return result.scalars().all()

    async def get_acreditaciones(self, sujeto_id=None, tipo_sujeto=None):
        query = select(Acreditacion)
        if sujeto_id or tipo_sujeto:
            query = query.join(Requerimiento)
            if sujeto_id:
                query = query.where(Acreditacion.sujeto_id == sujeto_id)
            if tipo_sujeto:
                query = query.where(Requerimiento.tipo_sujeto == tipo_sujeto)
        
        result = await self.session.execute(query)
        return result.scalars().all()
