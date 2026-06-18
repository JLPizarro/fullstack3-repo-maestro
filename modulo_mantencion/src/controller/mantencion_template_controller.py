from quart import Blueprint, request, jsonify, g
from src.utils.auth import login_required, require_permission

def create_mantencion_template_blueprint():
    bp = Blueprint('mantencion_template', __name__)

    @bp.route('/', methods=['POST'])
    @login_required
    @require_permission('mantenciones', 'edit')
    async def crear_template():
        data = await request.get_json()
        try:
            nueva = await g.service_template.crear_template(data)
            return jsonify(nueva), 201
        except Exception as e:
            return jsonify({"error": str(e)}), 400

    @bp.route('/', methods=['GET'])
    @login_required
    @require_permission('mantenciones', 'view')
    async def get_all():
        templates = await g.service_template.obtener_todos()
        return jsonify(templates), 200

    return bp
