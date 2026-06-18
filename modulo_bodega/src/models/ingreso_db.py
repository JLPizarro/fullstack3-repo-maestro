from sqlalchemy import Column, Integer, String, Date
from sqlalchemy.orm import declarative_base

Base = declarative_base()

class IngresoBodegaDB(Base):
    __tablename__ = "ingresos_bodega"

    id = Column(Integer, primary_key=True, index=True)
    usuario_entrega = Column(String(150), nullable=True)
    usuario_recepcion = Column(String(150), nullable=True)
    tipo_doc_origen = Column(String(100), nullable=True)
    tipo_doc_recepcion = Column(String(100), nullable=True)
    n_documento = Column(String(100), nullable=True)
    fecha_requerimiento = Column(Date, nullable=True)
    descripcion = Column(String(500), nullable=True)
    n_oc = Column(String(100), nullable=True)
    n_salida = Column(String(100), nullable=True)
