from pydantic import BaseModel, ConfigDict
from typing import Optional

class VehiculoBase(BaseModel):
    patente: str
    modelo: Optional[str] = None
    color: Optional[str] = None
    numero_interno: Optional[str] = None
    device_id: Optional[int] = None
    estado: Optional[str] = "Disponible"
    notas: Optional[str] = None

class VehiculoCreate(VehiculoBase):
    pass

class VehiculoUpdate(BaseModel):
    patente: Optional[str] = None
    modelo: Optional[str] = None
    color: Optional[str] = None
    numero_interno: Optional[str] = None
    device_id: Optional[int] = None
    estado: Optional[str] = None
    notas: Optional[str] = None

class VehiculoResponse(VehiculoBase):
    id: int
    model_config = ConfigDict(from_attributes=True)
