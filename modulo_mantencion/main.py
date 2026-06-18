import os
import asyncio
from quart import Quart, g
from quart_cors import cors
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker

from src.repository.vehiculo_repository import VehiculoRepository
from src.service.vehiculo_service import VehiculoService
from src.controller.vehiculo_controller import create_vehiculo_blueprint

from src.repository.mantencion_repository import MantencionRepository
from src.service.mantencion_service import MantencionService
from src.controller.mantencion_controller import create_mantencion_blueprint

from src.repository.reportes_repository import ReportesRepository
from src.service.reportes_service import ReportesService
from src.controller.reportes_controller import create_reportes_blueprint

from src.service.preventive_service import PreventiveService
from src.controller.preventive_controller import create_preventive_blueprint

from src.repository.orden_trabajo_repository import OrdenTrabajoRepository
from src.service.orden_trabajo_service import OrdenTrabajoService

from src.repository.mantencion_template_repository import MantencionTemplateRepository
from src.service.mantencion_template_service import MantencionTemplateService
from src.controller.mantencion_template_controller import create_mantencion_template_blueprint

from src.controller.orden_trabajo_controller import create_orden_trabajo_blueprint

app = Quart(__name__)
app = cors(app, allow_origin="*", allow_headers=["Content-Type", "Authorization"], allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"])

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql+asyncpg://admin:admin123@localhost:5432/asdf_db")


_engine = None
_async_session = None
_loop = None

def get_async_session():
    global _engine, _async_session, _loop
    current_loop = asyncio.get_running_loop()
    if _async_session is None or _loop != current_loop:
        _engine = create_async_engine(DATABASE_URL, pool_size=10, max_overflow=20, pool_pre_ping=True, echo=False)
        _async_session = async_sessionmaker(_engine, expire_on_commit=False)
        _loop = current_loop
    return _async_session()

@app.before_serving
async def setup_app():
    global _engine, _async_session, _loop
    current_loop = asyncio.get_running_loop()
    if _engine is None or _loop != current_loop:
        _engine = create_async_engine(DATABASE_URL, pool_size=10, max_overflow=20, pool_pre_ping=True, echo=False)
        _async_session = async_sessionmaker(_engine, expire_on_commit=False)
        _loop = current_loop
    
    # Initialize PreventiveService and start worker
    app.preventive_service_instance = PreventiveService(_async_session)
    app.preventive_service_instance.start_worker()

    from src.models.base import Base
    from src.models.vehiculo_db import VehiculoDB
    from src.models.mantencion_db import MantencionDB
    from src.models.mantencion_template_db import MantencionTemplateDB
    from src.models.orden_trabajo_db import OrdenTrabajoDB
    from src.models.reportes_db import ReportesDB
    
    retries = 10
    while retries > 0:
        try:
            async with _engine.begin() as conn:
                await conn.run_sync(Base.metadata.create_all)
            print("Successfully connected to database.")
            break
        except Exception as e:
            retries -= 1
            print(f"Database connection failed. Retrying... ({retries} left). Error: {e}")
            if retries == 0:
                raise e
            await asyncio.sleep(5)


@app.before_request
async def inject_dependencies():
    session = get_async_session()
    
    repo_vehiculo = VehiculoRepository(session)
    service_vehiculo = VehiculoService(repo_vehiculo)
    g.service_vehiculo = service_vehiculo
    
    repo_reportes = ReportesRepository(session)
    service_reportes = ReportesService(repo_reportes)
    g.service_reportes = service_reportes
    
    repo_mantencion = MantencionRepository(session)
    service_mantencion = MantencionService(repo_mantencion, repo_vehiculo)
    g.service_mantencion = service_mantencion
    
    g.service_preventive = app.preventive_service_instance
    
    repo_ot = OrdenTrabajoRepository(session)
    g.service_ot = OrdenTrabajoService(repo_ot)
    
    repo_template = MantencionTemplateRepository(session)
    g.service_template = MantencionTemplateService(repo_template)
    
    g.current_session = session

@app.after_request
async def cleanup(response):
    if hasattr(g, 'current_session'):
        await g.current_session.close()
    return response

# Global Error Handler
from werkzeug.exceptions import HTTPException

@app.errorhandler(Exception)
async def handle_exception(e):
    if isinstance(e, HTTPException):
        return {"error": e.name, "message": e.description}, e.code
    app.logger.error(f"Global error in Mantencion: {str(e)}")
    return {"error": "Internal Server Error", "message": str(e)}, 500

bp_vehiculo = create_vehiculo_blueprint()
app.register_blueprint(bp_vehiculo, url_prefix='/api/v1/vehiculos')

bp_reportes = create_reportes_blueprint()
app.register_blueprint(bp_reportes, url_prefix='/api/v1/reportes')

bp_mantencion = create_mantencion_blueprint()
app.register_blueprint(bp_mantencion, url_prefix='/api/v1/mantenciones')

bp_preventive = create_preventive_blueprint()
app.register_blueprint(bp_preventive, url_prefix='/api/v1/preventive')

bp_ot = create_orden_trabajo_blueprint()
app.register_blueprint(bp_ot, url_prefix='/api/v1/ordenes-trabajo')

bp_template = create_mantencion_template_blueprint()
app.register_blueprint(bp_template, url_prefix='/api/v1/templates-mantencion')