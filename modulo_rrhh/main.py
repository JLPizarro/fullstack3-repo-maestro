import asyncio
import os
from quart import Quart, g
from quart_cors import cors
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker
from src.repository.personal_repository import PersonalRepository
from src.service.personal_service import PersonalService
from src.controller.personal_controller import create_personal_blueprint

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
    
        from src.models.personal_db import Base
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
    repo = PersonalRepository(session)
    service = PersonalService(repo)
    g.current_service = service
    g.current_session = session


@app.after_request
async def cleanup(response):
    if hasattr(g, 'current_session'):
        await g.current_session.close()
    return response


# Global Error Handler
@app.errorhandler(Exception)
async def handle_exception(e):
    # Log the error
    app.logger.error(f"Global error: {str(e)}")
    return {"error": "Internal Server Error", "message": str(e)}, 500

# Registrar blueprint
bp = create_personal_blueprint()

app.register_blueprint(bp, url_prefix='/api/v1/personal')