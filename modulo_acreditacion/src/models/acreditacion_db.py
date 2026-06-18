from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, Date, DateTime, Text, Enum as SQLEnum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from src.models.base import Base
import enum

class TipoSujeto(enum.Enum):
    PERSONAL = "PERSONAL"
    VEHICULO = "VEHICULO"

class Cliente(Base):
    __tablename__ = "clientes"
    
    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(200), nullable=False)
    rut = Column(String(20), unique=True, index=True)
    contacto = Column(String(200))
    created_at = Column(DateTime, server_default=func.now())
    
    requerimientos = relationship("Requerimiento", back_populates="cliente")

class Requerimiento(Base):
    __tablename__ = "requerimientos"
    
    id = Column(Integer, primary_key=True, index=True)
    cliente_id = Column(Integer, ForeignKey("clientes.id"))
    nombre = Column(String(200), nullable=False)
    descripcion = Column(Text)
    tipo_sujeto = Column(SQLEnum(TipoSujeto), nullable=False)
    created_at = Column(DateTime, server_default=func.now())
    
    cliente = relationship("Cliente", back_populates="requerimientos")
    acreditaciones = relationship("Acreditacion", back_populates="requerimiento")

class Acreditacion(Base):
    __tablename__ = "acreditaciones"
    
    id = Column(Integer, primary_key=True, index=True)
    requerimiento_id = Column(Integer, ForeignKey("requerimientos.id"))
    sujeto_id = Column(Integer, nullable=False, index=True) # ID of personal or vehiculo
    fecha_emision = Column(Date)
    fecha_vencimiento = Column(Date)
    link_documento = Column(String(500))
    estado = Column(Boolean, default=True)
    created_at = Column(DateTime, server_default=func.now())
    
    requerimiento = relationship("Requerimiento", back_populates="acreditaciones")
