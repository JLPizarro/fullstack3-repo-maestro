import os
import jwt
from quart import Quart, request, jsonify
from quart_cors import cors

app = Quart(__name__)
app = cors(app, allow_origin="*")

SECRET_KEY = os.getenv("JWT_SECRET", "super-secret-key-123")

@app.route('/health', methods=['GET'])
async def health():
    return jsonify({"status": "ok", "service": "middleware"}), 200

@app.route('/validate', methods=['GET', 'POST'])
async def validate():
    auth_header = request.headers.get("Authorization")
    
    if not auth_header or not auth_header.startswith("Bearer "):
        return jsonify({"error": "Missing token"}), 401
    
    token = auth_header.split(" ")[1]
    
    try:
        # Validar el token
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        
        # El middleware devuelve 200 para éxito
        # Podemos pasar info del usuario en los headers de respuesta
        # Nginx puede capturar estos y pasarlos al backend final
        response = jsonify({"status": "authorized", "user": payload.get("sub")})
        response.headers["X-User-ID"] = str(payload.get("sub", ""))
        response.headers["X-User-Role"] = str(payload.get("rol", ""))
        response.headers["X-User-Email"] = str(payload.get("email", ""))
        
        return response, 200
        
    except jwt.ExpiredSignatureError:
        return jsonify({"error": "Token expired"}), 401
    except jwt.InvalidTokenError:
        return jsonify({"error": "Invalid token"}), 401
    except Exception as e:
        return jsonify({"error": str(e)}), 401

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=8009)
