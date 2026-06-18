from quart import Blueprint, request, jsonify, g
from src.utils.auth import login_required, require_permission

def create_factura_blueprint():
    bp = Blueprint('factura', __name__)

    @bp.route('/health', methods=['GET'])
    async def health():
        return jsonify({"status": "ok", "service": "facturacion"}), 200

    @bp.route('/facturas', methods=['POST'])
    @login_required
    @require_permission('facturacion', 'edit')
    async def create_factura():
        data = await request.get_json()
        try:
            nueva = await g.current_service.crear_factura(data)
            # Para Pydantic con Datetime: .model_dump(mode='json')
            return jsonify(nueva.model_dump(mode='json')), 201
        except Exception as e:
            return jsonify({"error": str(e)}), 400

    @bp.route('/facturas', methods=['GET'])
    @login_required
    @require_permission('facturacion', 'view')
    async def get_all():
        facturas = await g.current_service.obtener_todas()
        return jsonify([f.model_dump(mode='json') for f in facturas]), 200

    @bp.route('/facturas/<int:id>', methods=['GET'])
    @login_required
    @require_permission('facturacion', 'view')
    async def get_by_id(id):
        factura = await g.current_service.obtener_por_id(id)
        if factura:
            return jsonify(factura.model_dump(mode='json')), 200
        return jsonify({"error": "Factura no encontrada"}), 404

    @bp.route('/facturas/<int:id>', methods=['PUT'])
    @login_required
    @require_permission('facturacion', 'edit')
    async def update_factura(id):
        data = await request.get_json()
        actualizada = await g.current_service.actualizar_factura(id, data)
        if actualizada:
            return jsonify(actualizada.model_dump(mode='json')), 200
        return jsonify({"error": "Factura no encontrada"}), 404

    @bp.route('/facturas/<int:id>', methods=['DELETE'])
    @login_required
    @require_permission('facturacion', 'edit')
    async def delete_factura(id):
        exito = await g.current_service.eliminar_factura(id)
        if exito:
            return '', 204
        return jsonify({"error": "Factura no encontrada"}), 404

    return bp
