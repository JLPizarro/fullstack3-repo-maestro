from quart import Blueprint, request, jsonify, g
from src.utils.auth import login_required, require_permission

def create_incidente_blueprint():
    bp = Blueprint('incidente', __name__)

    @bp.route('/health', methods=['GET'])
    async def health():
        return jsonify({"status": "ok", "service": "prevencion"}), 200

    @bp.route('/incidentes', methods=['POST'])
    @login_required
    @require_permission('prevencion', 'edit')
    async def create_incidente():
        data = await request.get_json()
        try:
            nuevo = await g.current_service.crear_incidente(data)
            return jsonify(nuevo.model_dump(mode='json')), 201
        except Exception as e:
            return jsonify({"error": str(e)}), 400

    @bp.route('/incidentes', methods=['GET'])
    @login_required
    @require_permission('prevencion', 'view')
    async def get_all():
        incidentes = await g.current_service.obtener_todos()
        return jsonify([i.model_dump(mode='json') for i in incidentes]), 200

    @bp.route('/incidentes/<int:id>', methods=['GET'])
    @login_required
    @require_permission('prevencion', 'view')
    async def get_by_id(id):
        incidente = await g.current_service.obtener_por_id(id)
        if incidente:
            return jsonify(incidente.model_dump(mode='json')), 200
        return jsonify({"error": "Incidente no encontrado"}), 404

    @bp.route('/incidentes/<int:id>', methods=['PUT'])
    @login_required
    @require_permission('prevencion', 'edit')
    async def update_incidente(id):
        data = await request.get_json()
        actualizado = await g.current_service.actualizar_incidente(id, data)
        if actualizado:
            return jsonify(actualizado.model_dump(mode='json')), 200
        return jsonify({"error": "Incidente no encontrado"}), 404

    @bp.route('/incidentes/<int:id>', methods=['DELETE'])
    @login_required
    @require_permission('prevencion', 'edit')
    async def delete_incidente(id):
        exito = await g.current_service.eliminar_incidente(id)
        if exito:
            return '', 204
        return jsonify({"error": "Incidente no encontrado"}), 404

    return bp
