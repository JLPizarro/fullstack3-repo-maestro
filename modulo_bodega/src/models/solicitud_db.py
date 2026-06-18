from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import String, BigInteger, DateTime, JSON
from datetime import datetime
from src.models.producto_db import Base

class SolicitudBodegaDB(Base):
    __tablename__ = "solicitudes_bodega"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    area_solicitante: Mapped[str] = mapped_column(String(100), nullable=False)
    usuario_solicitante: Mapped[str] = mapped_column(String(150), nullable=False)
    fecha_solicitud: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    estado: Mapped[str] = mapped_column(String(50), default="Pendiente", nullable=False)
    # Lista de {producto_id: int, cantidad: int}
    detalles_json: Mapped[list] = mapped_column(JSON, default=list, nullable=False)
    comentarios: Mapped[str | None] = mapped_column(String(500), nullable=True)
