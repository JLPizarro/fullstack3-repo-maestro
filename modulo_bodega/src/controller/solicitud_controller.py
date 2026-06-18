from quart import Blueprint, request, jsonify, g
from src.utils.auth import login_required, require_permission, g

def create_solicitud_blueprint():
    bp = Blueprint('solicitud', __name__)

    @bp.route('/solicitudes', methods=['POST'])
    @login_required
    @require_permission('bodega', 'edit')
    async def create_solicitud():
        data = await request.get_json()
        try:
            nueva = await g.solicitud_service.crear_solicitud(data)
            return jsonify(nueva), 201
        except ValueError as e:
            return jsonify({"error": str(e)}), 400

    @bp.route('/solicitudes', methods=['GET'])
    @login_required
    @require_permission('bodega', 'view')
    async def get_all():
        solicitudes = await g.solicitud_service.obtener_todas()
        return jsonify(solicitudes), 200

    @bp.route('/solicitudes/<int:id>/entregar', methods=['POST'])
    @login_required
    @require_permission('bodega', 'edit')
    async def entregar(id):
        try:
            actualizada = await g.solicitud_service.entregar_solicitud(id)
            return jsonify(actualizada), 200
        except ValueError as e:
            return jsonify({"error": str(e)}), 400

    @bp.route('/solicitudes/<int:id>/rechazar', methods=['POST'])
    @login_required
    @require_permission('bodega', 'edit')
    async def rechazar(id):
        try:
            actualizada = await g.solicitud_service.rechazar_solicitud(id)
            return jsonify(actualizada), 200
        except ValueError as e:
            return jsonify({"error": str(e)}), 400

    return bp
