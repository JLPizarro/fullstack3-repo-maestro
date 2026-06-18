from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.orm import declarative_base
import datetime

Base = declarative_base()

class IncidenteDB(Base):
    __tablename__ = "incidentes"

    id = Column(Integer, primary_key=True, index=True)
    titulo = Column(String(150), nullable=False)
    descripcion = Column(String(500), nullable=True)
    nivel_gravedad = Column(String(50), nullable=False) # Alta, Media, Baja
    fecha = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)
