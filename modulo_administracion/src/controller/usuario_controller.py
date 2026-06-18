from quart import Blueprint, request, jsonify, g
from src.utils.auth import login_required, require_permission

def create_usuario_blueprint():
    bp = Blueprint('usuario', __name__)

    @bp.route('/health', methods=['GET'])
    async def health():
        return jsonify({"status": "ok", "service": "administracion"}), 200

    @bp.route('/usuarios', methods=['POST'])
    @login_required
    @require_permission('administracion', 'edit')
    async def create_usuario():
        data = await request.get_json()
        try:
            nuevo = await g.usuario_service.crear_usuario(data)
            return jsonify(nuevo), 201
        except ValueError as e:
            return jsonify({"error": str(e)}), 400
        except Exception as e:
            return jsonify({"error": "Internal Error", "details": str(e)}), 500

    @bp.route('/usuarios', methods=['GET'])
    @login_required
    @require_permission('administracion', 'view')
    async def get_all():
        usuarios = await g.usuario_service.obtener_todos()
        return jsonify(usuarios), 200

    @bp.route('/usuarios/<int:id>', methods=['PUT'])
    @login_required
    @require_permission('administracion', 'edit')
    async def update_usuario(id):
        data = await request.get_json()
        actualizado = await g.usuario_service.actualizar_usuario(id, data)
        if actualizado:
            return jsonify(actualizado), 200
        return jsonify({"error": "No encontrado"}), 404

    @bp.route('/usuarios/<int:id>', methods=['DELETE'])
    @login_required
    @require_permission('administracion', 'edit')
    async def delete_usuario(id):
        exito = await g.usuario_service.eliminar_usuario(id)
        if exito:
            return '', 204
        return jsonify({"error": "No encontrado"}), 404

    @bp.route('/login', methods=['POST'])
    async def login():
        data = await request.get_json()
        try:
            user_data = await g.usuario_service.login(data['email'], data['password'])
            return jsonify({"message": "Login exitoso", "user": user_data}), 200
        except ValueError as e:
            return jsonify({"error": str(e)}), 401

    return bp
