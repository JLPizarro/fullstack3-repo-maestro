from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import String, Text, BigInteger
from datetime import datetime
from src.models.base import Base

class VehiculoDB(Base):
    __tablename__ = "vehiculos"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    patente: Mapped[str] = mapped_column(String(50), unique=True)
    modelo: Mapped[str | None] = mapped_column(String(100), nullable=True)
    color: Mapped[str | None] = mapped_column(String(50), nullable=True)
    numero_interno: Mapped[str | None] = mapped_column(String(50), nullable=True)  # Código interno del camión
    device_id: Mapped[int | None] = mapped_column(BigInteger, nullable=True)  # Para conectar con Reportes GPS
    estado: Mapped[str] = mapped_column(String(50), default="Disponible")
    notas: Mapped[str | None] = mapped_column(Text, nullable=True)
