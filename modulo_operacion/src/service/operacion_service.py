class OperacionService:
    def __init__(self, repository):
        self.repository = repository

    async def create_viaje(self, data):
        return await self.repository.create_viaje(data)

    async def get_viajes(self, fecha_inicio=None, fecha_fin=None):
        return await self.repository.get_viajes(fecha_inicio, fecha_fin)

    async def update_viaje(self, id, data):
        return await self.repository.update_viaje(id, data)

    async def delete_viaje(self, id):
        return await self.repository.delete_viaje(id)
