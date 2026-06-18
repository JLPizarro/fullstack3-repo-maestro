#!/bin/bash
# =====================================================================
# Script para cargar las imágenes de Docker locales en containerd de K3s
# =====================================================================

echo "====================================================================="
echo "   CARGANDO IMÁGENES LOCALES A K3S (CONTAINERD)"
echo "====================================================================="

# Lista de imágenes a cargar
images=(
  "db-postgres:local"
  "ms-middleware:latest"
  "ms-acreditacion:latest"
  "ms-administracion:latest"
  "ms-bodega:latest"
  "ms-facturacion:latest"
  "ms-mantencion:latest"
  "ms-operacion:latest"
  "ms-prevencion:latest"
  "ms-rrhh:latest"
  "ms-watchdog:latest"
  "front-acreditacion:latest"
  "front-administracion:latest"
  "front-bodega:latest"
  "front-facturacion:latest"
  "front-login:latest"
  "front-mantencion:latest"
  "front-operacion:latest"
  "front-prevencion:latest"
  "front-rrhh:latest"
  "front-watchdog:latest"
)

mkdir -p /tmp/k3s-images

for img in "${images[@]}"; do
  echo "[*] Exportando e importando: $img"
  # Guardamos la imagen localmente en un tar temporal y la importamos directamente a k3s
  docker save "$img" -o "/tmp/k3s-images/${img/:/_}.tar"
  if [ $? -eq 0 ]; then
      sudo k3s ctr images import "/tmp/k3s-images/${img/:/_}.tar"
  else
      echo "  [ERROR] No se pudo guardar la imagen $img. ¿Está construida?"
  fi
done

# Limpieza
rm -rf /tmp/k3s-images

echo -e "\n====================================================================="
echo "   ¡CARGA A K3S COMPLETADA EXITOSAMENTE!"
echo "====================================================================="
