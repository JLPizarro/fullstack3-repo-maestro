from quart import Blueprint, request, jsonify, g
from src.utils.auth import login_required, require_permission

def create_ingreso_blueprint():
    bp = Blueprint('ingreso', __name__)

    @bp.route('/ingresos', methods=['POST'])
    @login_required
    @require_permission('bodega', 'edit')
    async def create_ingreso():
        data = await request.get_json()
        try:
            nuevo = await g.ingreso_service.crear_ingreso(data)
            return jsonify(nuevo.model_dump(mode='json')), 201
        except Exception as e:
            return jsonify({"error": str(e)}), 400

    @bp.route('/ingresos', methods=['GET'])
    @login_required
    @require_permission('bodega', 'view')
    async def get_all():
        ingresos = await g.ingreso_service.obtener_todos()
        return jsonify([i.model_dump(mode='json') for i in ingresos]), 200

    return bp
