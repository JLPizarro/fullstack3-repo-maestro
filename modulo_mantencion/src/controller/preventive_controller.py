from quart import Blueprint, jsonify, current_app, g
from src.utils.auth import login_required, require_permission

def create_preventive_blueprint():
    bp = Blueprint('preventive', __name__)

    @bp.route('/status-preventivo', methods=['GET'])
    @login_required
    @require_permission('mantenciones', 'view')
    async def get_status():
        try:
            status = await g.service_preventive.get_preventive_status()
            return jsonify(status), 200
        except Exception as e:
            return jsonify({"error": str(e)}), 500

    return bp
