class AcreditacionService:
    def __init__(self, repository):
        self.repository = repository

    async def create_cliente(self, data):
        return await self.repository.create_cliente(data)

    async def get_all_clientes(self):
        return await self.repository.get_all_clientes()

    async def create_requerimiento(self, data):
        return await self.repository.create_requerimiento(data)

    async def get_requerimientos_by_cliente(self, cliente_id):
        return await self.repository.get_requerimientos_by_cliente(cliente_id)

    async def create_acreditacion(self, data):
        return await self.repository.create_acreditacion(data)

    async def get_acreditaciones_by_sujeto(self, sujeto_id, tipo_sujeto):
        return await self.repository.get_acreditaciones_by_sujeto(sujeto_id, tipo_sujeto)

    async def get_acreditaciones(self, sujeto_id=None, tipo_sujeto=None):
        return await self.repository.get_acreditaciones(sujeto_id, tipo_sujeto)
