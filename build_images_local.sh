#!/bin/bash
# =====================================================================
# Script para compilar todas las imagenes locales del proyecto
# =====================================================================

echo "====================================================================="
echo "   COMPILANDO IMÁGENES LOCALES PARA DESPLIEGUE EN KUBERNETES"
echo "====================================================================="

# 1. Base de datos
echo -e "\n[*] Compilando db-postgres:local..."
docker build -t db-postgres:local ./db_postgres

# 2. Backends (Contexto es la carpeta del módulo)
backends=(
  "ms-middleware:modulo_middleware"
  "ms-acreditacion:modulo_acreditacion"
  "ms-administracion:modulo_administracion"
  "ms-bodega:modulo_bodega"
  "ms-facturacion:modulo_facturacion"
  "ms-mantencion:modulo_mantencion"
  "ms-operacion:modulo_operacion"
  "ms-prevencion:modulo_prevencion"
  "ms-rrhh:modulo_rrhh"
  "ms-watchdog:modulo_watchdog"
)

for item in "${backends[@]}"; do
  name="${item%%:*}"
  folder="${item##*:}"
  echo -e "\n[*] Compilando Backend $name (desde ./$folder)..."
  docker build -t "$name:latest" "./$folder"
done

# 3. Frontends (Contexto es la raíz del proyecto para acceder a shared_components y packages)
frontends=(
  "front-acreditacion:front_modulo_acreditacion"
  "front-administracion:front_modulo_administracion"
  "front-bodega:front_modulo_bodega"
  "front-facturacion:front_modulo_facturacion"
  "front-login:front_modulo_login"
  "front-mantencion:front_modulo_mantencion"
  "front-operacion:front_modulo_operacion"
  "front-prevencion:front_modulo_prevencion"
  "front-rrhh:front_modulo_rrhh"
  "front-watchdog:front_modulo_watchdog"
)

for item in "${frontends[@]}"; do
  name="${item%%:*}"
  folder="${item##*:}"
  echo -e "\n[*] Compilando Frontend $name (usando ./$folder/Dockerfile)..."
  docker build -t "$name:latest" -f "./$folder/Dockerfile" .
done

echo -e "\n====================================================================="
echo "   ¡COMPILACIÓN COMPLETADA EXITOSAMENTE!"
echo "====================================================================="
