from sqlalchemy.future import select
from src.models.usuario_db import UsuarioDB
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

async def seed_admin_user(session):
    # Verificar si ya existen usuarios
    result = await session.execute(select(UsuarioDB))
    if result.scalars().first():
        return # Ya hay datos en la DB

    usuarios_seed = [
        # 1. Super Admin (Todos los accesos)
        UsuarioDB(
            nombre="Administrador Global",
            email="admin@asdf.cl",
            password_hash=pwd_context.hash("admin123"),
            permisos={
                "administracion": "edit", "rrhh": "edit", "bodega": "edit",
                "mantenciones": "edit", "operacion": "edit", "facturacion": "edit",
                "prevencion": "edit", "acreditacion": "edit", "watchdog": "edit"
            },
            estado=True
        ),
        # 2. Gestor de RRHH (Solo edición en RRHH)
        UsuarioDB(
            nombre="Gestor RRHH",
            email="rrhh@asdf.cl",
            password_hash=pwd_context.hash("user123"),
            permisos={"rrhh": "edit"},
            estado=True
        ),
        # 3. Visor de Bodega (Solo lectura en Bodega)
        UsuarioDB(
            nombre="Visor Bodega",
            email="bodega_visor@asdf.cl",
            password_hash=pwd_context.hash("user123"),
            permisos={"bodega": "view"},
            estado=True
        ),
        # 4. Operador de Mantención (Edición Mantención, Lectura Bodega)
        UsuarioDB(
            nombre="Operador Mantención",
            email="mantencion@asdf.cl",
            password_hash=pwd_context.hash("user123"),
            permisos={"mantenciones": "edit", "bodega": "view"},
            estado=True
        ),
        # 5. Despachador de Operaciones (Edición Operación, Lectura Facturación)
        UsuarioDB(
            nombre="Despachador Operaciones",
            email="operacion@asdf.cl",
            password_hash=pwd_context.hash("user123"),
            permisos={"operacion": "edit", "facturacion": "view"},
            estado=True
        )
    ]

    session.add_all(usuarios_seed)
    await session.commit()
    print(">>> Usuarios de prueba sembrados correctamente en la base de datos.")
