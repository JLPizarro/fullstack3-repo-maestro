from quart import Blueprint, request, jsonify, g
from src.utils.auth import login_required, require_permission
from datetime import date

def create_operacion_blueprint(service):
    bp = Blueprint('operacion', __name__)

    @bp.route('/health', methods=['GET'])
    async def health():
        return jsonify({"status": "ok", "service": "operacion"}), 200

    @bp.route('/viajes', methods=['POST'])
    @login_required
    @require_permission('operacion', 'edit')
    async def create_viaje():
        data = await request.get_json()
        # Convert strings to date objects if necessary
        for field in ['fecha', 'fecha_carga', 'fecha_descarga']:
            if data.get(field):
                data[field] = date.fromisoformat(data[field])
        
        viaje = await service.create_viaje(data)
        return jsonify({"id": viaje.id}), 201

    @bp.route('/viajes', methods=['GET'])
    @login_required
    @require_permission('operacion', 'view')
    async def get_viajes():
        fecha_inicio = request.args.get('fecha_inicio')
        fecha_fin = request.args.get('fecha_fin')
        
        viajes = await service.get_viajes(fecha_inicio, fecha_fin)
        return jsonify([{
            "id": v.id,
            "fecha": v.fecha.isoformat(),
            "estado": v.estado,
            "tipo_operativo": v.tipo_operativo,
            "conductor_nombre": v.conductor_nombre,
            "tracto_patente": v.tracto_patente,
            "rampla_patente": v.rampla_patente,
            "cliente_nombre": v.cliente_nombre,
            "servicio": v.servicio,
            "fecha_carga": v.fecha_carga.isoformat() if v.fecha_carga else None,
            "origen": v.origen,
            "fecha_descarga": v.fecha_descarga.isoformat() if v.fecha_descarga else None,
            "destino": v.destino,
            "valor_viaje": float(v.valor_viaje),
            "observaciones": v.observaciones,
            "pernoctacion": v.pernoctacion
        } for v in viajes])

    @bp.route('/viajes/<int:id>', methods=['PUT'])
    @login_required
    @require_permission('operacion', 'edit')
    async def update_viaje(id):
        data = await request.get_json()
        # Convert strings to date objects if necessary
        for field in ['fecha', 'fecha_carga', 'fecha_descarga']:
            if data.get(field) and isinstance(data[field], str):
                data[field] = date.fromisoformat(data[field])
        
        viaje = await service.update_viaje(id, data)
        if viaje:
            return jsonify({"id": viaje.id, "status": "updated"}), 200
        return jsonify({"error": "not found"}), 404

    @bp.route('/viajes/<int:id>', methods=['DELETE'])
    @login_required
    @require_permission('operacion', 'edit')
    async def delete_viaje(id):
        success = await service.delete_viaje(id)
        if success:
            return jsonify({"message": "deleted"}), 200
        return jsonify({"error": "not found"}), 404

    return bp
