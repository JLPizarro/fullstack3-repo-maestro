from quart import Blueprint, request, jsonify, g
from src.utils.auth import login_required, require_permission

def create_producto_blueprint():
    bp = Blueprint('producto', __name__)

    @bp.route('/health', methods=['GET'])
    async def health():
        return jsonify({"status": "ok", "service": "bodega"}), 200

    @bp.route('/productos', methods=['POST'])
    @login_required
    @require_permission('bodega', 'edit')
    async def create_producto():
        data = await request.get_json()
        try:
            nuevo = await g.producto_service.crear_producto(data)
            return jsonify(nuevo.model_dump()), 201
        except Exception as e:
            return jsonify({"error": str(e)}), 400

    @bp.route('/productos', methods=['GET'])
    @login_required
    @require_permission('bodega', 'view')
    async def get_all():
        productos = await g.producto_service.obtener_todos()
        return jsonify([p.model_dump() for p in productos]), 200

    @bp.route('/productos/<int:id>', methods=['GET'])
    @login_required
    @require_permission('bodega', 'view')
    async def get_by_id(id):
        producto = await g.producto_service.obtener_por_id(id)
        if producto:
            return jsonify(producto.model_dump()), 200
        return jsonify({"error": "Producto no encontrado"}), 404

    @bp.route('/productos/<int:id>', methods=['PUT'])
    @login_required
    @require_permission('bodega', 'edit')
    async def update_producto(id):
        data = await request.get_json()
        actualizado = await g.producto_service.actualizar_producto(id, data)
        if actualizado:
            return jsonify(actualizado.model_dump()), 200
        return jsonify({"error": "Producto no encontrado"}), 404

    @bp.route('/productos/<int:id>', methods=['DELETE'])
    @login_required
    @require_permission('bodega', 'edit')
    async def delete_producto(id):
        exito = await g.producto_service.eliminar_producto(id)
        if exito:
            return '', 204
        return jsonify({"error": "Producto no encontrado"}), 404

    @bp.route('/devoluciones/verificar', methods=['POST'])
    @login_required
    @require_permission('bodega', 'edit')
    async def verificar_devolucion():
        data = await request.get_json()
        producto_id = data.get('producto_id')
        cantidad = data.get('cantidad_devuelta')
        if not producto_id or not cantidad:
            return jsonify({"error": "Faltan datos"}), 400
        
        actualizado = await g.producto_service.verificar_devolucion_repuesto(producto_id, cantidad)
        if actualizado:
            return jsonify(actualizado.model_dump()), 200
        return jsonify({"error": "Producto no encontrado en Bodega"}), 404

    return bp
