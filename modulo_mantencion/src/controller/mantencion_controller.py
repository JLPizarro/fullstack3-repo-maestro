from quart import Blueprint, request, jsonify, g
from src.utils.auth import login_required, require_permission
from src.models.mantencion import MantencionCreate, MantencionUpdate
from pydantic import ValidationError

def create_mantencion_blueprint():
    bp = Blueprint('mantenciones', __name__)

    @bp.route('/health', methods=['GET'])
    async def health():
        return jsonify({"status": "ok", "service": "mantencion"}), 200

    @bp.route('/', methods=['POST'])
    @login_required
    @require_permission('mantenciones', 'edit')
    async def create_mantencion():
        data = await request.get_json()
        try:
            obj_in = MantencionCreate(**data)
            result = await g.service_mantencion.create_mantencion(obj_in)
            return jsonify(result.model_dump(mode='json')), 201
        except ValidationError as e:
            print(f"VALIDATION ERROR: {e.errors()}")
            return jsonify({"detail": e.errors()}), 422
        except Exception as e:
            print(f"OTHER ERROR: {str(e)}")
            return jsonify({"detail": str(e)}), 400

    @bp.route('/', methods=['GET'])
    @login_required
    @require_permission('mantenciones', 'view')
    async def get_mantenciones():
        limit = int(request.args.get('limit', 100))
        offset = int(request.args.get('offset', 0))
        result = await g.service_mantencion.get_all_mantenciones(limit=limit, offset=offset)
        return jsonify([item.model_dump(mode='json') for item in result])

    @bp.route('/<int:id>', methods=['GET'])
    @login_required
    @require_permission('mantenciones', 'view')
    async def get_mantencion(id):
        result = await g.service_mantencion.get_mantencion(id)
        if not result:
            return jsonify({"detail": "Mantencion not found"}), 404
        return jsonify(result.model_dump(mode='json'))

    @bp.route('/<int:id>', methods=['PUT', 'PATCH'])
    @login_required
    @require_permission('mantenciones', 'edit')
    async def update_mantencion(id):
        data = await request.get_json()
        try:
            obj_in = MantencionUpdate(**data)
            result = await g.service_mantencion.update_mantencion(id, obj_in)
            if not result:
                return jsonify({"detail": "Mantencion not found"}), 404
            return jsonify(result.model_dump(mode='json'))
        except ValidationError as e:
            return jsonify({"detail": e.errors()}), 422

    @bp.route('/<int:id>', methods=['DELETE'])
    @login_required
    @require_permission('mantenciones', 'edit')
    async def delete_mantencion(id):
        success = await g.service_mantencion.delete_mantencion(id)
        if not success:
            return jsonify({"detail": "Mantencion not found"}), 404
        return jsonify({"detail": "Deleted successfully"}), 200

    return bp
