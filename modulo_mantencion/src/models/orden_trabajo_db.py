from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import String, BigInteger, DateTime, ForeignKey, JSON
from datetime import datetime
from src.models.base import Base

class OrdenTrabajoDB(Base):
    __tablename__ = "ordenes_trabajo"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    mantencion_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("mantenciones.id", ondelete="CASCADE"), nullable=False)
    mecanico_id: Mapped[int] = mapped_column(BigInteger, nullable=False) # Ref a RRHH
    estado: Mapped[str] = mapped_column(String(50), default="Abierta", nullable=False)
    fecha_inicio: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    fecha_fin: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    
class OrdenTrabajoRepuestoDB(Base):
    __tablename__ = "ot_repuestos"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    ot_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("ordenes_trabajo.id", ondelete="CASCADE"), nullable=False)
    producto_id: Mapped[int] = mapped_column(BigInteger, nullable=False) # Ref a Bodega (productos.id)
    cantidad_solicitada: Mapped[int] = mapped_column(BigInteger, default=1, nullable=False)
    cantidad_usada: Mapped[int] = mapped_column(BigInteger, default=0, nullable=False)
    cantidad_devuelta: Mapped[int] = mapped_column(BigInteger, default=0, nullable=False)
    estado_devolucion: Mapped[str] = mapped_column(String(50), default="Ninguna", nullable=False) # Ninguna, Pendiente, Verificada
