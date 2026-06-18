from sqlalchemy import Column, Integer, String, Boolean, Date, DateTime, Numeric, Text, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

class Viaje(Base):
    __tablename__ = "viajes"
    
    id = Column(Integer, primary_key=True, index=True)
    fecha = Column(Date, nullable=False, index=True)
    estado = Column(String(50), default="IDA") # IDA, RETORNO, etc.
    tipo_operativo = Column(String(50)) # Operativo, Descanso, Licencia, Taller
    
    # IDs from other microservices (shared DB assumes ID consistency)
    conductor_id = Column(Integer, index=True)
    tracto_id = Column(Integer, index=True)
    rampla_id = Column(Integer, index=True)
    cliente_id = Column(Integer, index=True)
    
    conductor_nombre = Column(String(200)) # Cached for easier spreadsheet-style display
    tracto_patente = Column(String(20))
    rampla_patente = Column(String(20))
    cliente_nombre = Column(String(200))

    servicio = Column(String(100))
    fecha_carga = Column(Date)
    origen = Column(String(200))
    fecha_descarga = Column(Date)
    destino = Column(String(200))
    valor_viaje = Column(Numeric(12, 2), default=0)
    observaciones = Column(Text)
    pernoctacion = Column(Boolean, default=False)
    
    created_at = Column(DateTime, server_default=func.now())
