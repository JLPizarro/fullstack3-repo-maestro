from quart import Blueprint, request, jsonify, g
from src.utils.auth import login_required, require_permission
from src.models.vehiculo import VehiculoCreate, VehiculoUpdate
from pydantic import ValidationError

def create_vehiculo_blueprint():
    bp = Blueprint('vehiculos', __name__)

    @bp.route('/health', methods=['GET'])
    async def health():
        return jsonify({"status": "ok", "service": "mantencion"}), 200

    @bp.route('/', methods=['POST'])
    @login_required
    @require_permission('mantenciones', 'edit')
    async def create_vehiculo():
        data = await request.get_json()
        try:
            obj_in = VehiculoCreate(**data)
            result = await g.service_vehiculo.create_vehiculo(obj_in)
            return jsonify(result.model_dump(mode='json')), 201
        except ValidationError as e:
            return jsonify({"detail": e.errors()}), 422
        except Exception as e:
            return jsonify({"detail": str(e)}), 400

    @bp.route('/', methods=['GET'])
    @login_required
    @require_permission('mantenciones', 'view')
    async def get_vehiculos():
        limit = int(request.args.get('limit', 100))
        offset = int(request.args.get('offset', 0))
        result = await g.service_vehiculo.get_all_vehiculos(limit=limit, offset=offset)
        return jsonify([item.model_dump(mode='json') for item in result])

    @bp.route('/<int:id>', methods=['GET'])
    @login_required
    @require_permission('mantenciones', 'view')
    async def get_vehiculo(id):
        result = await g.service_vehiculo.get_vehiculo(id)
        if not result:
            return jsonify({"detail": "Vehiculo not found"}), 404
        return jsonify(result.model_dump(mode='json'))

    @bp.route('/<int:id>', methods=['PUT', 'PATCH'])
    @login_required
    @require_permission('mantenciones', 'edit')
    async def update_vehiculo(id):
        data = await request.get_json()
        try:
            obj_in = VehiculoUpdate(**data)
            result = await g.service_vehiculo.update_vehiculo(id, obj_in)
            if not result:
                return jsonify({"detail": "Vehiculo not found"}), 404
            return jsonify(result.model_dump(mode='json'))
        except ValidationError as e:
            return jsonify({"detail": e.errors()}), 422

    @bp.route('/<int:id>', methods=['DELETE'])
    @login_required
    @require_permission('mantenciones', 'edit')
    async def delete_vehiculo(id):
        success = await g.service_vehiculo.delete_vehiculo(id)
        if not success:
            return jsonify({"detail": "Vehiculo not found"}), 404
        return jsonify({"detail": "Deleted successfully"}), 200

    return bp
