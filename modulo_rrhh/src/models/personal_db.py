from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column
from sqlalchemy import String, Boolean, Text
from datetime import datetime


class Base(DeclarativeBase):
    pass


class PersonalDB(Base):
    __tablename__ = "personal"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    nombre: Mapped[str] = mapped_column(String(100))
    nombre2: Mapped[str | None] = mapped_column(String(100), nullable=True)
    apellido1: Mapped[str] = mapped_column(String(100))
    apellido2: Mapped[str | None] = mapped_column(String(100), nullable=True)
    cargo: Mapped[str] = mapped_column(String(100))
    rut: Mapped[str] = mapped_column(String(20), unique=True)
    base: Mapped[str] = mapped_column(String(100))
    estado: Mapped[bool] = mapped_column(Boolean, default=True)
    motivo: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(default=datetime.utcnow)