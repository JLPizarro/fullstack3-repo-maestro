from quart import Blueprint, request, jsonify, g
from src.utils.auth import login_required, require_permission
from src.models.reportes import ReportesCreate
from pydantic import ValidationError
from typing import List

def create_reportes_blueprint():
    bp = Blueprint('reportes', __name__)

    @bp.route('/', methods=['POST'])
    @login_required
    @require_permission('mantenciones', 'edit')
    async def create_reportes():
        data = await request.get_json()
        try:
            if isinstance(data, list):
                obj_in = [ReportesCreate(**item) for item in data]
                result = await g.service_reportes.create_multiple_reportes(obj_in)
                return jsonify(result), 201
            else:
                obj_in = ReportesCreate(**data)
                result = await g.service_reportes.create_reporte(obj_in)
                return jsonify(result.model_dump(mode='json')), 201
        except ValidationError as e:
            return jsonify({"detail": e.errors()}), 422
        except Exception as e:
            return jsonify({"detail": str(e)}), 400

    @bp.route('/', methods=['GET'])
    @login_required
    @require_permission('mantenciones', 'view')
    async def get_reportes():
        limit = int(request.args.get('limit', 100))
        offset = int(request.args.get('offset', 0))
        result = await g.service_reportes.get_all_reportes(limit=limit, offset=offset)
        return jsonify([item.model_dump(mode='json') for item in result])

    @bp.route('/<report_id>', methods=['GET'])
    @login_required
    @require_permission('mantenciones', 'view')
    async def get_reporte(report_id):
        result = await g.service_reportes.get_reporte_by_id(report_id)
        if not result:
            return jsonify({"detail": "Reporte not found"}), 404
        return jsonify(result.model_dump(mode='json'))

    return bp
