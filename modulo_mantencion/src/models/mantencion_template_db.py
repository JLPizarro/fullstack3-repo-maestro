from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import String, BigInteger, JSON
from src.models.base import Base

class MantencionTemplateDB(Base):
    __tablename__ = "mantenciones_template"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    nombre: Mapped[str] = mapped_column(String(150), nullable=False)
    descripcion: Mapped[str | None] = mapped_column(String(500), nullable=True)
    tareas_json: Mapped[dict | None] = mapped_column(JSON, nullable=True) # Lista de tareas
    repuestos_json_default: Mapped[dict | None] = mapped_column(JSON, nullable=True) # Lista de diccionarios {producto_id: cantidad}
