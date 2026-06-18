from quart import Blueprint, request, jsonify, g
from src.utils.auth import login_required, require_permission

def create_acreditacion_blueprint(service):
    bp = Blueprint('acreditacion', __name__)

    @bp.route('/health', methods=['GET'])
    async def health():
        return jsonify({"status": "ok", "service": "acreditacion"}), 200

    @bp.route('/clientes', methods=['POST'])
    @login_required
    @require_permission('acreditacion', 'edit')
    async def create_cliente():
        data = await request.get_json()
        cliente = await service.create_cliente(data)
        return jsonify({"id": cliente.id, "nombre": cliente.nombre}), 201

    @bp.route('/clientes', methods=['GET'])
    @login_required
    @require_permission('acreditacion', 'view')
    async def get_clientes():
        clientes = await service.get_all_clientes()
        return jsonify([{"id": c.id, "nombre": c.nombre, "rut": c.rut} for c in clientes])

    @bp.route('/requerimientos', methods=['POST'])
    @login_required
    @require_permission('acreditacion', 'edit')
    async def create_requerimiento():
        data = await request.get_json()
        req = await service.create_requerimiento(data)
        return jsonify({"id": req.id, "nombre": req.nombre}), 201

    @bp.route('/clientes/<int:cliente_id>/requerimientos', methods=['GET'])
    @login_required
    @require_permission('acreditacion', 'view')
    async def get_requerimientos(cliente_id):
        reqs = await service.get_requerimientos_by_cliente(cliente_id)
        return jsonify([{"id": r.id, "nombre": r.nombre, "descripcion": r.descripcion, "tipo_sujeto": r.tipo_sujeto.value} for r in reqs])

    @bp.route('/acreditaciones', methods=['POST'])
    @login_required
    @require_permission('acreditacion', 'edit')
    async def create_acreditacion():
        data = await request.get_json()
        acred = await service.create_acreditacion(data)
        return jsonify({"id": acred.id, "sujeto_id": acred.sujeto_id}), 201

    @bp.route('/acreditaciones', methods=['GET'])
    @login_required
    @require_permission('acreditacion', 'view')
    async def get_acreditaciones():
        sujeto_id = request.args.get('sujeto_id', type=int)
        tipo_sujeto = request.args.get('tipo_sujeto')
        acreds = await service.get_acreditaciones(sujeto_id, tipo_sujeto)
        return jsonify([{
            "id": a.id,
            "sujeto_id": a.sujeto_id,
            "requerimiento_id": a.requerimiento_id,
            "fecha_emision": a.fecha_emision.isoformat() if a.fecha_emision else None,
            "fecha_vencimiento": a.fecha_vencimiento.isoformat() if a.fecha_vencimiento else None,
            "link_documento": a.link_documento,
            "estado": a.estado
        } for a in acreds])

    return bp
