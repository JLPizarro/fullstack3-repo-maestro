import jwt
import os
from functools import wraps
from quart import request, jsonify, g

SECRET_KEY = os.getenv("JWT_SECRET", "super-secret-key-123")
ALGORITHM = "HS256"

def login_required(f):
    @wraps(f)
    async def decorated(*args, **kwargs):
        token = None
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            try:
                token = auth_header.split(" ")[1]
            except IndexError:
                return jsonify({"error": "Formato de token inválido"}), 401

        if not token:
            return jsonify({"error": "Token faltante"}), 401

        try:
            data = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            g.user_id = data['sub']
            g.user_email = data['email']
            g.user_permisos = data.get('permisos', {})
        except jwt.ExpiredSignatureError:
            return jsonify({"error": "Token expirado"}), 401
        except jwt.InvalidTokenError:
            return jsonify({"error": "Token inválido"}), 401
        except Exception as e:
            return jsonify({"error": str(e)}), 401

        return await f(*args, **kwargs)
    return decorated

def require_permission(modulo, nivel_requerido='view'):
    """
    Decorador para verificar permisos específicos.
    Niveles: 'none', 'view', 'edit'
    """
    def decorator(f):
        @wraps(f)
        async def decorated(*args, **kwargs):
            # Primero verificar login
            if not hasattr(g, 'user_permisos'):
                # Si no ha pasado por login_required, forzarlo o fallar
                return jsonify({"error": "Autenticación requerida"}), 401
            
            permisos = g.user_permisos
            nivel_actual = permisos.get(modulo, 'none')
            
            # Jerarquía: edit > view > none
            niveles = {'none': 0, 'view': 1, 'edit': 2}
            
            if niveles.get(nivel_actual, 0) < niveles.get(nivel_requerido, 1):
                return jsonify({"error": f"Permisos insuficientes para el módulo {modulo}"}), 403
                
            return await f(*args, **kwargs)
        return decorated
    return decorator
