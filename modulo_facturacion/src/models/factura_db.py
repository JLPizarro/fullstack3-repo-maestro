from sqlalchemy import Column, Integer, String, Float, DateTime
from sqlalchemy.orm import declarative_base
import datetime

Base = declarative_base()

class FacturaDB(Base):
    __tablename__ = "facturas"

    id = Column(Integer, primary_key=True, index=True)
    cliente = Column(String(100), nullable=False)
    fecha = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)
    total = Column(Float, nullable=False)
    estado = Column(String(50), default="Emitida")
