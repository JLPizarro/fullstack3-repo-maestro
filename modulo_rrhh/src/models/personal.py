from pydantic import BaseModel
from typing import Optional


class PersonalBase(BaseModel):
    nombre: str
    nombre2: Optional[str] = None
    apellido1: str
    apellido2: Optional[str] = None
    cargo: str
    rut: str
    base: str
    estado: bool = True
    motivo: Optional[str] = None


class PersonalCreate(PersonalBase):
    """Schema para crear un nuevo registro de personal."""
    pass


class PersonalUpdate(BaseModel):
    """Schema para actualizar un registro (todos los campos opcionales)."""
    nombre: Optional[str] = None
    nombre2: Optional[str] = None
    apellido1: Optional[str] = None
    apellido2: Optional[str] = None
    cargo: Optional[str] = None
    rut: Optional[str] = None
    base: Optional[str] = None
    estado: Optional[bool] = None
    motivo: Optional[str] = None


class PersonalResponse(PersonalBase):
    """Schema de respuesta con id incluido."""
    id: int

    class Config:
        from_attributes = True
