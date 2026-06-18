from quart import Blueprint, request, jsonify, g
from src.models.personal import PersonalCreate, PersonalUpdate, PersonalResponse
from src.utils.auth import login_required, require_permission


def create_personal_blueprint():
    bp = Blueprint('personal', __name__)

    @bp.route('/health', methods=['GET'])
    async def health():
        return jsonify({"status": "ok", "service": "rrhh"}), 200

    # CREATE
    @bp.route('/', methods=['POST'])
    @login_required
    @require_permission('rrhh', 'edit')
    async def create():
        payload = await request.get_json()
        try:
            user_data = PersonalCreate(**payload).model_dump()
            result = await g.current_service.crear_nuevo_empleado(user_data)
            return jsonify(PersonalResponse.model_validate(result).model_dump()), 201
        except Exception as e:
            return jsonify({"error": str(e)}), 400

    # READ ALL
    @bp.route('/', methods=['GET'])
    @login_required
    @require_permission('rrhh', 'view')
    async def get_all():
        results = await g.current_service.obtener_todos()
        return jsonify([PersonalResponse.model_validate(r).model_dump() for r in results]), 200

    # READ ONE
    @bp.route('/<int:id>', methods=['GET'])
    @login_required
    @require_permission('rrhh', 'view')
    async def get_one(id):
        result = await g.current_service.obtener_por_id(id)
        if not result:
            return jsonify({"error": "Personal no encontrado"}), 404
        return jsonify(PersonalResponse.model_validate(result).model_dump()), 200

    # UPDATE
    @bp.route('/<int:id>', methods=['PUT'])
    @login_required
    @require_permission('rrhh', 'edit')
    async def update(id):
        payload = await request.get_json()
        try:
            update_data = PersonalUpdate(**payload).model_dump(exclude_unset=True)
            result = await g.current_service.actualizar_personal(id, update_data)
            if not result:
                return jsonify({"error": "No se pudo actualizar"}), 404
            return jsonify(PersonalResponse.model_validate(result).model_dump()), 200
        except Exception as e:
            return jsonify({"error": str(e)}), 400

    # DELETE
    @bp.route('/<int:id>', methods=['DELETE'])
    @login_required
    @require_permission('rrhh', 'edit')
    async def delete(id):
        success = await g.current_service.eliminar_personal(id)
        if not success:
            return jsonify({"error": "No se pudo eliminar"}), 404
        return jsonify({"mensaje": "Eliminado correctamente"}), 200

    return bp