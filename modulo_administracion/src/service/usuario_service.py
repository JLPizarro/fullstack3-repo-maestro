from datetime import datetime, timedelta
import jwt
import os
from passlib.context import CryptContext
from src.repository.usuario_repository import UsuarioRepository
from src.models.usuario_db import UsuarioDB

SECRET_KEY = os.getenv("JWT_SECRET", "super-secret-key-123")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 # 1 day

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class UsuarioService:
    def __init__(self, repository: UsuarioRepository):
        self.repository = repository

    def hash_password(self, password: str) -> str:
        return pwd_context.hash(password)

    def verify_password(self, plain_password: str, hashed_password: str) -> bool:
        return pwd_context.verify(plain_password, hashed_password)

    async def crear_usuario(self, data: dict) -> dict:
        # Check if email exists
        existente = await self.repository.get_by_email(data['email'])
        if existente:
            raise ValueError("El email ya está registrado.")

        # Hash password, default to '123456' if not provided
        raw_password = data.get('password', '123456')
        hashed_pw = self.hash_password(raw_password)

        nuevo = UsuarioDB(
            nombre=data['nombre'],
            email=data['email'],
            password_hash=hashed_pw,
            permisos=data.get('permisos', {})
        )
        creado = await self.repository.create(nuevo)
        return self._format_usuario(creado)

    async def obtener_todos(self) -> list[dict]:
        usuarios = await self.repository.get_all()
        return [self._format_usuario(u) for u in usuarios]

    async def obtener_por_id(self, id: int) -> dict | None:
        u = await self.repository.get_by_id(id)
        return self._format_usuario(u) if u else None

    async def actualizar_usuario(self, id: int, data: dict) -> dict | None:
        if 'password' in data and data['password']:
            data['password_hash'] = self.hash_password(data['password'])
            del data['password']
            
        u = await self.repository.update(id, data)
        return self._format_usuario(u) if u else None

    async def eliminar_usuario(self, id: int) -> bool:
        return await self.repository.delete(id)

    async def login(self, email: str, password: str) -> dict:
        usuario = await self.repository.get_by_email(email)
        if not usuario or not self.verify_password(password, usuario.password_hash):
            raise ValueError("Credenciales inválidas")
        
        # Update last connection
        await self.repository.update(usuario.id, {"ultima_conexion": datetime.utcnow()})
        
        # Generate JWT
        expires = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        payload = {
            "sub": str(usuario.id),
            "email": usuario.email,
            "nombre": usuario.nombre,
            "permisos": usuario.permisos,
            "exp": expires
        }
        token = jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)
        
        return {
            "token": token,
            "user": {
                "id": usuario.id,
                "nombre": usuario.nombre,
                "email": usuario.email
            }
        }

    def _format_usuario(self, u: UsuarioDB) -> dict:
        return {
            "id": u.id,
            "nombre": u.nombre,
            "email": u.email,
            "ultima_conexion": u.ultima_conexion.isoformat() if u.ultima_conexion else None,
            "estado": u.estado,
            "permisos": u.permisos
        }
