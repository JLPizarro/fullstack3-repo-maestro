import httpx
import asyncio
from typing import List, Dict, Optional
from datetime import datetime
from src.repository.vehiculo_repository import VehiculoRepository
from src.repository.mantencion_repository import MantencionRepository
from src.models.mantencion_db import MantencionDB

class PreventiveService:
    def __init__(self, session_factory):
        self.session_factory = session_factory
        self.sitrack_url = "https://externalappgw.cl.sitrack.com/v2/report"
        self.sitrack_auth = ("cfab0764fec4461cb4016b3a40299c84", "MT6359")
        self.queue: asyncio.Queue | None = None
        self._worker_task = None

    def start_worker(self):
        """Inicializa la cola y el worker en background."""
        if not self.queue:
            self.queue = asyncio.Queue()
            self._worker_task = asyncio.create_task(self._process_queue())

    async def _process_queue(self):
        """Worker asíncrono que procesa las mantenciones preventivas con timeout."""
        while True:
            try:
                # Timeout de 30 segundos, si no hay nada en la cola, lanza TimeoutError
                item = await asyncio.wait_for(self.queue.get(), timeout=30.0)
                
                vehiculo_id = item['vehiculo_id']
                odometro = item['odometro_actual']
                
                print(f"[Worker] Procesando mantención preventiva para vehiculo {vehiculo_id} a los {odometro}km")
                
                async with self.session_factory() as session:
                    mantencion_repo = MantencionRepository(session)
                    from src.models.mantencion import MantencionCreate
                    # Crear la mantención (Lógica de negocio simulada)
                    nueva_mantencion = MantencionCreate(
                        vehiculo_id=vehiculo_id,
                        mecanico_id=1, # Default o a asignar
                        tipo="Preventiva",
                        estado="Pendiente",
                        odometro=odometro,
                        tareas="Mantención Preventiva Automática 50.000km"
                    )
                    await mantencion_repo.create(nueva_mantencion)
                
                print(f"[Worker] Mantención creada exitosamente para vehiculo {vehiculo_id}")
                self.queue.task_done()
                
            except asyncio.TimeoutError:
                # El timeout es esperado si la cola está vacía, simplemente continuamos el loop
                pass
            except Exception as e:
                print(f"[Worker] Error procesando cola: {e}")

    async def enqueue_preventive(self, data: dict):
        """Agrega un evento de mantención preventiva a la cola."""
        if self.queue:
            await self.queue.put(data)

    async def fetch_sitrack_data(self) -> List[Dict]:
        """Fetches raw data from Sitrack API."""
        try:
            async with httpx.AsyncClient() as client:
                resp = await client.get(self.sitrack_url, auth=self.sitrack_auth, timeout=12.0)
                resp.raise_for_status()
                data = resp.json()
                if isinstance(data, list):
                    return data
                return []
        except Exception as e:
            print(f"Sitrack API error: {e}")
            return []

    async def get_preventive_status(self) -> List[Dict]:
        async with self.session_factory() as session:
            vehiculo_repo = VehiculoRepository(session)
            mantencion_repo = MantencionRepository(session)
            
            sitrack_data = await self.fetch_sitrack_data()
            if not sitrack_data:
                return []

            existing_vehiculos = await vehiculo_repo.get_all()
            vehiculos_dict = {v.patente: v for v in existing_vehiculos}

            vehiculos_to_process = []

            for item in sitrack_data:
                patente = item.get("assetName")
                device_id_raw = item.get("deviceId")
                device_id = int(device_id_raw) if device_id_raw else None
                odometro = item.get("odometer", 0)

                if not patente or not device_id:
                    continue

                v = vehiculos_dict.get(patente)
                if v:
                    if v.device_id != device_id:
                        v.device_id = device_id
                else:
                    from src.models.vehiculo_db import VehiculoDB
                    v = VehiculoDB(
                        patente=patente,
                        device_id=device_id,
                        modelo="Camión Sitrack",
                        estado="Disponible"
                    )
                    session.add(v)
                    vehiculos_dict[patente] = v

                vehiculos_to_process.append((v, odometro))

            from sqlalchemy.exc import IntegrityError
            try:
                await session.commit()
            except IntegrityError:
                await session.rollback()
                # Handle concurrent inserts
                existing_vehiculos = await vehiculo_repo.get_all()
                vehiculos_dict = {v.patente: v for v in existing_vehiculos}
                for i in range(len(vehiculos_to_process)):
                    v, odo = vehiculos_to_process[i]
                    if not v.id:
                        real_v = vehiculos_dict.get(v.patente)
                        if real_v:
                            vehiculos_to_process[i] = (real_v, odo)

            results = []
            for v, odo_actual in vehiculos_to_process:
                last_m = await mantencion_repo.get_latest_for_vehiculo(v.id)
                
                odo_ultima = last_m.odometro if last_m and last_m.odometro else 0
                fecha_ultima = last_m.fecha if last_m else None
                
                diferencia = odo_actual - odo_ultima
                necesita_mantencion = diferencia >= 50000
                
                if necesita_mantencion:
                    await self.enqueue_preventive({
                        "vehiculo_id": v.id,
                        "odometro_actual": odo_actual
                    })
                
                results.append({
                    "vehiculo_id": v.id,
                    "patente": v.patente,
                    "numero_interno": v.numero_interno,
                    "fecha_ultima_mantencion": fecha_ultima.isoformat() if fecha_ultima else None,
                    "odometro_ultima_mantencion": odo_ultima,
                    "odometro_actual": odo_actual,
                    "diferencia": diferencia,
                    "necesita_mantencion": necesita_mantencion
                })
                
            return sorted(results, key=lambda x: (x["necesita_mantencion"], x["diferencia"]), reverse=True)
