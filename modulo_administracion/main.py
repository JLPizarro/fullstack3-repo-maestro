import os
from quart import Quart, g
from quart_cors import cors
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker

from src.repository.usuario_repository import UsuarioRepository
from src.service.usuario_service import UsuarioService
from src.controller.usuario_controller import create_usuario_blueprint

app = Quart(__name__)
app = cors(app, allow_origin="*", allow_headers=["Content-Type", "Authorization"], allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"])

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql+asyncpg://admin:admin123@db-global:5432/asdf_db")

import asyncio

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
    
    from src.models.base import Base
    import src.models.usuario_db
    from src.utils.seeder import seed_admin_user

    # Mecanismo de reintento para la base de datos
    retries = 5
    while retries > 0:
        try:
            async with _engine.begin() as conn:
                await conn.run_sync(Base.metadata.create_all)
            
            async with _async_session() as session:
                await seed_admin_user(session)
            print("Successfully connected to database and seeded data.")
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
    
    repo = UsuarioRepository(session)
    service = UsuarioService(repo)
    g.usuario_service = service
    
    g.current_session = session

@app.after_request
async def cleanup(response):
    if hasattr(g, 'current_session'):
        await g.current_session.close()
    return response

@app.errorhandler(Exception)
async def handle_exception(e):
    app.logger.error(f"Global error in Administracion: {str(e)}")
    return {"error": "Internal Server Error", "message": str(e)}, 500

bp_usuario = create_usuario_blueprint()

app.register_blueprint(bp_usuario, url_prefix='/api/v1/administracion')
