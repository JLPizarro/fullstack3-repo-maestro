from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import String, DateTime, Boolean, JSON
from datetime import datetime
from src.models.base import Base

class UsuarioDB(Base):
    __tablename__ = "usuarios"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    nombre: Mapped[str] = mapped_column(String(150), nullable=False)
    email: Mapped[str] = mapped_column(String(150), unique=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    ultima_conexion: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    estado: Mapped[bool] = mapped_column(Boolean, default=True)
    
    # JSON structure: {"rrhh": "edit", "bodega": "view", "mantencion": "none"}
    permisos: Mapped[dict] = mapped_column(JSON, default=dict)
