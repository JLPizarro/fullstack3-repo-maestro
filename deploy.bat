@echo off
:: =====================================================================
:: Script interactivo de despliegue en Kubernetes (AWS EKS & Local K3s)
:: =====================================================================
title Selector de Despliegue - Maestro Kubernetes

:start
cls
echo =====================================================================
echo          SELECTOR DE DESPLIEGUE - MAESTRO KUBERNETES
echo =====================================================================
echo  1) Desplegar en AWS (EKS - Universidad / Produccion)
echo  2) Desplegar en Local (K3s/Minikube - Trabajo / Desarrollo)
echo  3) Eliminar despliegue AWS
echo  4) Eliminar despliegue Local
echo  5) Salir
echo =====================================================================
echo.
set /p opcion="Selecciona una opcion [1-5]: "

if "%opcion%"=="1" goto deploy_aws
if "%opcion%"=="2" goto deploy_local
if "%opcion%"=="3" goto delete_aws
if "%opcion%"=="4" goto delete_local
if "%opcion%"=="5" goto salir
echo.
echo [ERROR] Opcion invalida. Presiona cualquier tecla para reintentar...
pause >nul
goto start

:deploy_aws
echo.
echo =====================================================================
echo  [PROCESO] Iniciando despliegue en AWS (EKS)
echo =====================================================================
echo 1. Asegurate de tener configurado tu AWS CLI y kubectl apuntando a tu EKS.
echo 2. Asegurate de haber subido las imagenes a tu registro ECR.
echo.
:: Opcional: Descomenta la siguiente linea si tienes un nombre de contexto especifico
:: kubectl config use-context mi-contexto-aws
helm upgrade --install modular-app ./kubernetes/helm/modular-app -f ./kubernetes/helm/modular-app/values-aws.yaml
if %errorlevel% neq 0 (
    echo.
    echo [ERROR] El despliegue de Helm ha fallado.
) else (
    echo.
    echo [OK] Despliegue en AWS completado exitosamente.
)
pause
goto start

:deploy_local
echo.
echo =====================================================================
echo  [PROCESO] Iniciando despliegue en Kubernetes Local (K3s/Minikube)
echo =====================================================================
echo.
echo [*] IMPORTANTE: Construyendo imagen local de Postgres con pg_cron si no existe...
docker build -t db-postgres:local ./db_postgres
echo.
:: Opcional: Descomenta la siguiente linea si usas un contexto local especifico
:: kubectl config use-context default
helm upgrade --install modular-app ./kubernetes/helm/modular-app -f ./kubernetes/helm/modular-app/values-local.yaml
if %errorlevel% neq 0 (
    echo.
    echo [ERROR] El despliegue local de Helm ha fallado.
) else (
    echo.
    echo [OK] Despliegue local completado exitosamente.
)
pause
goto start

:delete_aws
echo.
echo =====================================================================
echo  [PROCESO] Eliminando despliegue de AWS (EKS)
echo =====================================================================
helm uninstall modular-app
pause
goto start

:delete_local
echo.
echo =====================================================================
echo  [PROCESO] Eliminando despliegue Local (K3s/Minikube)
echo =====================================================================
helm uninstall modular-app
pause
goto start

:salir
echo.
echo Saliendo del selector. Buen dia!
exit /b
