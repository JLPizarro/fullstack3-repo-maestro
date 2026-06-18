import asyncio
import os
from quart import Quart, g
from quart_cors import cors
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker

from src.repository.producto_repository import ProductoRepository
from src.service.producto_service import ProductoService
from src.controller.producto_controller import create_producto_blueprint

from src.repository.ingreso_repository import IngresoRepository
from src.service.ingreso_service import IngresoService
from src.controller.ingreso_controller import create_ingreso_blueprint

from src.repository.solicitud_repository import SolicitudRepository
from src.service.solicitud_service import SolicitudService
from src.controller.solicitud_controller import create_solicitud_blueprint

app = Quart(__name__)
app = cors(app, allow_origin="*", allow_headers=["Content-Type", "Authorization"], allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"])

# Configuración Postgres Async (asyncpg)
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
async def setup_db():
    global _engine, _async_session, _loop
    current_loop = asyncio.get_running_loop()
    if _engine is None or _loop != current_loop:
        _engine = create_async_engine(DATABASE_URL, pool_size=10, max_overflow=20, pool_pre_ping=True, echo=False)
        _async_session = async_sessionmaker(_engine, expire_on_commit=False)
        _loop = current_loop
    
        from src.models.producto_db import Base
    # Note: Import specific models if needed, but Base.metadata.create_all usually covers them
    
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
    
    # Producto
    repo_prod = ProductoRepository(session)
    service_prod = ProductoService(repo_prod)
    
    # Ingreso
    repo_ing = IngresoRepository(session)
    service_ing = IngresoService(repo_ing)
    
    # Solicitud
    repo_sol = SolicitudRepository(session)
    service_sol = SolicitudService(repo_sol, repo_prod)
    
    g.producto_service = service_prod
    g.ingreso_service = service_ing
    g.solicitud_service = service_sol
    g.current_session = session


@app.after_request
async def cleanup(response):
    if hasattr(g, 'current_session'):
        await g.current_session.close()
    return response


# Global Error Handler
@app.errorhandler(Exception)
async def handle_exception(e):
    app.logger.error(f"Global error: {str(e)}")
    return {"error": "Internal Server Error", "message": str(e)}, 500


# Registrar blueprint de Productos
bp_prod = create_producto_blueprint()
app.register_blueprint(bp_prod, url_prefix='/api/v1/bodega')


# Registrar blueprint de Ingresos
bp_ing = create_ingreso_blueprint()
app.register_blueprint(bp_ing, url_prefix='/api/v1/bodega')


# Registrar blueprint de Solicitudes
bp_sol = create_solicitud_blueprint()
app.register_blueprint(bp_sol, url_prefix='/api/v1/bodega')
