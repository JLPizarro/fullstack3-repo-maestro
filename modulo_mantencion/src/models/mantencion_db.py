from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import String, Text, BigInteger, DateTime, ForeignKey
from datetime import datetime
from src.models.base import Base

class MantencionDB(Base):
    __tablename__ = "mantenciones"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    vehiculo_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("vehiculos.id", ondelete="CASCADE"), nullable=False)
    mecanico_id: Mapped[int] = mapped_column(BigInteger, nullable=False)  # Referencia externa a rrhh.personal
    tipo: Mapped[str] = mapped_column(String(50), nullable=False)  # Preventiva o Correctiva
    fecha: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    fecha_ingreso: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    fecha_salida: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    fecha_programada: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    odometro: Mapped[int | None] = mapped_column(BigInteger, nullable=True)  # Odométro registrado en la mantención
    tareas: Mapped[str | None] = mapped_column(Text, nullable=True)  # JSON or text list
    estado: Mapped[str] = mapped_column(String(50), default="Pendiente", nullable=False)
