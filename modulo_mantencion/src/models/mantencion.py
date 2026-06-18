from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime

class MantencionBase(BaseModel):
    vehiculo_id: int
    mecanico_id: int
    tipo: str
    fecha: Optional[datetime] = None
    fecha_ingreso: Optional[datetime] = None
    fecha_salida: Optional[datetime] = None
    fecha_programada: Optional[datetime] = None
    odometro: Optional[int] = None
    tareas: Optional[str] = None
    estado: Optional[str] = "Pendiente"

class MantencionCreate(MantencionBase):
    pass

class MantencionUpdate(BaseModel):
    vehiculo_id: Optional[int] = None
    mecanico_id: Optional[int] = None
    tipo: Optional[str] = None
    fecha: Optional[datetime] = None
    fecha_ingreso: Optional[datetime] = None
    fecha_salida: Optional[datetime] = None
    fecha_programada: Optional[datetime] = None
    odometro: Optional[int] = None
    tareas: Optional[str] = None
    estado: Optional[str] = None

class MantencionResponse(MantencionBase):
    id: int
    model_config = ConfigDict(from_attributes=True)
