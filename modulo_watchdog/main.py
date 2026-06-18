import time
import requests
import docker
import threading
import asyncio
from quart import Quart, jsonify, g
from quart_cors import cors
from src.utils.auth import login_required, require_permission

# Configuración
TIMEOUT_SECONDS = 5.0
CHECK_INTERVAL_SECONDS = 30.0
MAX_FAILURES = 2 # Cantidad de fallas consecutivas antes de reiniciar

# Diccionario de servicios a monitorear: {"container_name": "http_url"}
SERVICES_TO_MONITOR = {
    "ms_middleware": "http://ms-middleware:8009/health",
    "ms_rrhh": "http://ms-rrhh:8000/api/v1/personal/health",
    "ms_mantencion": "http://ms-mantencion:8000/api/v1/vehiculos/health",
    "ms_acreditacion": "http://ms-acreditacion:8000/api/v1/acreditacion/health",
    "ms_operacion": "http://ms-operacion:8000/api/v1/operacion/health",
    "ms_bodega": "http://ms-bodega:8000/api/v1/bodega/health",
    "ms_facturacion": "http://ms-facturacion:8000/api/v1/facturacion/health",
    "ms_prevencion": "http://ms-prevencion:8000/api/v1/prevencion/health",
    "ms_administracion": "http://ms-administracion:8007/api/v1/administracion/health"
}

# Estado interno
failures_count = {name: 0 for name in SERVICES_TO_MONITOR.keys()}
service_status = {name: "UP" for name in SERVICES_TO_MONITOR.keys()}

app = Quart(__name__)
app = cors(app, allow_origin="*", allow_headers=["Content-Type", "Authorization"], allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"])

def get_docker_client():
    try:
        return docker.from_env()
    except Exception as e:
        print(f"[ERROR] No se pudo conectar al socket de Docker: {e}")
        return None

def restart_container(client, container_name):
    print(f"[WATCHDOG] Reiniciando contenedor bloqueado: {container_name}...")
    try:
        container = client.containers.get(container_name)
        container.restart()
        print(f"[WATCHDOG] Contenedor {container_name} reiniciado exitosamente.")
    except docker.errors.NotFound:
        print(f"[ERROR] Contenedor {container_name} no encontrado en Docker.")
    except Exception as e:
        print(f"[ERROR] Fallo al intentar reiniciar {container_name}: {e}")

def monitor_loop(client):
    print(f"[WATCHDOG] Iniciando monitoreo... {list(SERVICES_TO_MONITOR.keys())}")
    while True:
        for container_name, url in SERVICES_TO_MONITOR.items():
            try:
                # Los health checks deben ser públicos para el watchdog interno
                response = requests.get(url, timeout=TIMEOUT_SECONDS)
                if response.status_code == 200:
                    failures_count[container_name] = 0
                    service_status[container_name] = "UP"
                else:
                    failures_count[container_name] = 0
                    service_status[container_name] = "UP (HTTP " + str(response.status_code) + ")"
            except (requests.exceptions.Timeout, requests.exceptions.ConnectionError):
                failures_count[container_name] += 1
                service_status[container_name] = "DOWN"
                print(f"[WARNING] {container_name} no respondió ({failures_count[container_name]}/{MAX_FAILURES})")
                
                if failures_count[container_name] >= MAX_FAILURES:
                    restart_container(client, container_name)
                    failures_count[container_name] = 0
            except Exception as e:
                print(f"[ERROR] Error monitoreando {container_name}: {e}")
                service_status[container_name] = "ERROR"

        time.sleep(CHECK_INTERVAL_SECONDS)

@app.route('/health')
async def health():
    return jsonify({"status": "healthy", "monitored_services": len(SERVICES_TO_MONITOR)})

@app.route('/status')
@login_required
@require_permission('administracion', 'view') # Solo admins ven el watchdog
async def status():
    return jsonify({
        "services": service_status,
        "failures": failures_count,
        "timestamp": time.time()
    })

if __name__ == "__main__":
    docker_client = get_docker_client()
    if docker_client:
        # Iniciar monitoreo en un hilo separado
        monitor_thread = threading.Thread(target=monitor_loop, args=(docker_client,), daemon=True)
        monitor_thread.start()
    else:
        print("[WARNING] No se pudo conectar a Docker. El autoreinicio estará desactivado.")
    
    # Iniciar servidor API siempre
    app.run(host='0.0.0.0', port=8008)
