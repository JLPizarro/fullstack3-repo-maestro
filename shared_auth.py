import jwt
import os
import json
from functools import wraps
from quart import request, jsonify, g

SECRET_KEY = os.getenv("JWT_SECRET", "super-secret-key-123")
ALGORITHM = "HS256"

# En modo LXC / Gateway, el Nginx delante valida el token y propaga estos headers.
# En modo standalone (dev local), se decodifica el JWT directamente.
TRUSTED_GATEWAY = os.getenv("TRUSTED_GATEWAY", "true").lower() in ("true", "1", "yes")


def _load_from_gateway_headers():
    """
    Intenta cargar la identidad del usuario desde los headers propagados por Nginx.
    Returns True si los headers estaban presentes y se cargaron correctamente.
    """
    user_id = request.headers.get("X-User-ID")
    user_role = request.headers.get("X-User-Role")
    user_email = request.headers.get("X-User-Email")

    if user_id:
        g.user_id = user_id
        g.user_email = user_email or ""
        g.user_role = user_role or ""
        # Permisos: si viene como JSON serializado en un header, lo decodificamos
        raw_permisos = request.headers.get("X-User-Permisos")
        if raw_permisos:
            try:
                g.user_permisos = json.loads(raw_permisos)
            except Exception:
                g.user_permisos = {}
        else:
            g.user_permisos = {}
        return True
    return False


def _load_from_jwt():
    """
    Fallback: Decodifica el JWT del header Authorization directamente.
    Usado en modo standalone (desarrollo local dentro de un LXC sin gateway).
    Returns (True, None) on success or (False, error_response) on failure.
    """
    auth_header = request.headers.get("Authorization")
    if not auth_header:
        return False, (jsonify({"error": "Token faltante"}), 401)

    try:
        token = auth_header.split(" ")[1]
    except IndexError:
        return False, (jsonify({"error": "Formato de token inválido"}), 401)

    try:
        data = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        g.user_id = str(data.get("sub", ""))
        g.user_email = data.get("email", "")
        g.user_role = str(data.get("rol", ""))
        g.user_permisos = data.get("permisos", {})
        return True, None
    except jwt.ExpiredSignatureError:
        return False, (jsonify({"error": "Token expirado"}), 401)
    except jwt.InvalidTokenError:
        return False, (jsonify({"error": "Token inválido"}), 401)
    except Exception as e:
        return False, (jsonify({"error": str(e)}), 401)


def login_required(f):
    """
    Decorador de autenticación.
    
    Modo Gateway (TRUSTED_GATEWAY=true, por defecto):
      1. Lee X-User-ID, X-User-Role, X-User-Email desde headers de Nginx.
         Si no están presentes, el gateway no validó el token → rechaza.
    
    Modo Standalone (TRUSTED_GATEWAY=false):
      1. Decodifica el JWT directamente desde el header Authorization.
         Útil para correr el microservicio sin Nginx delante (dev local en LXC).
    """
    @wraps(f)
    async def decorated(*args, **kwargs):
        if TRUSTED_GATEWAY:
            # Modo Gateway: confiar en los headers de Nginx
            if not _load_from_gateway_headers():
                # Si no vienen los headers, el gateway no autenticó la petición
                return jsonify({"error": "No autenticado. Headers de gateway ausentes."}), 401
        else:
            # Modo Standalone: decodificar el JWT localmente
            ok, err = _load_from_jwt()
            if not ok:
                return err

        return await f(*args, **kwargs)
    return decorated


def require_permission(modulo, nivel_requerido='view'):
    """
    Decorador para verificar permisos específicos sobre un módulo.
    Niveles: 'none' < 'view' < 'edit'
    
    Requiere que login_required haya sido aplicado primero para poblar g.user_permisos.
    """
    def decorator(f):
        @wraps(f)
        async def decorated(*args, **kwargs):
            if not hasattr(g, 'user_permisos'):
                return jsonify({"error": "Autenticación requerida"}), 401

            permisos = g.user_permisos
            nivel_actual = permisos.get(modulo, 'none')

            niveles = {'none': 0, 'view': 1, 'edit': 2}

            if niveles.get(nivel_actual, 0) < niveles.get(nivel_requerido, 1):
                return jsonify({
                    "error": f"Permisos insuficientes para el módulo '{modulo}'. "
                             f"Requerido: '{nivel_requerido}', actual: '{nivel_actual}'."
                }), 403

            return await f(*args, **kwargs)
        return decorated
    return decorator
