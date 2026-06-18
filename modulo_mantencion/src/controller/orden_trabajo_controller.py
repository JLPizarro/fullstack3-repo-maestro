from quart import g, Blueprint, request, jsonify
from src.utils.auth import login_required, require_permission

def create_orden_trabajo_blueprint():
    bp = Blueprint('orden_trabajo', __name__)

    @bp.route('/', methods=['POST'])
    @login_required
    @require_permission('mantenciones', 'edit')
    async def crear_ot():
        data = await request.get_json()
        try:
            nueva = await g.service_ot.crear_ot(data)
            return jsonify(nueva), 201
        except Exception as e:
            return jsonify({"error": str(e)}), 400

    @bp.route('/<int:ot_id>/repuestos', methods=['POST'])
    @login_required
    @require_permission('mantenciones', 'edit')
    async def agregar_repuesto(ot_id):
        data = await request.get_json()
        try:
            nuevo = await g.service_ot.agregar_repuesto_ot(ot_id, data['producto_id'], data['cantidad'])
            return jsonify(nuevo), 201
        except Exception as e:
            return jsonify({"error": str(e)}), 400

    @bp.route('/repuestos/<int:repuesto_id>/devolver', methods=['POST'])
    @login_required
    @require_permission('mantenciones', 'edit')
    async def devolver_repuesto(repuesto_id):
        data = await request.get_json()
        try:
            res = await g.service_ot.solicitar_devolucion_repuesto(repuesto_id, data['cantidad_devuelta'])
            return jsonify(res), 200
        except Exception as e:
            return jsonify({"error": str(e)}), 400

    return bp
