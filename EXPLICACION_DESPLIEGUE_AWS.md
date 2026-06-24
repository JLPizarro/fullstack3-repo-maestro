# Contexto del Despliegue en AWS EKS (CI/CD y Helm)

Este documento detalla todos los archivos, configuraciones y flujos de trabajo involucrados en el proceso de integración y despliegue continuo (CI/CD) del monorepo a AWS EKS (Elastic Kubernetes Service) utilizando GitHub Actions y Helm.

---

## 1. Flujo de Trabajo de GitHub Actions
El archivo principal es `.github/workflows/deploy.yml`.

### Disparadores (Triggers)
- **Push a la rama `deploy`**: Cada cambio en esta rama inicia el despliegue automático.
- **Manual (Workflow Dispatch)**: Se puede ejecutar manualmente desde GitHub, con la opción de forzar la reconstrucción de todos los componentes (`build_all: true`).

### Fases del Pipeline de CI/CD

#### Fase 0: Checkout y Login de Docker
- Descarga el código de forma recursiva (incluyendo submódulos git).
- Se autentica en GitHub Container Registry (`ghcr.io`) usando el token interno de GitHub (`GITHUB_TOKEN`).

#### Fase 1.5: Imagen de la Base de Datos
- Construye la imagen de Postgres ubicada en `db_postgres/` (que incluye la extensión `pg_cron`).
- La etiqueta como `ghcr.io/<owner>/db-postgres:latest` y la sube al registro.

#### Fase 1: Detección Inteligente de Cambios (Build Incremental)
- Compara los archivos modificados en el último commit (`git diff HEAD~1 HEAD`).
- Identifica qué carpetas de backend (`modulo_*`) y frontend (`front_modulo_*`) tienen cambios.
- Si se detectan cambios en archivos compartidos (`shared_components/`, `packages/` o `.github/`), se fuerza la reconstrucción de **todos** los módulos.
- Define las variables de salida `backends` y `frontends` para utilizarlas en los siguientes pasos.

#### Fase 2: Construcción de Backends (ms)
- Recorre la lista de backends modificados.
- Reemplaza el prefijo `modulo_` por `ms-` para nombrar la imagen final.
- Construye las imágenes usando el directorio de cada módulo como contexto (`./modulo_<nombre>`).
- Sube las imágenes a `ghcr.io/<owner>/ms-<nombre>:latest`.

#### Fase 3: Construcción de Frontends (front)
- Recorre la lista de frontends modificados.
- Reemplaza el prefijo `front_modulo_` por `front-` para nombrar la imagen.
- **Importante:** Construye las imágenes usando la **raíz del proyecto** (`.`) como contexto de Docker, ya que los Dockerfiles de los frontends necesitan copiar dependencias ubicadas en carpetas compartidas (`shared_components/` y `packages/`).

#### Fase 5: Despliegue en AWS EKS
- **Credenciales AWS:** Utiliza `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY` y `AWS_SESSION_TOKEN` (definidos en los secrets del repositorio de GitHub) para autenticarse en la región `us-east-1`.
- **Configuración de Acceso:** Configura kubectl para conectarse al clúster ejecutando:
  ```bash
  aws eks update-kubeconfig --region us-east-1 --name cluster-maestro
  ```
- **Parche de EBS CSI Controller:** Aplica un `kubectl patch` a `ebs-csi-controller` en el namespace `kube-system` para agregar el flag `--skip-region-validation=true`, omitiendo validaciones estrictas de región durante el arranque del driver CSI.
- **NGINX Ingress Controller:** Aplica la configuración base para el balanceador de carga de AWS y espera a que los Pods de Ingress estén listos.
- **Verificación de Almacenamiento:** Valida la existencia de la StorageClass `ebs-sc` en el clúster (requerido para EKS Auto Mode).
- **Despliegue con Helm:** Ejecuta `helm upgrade --install` utilizando el archivo de configuración `values-aws.yaml` e inyecta los secrets requeridos mediante `--set`:
  - `global.jwtSecret`: Clave secreta para tokens JWT.
  - `database.password` y `database.passwordPlaintext`: Contraseña para la base de datos PostgreSQL.
  - `database.storageClassName`: Configurado como `ebs-sc` para usar almacenamiento EBS gestionado automáticamente.
  - Parámetros de Sitrack para el módulo de mantención.
- **Rollout Refresh:** Fuerza a Kubernetes a reiniciar los Pods (`kubectl rollout restart deployment -n default`) para descargar las nuevas versiones recién subidas a GHCR.

---

## 2. Archivos de Configuración de Helm
Ubicación: `kubernetes/helm/modular-app/`

### A. values-aws.yaml
Es el archivo de configuración principal para AWS (`values-aws.yaml`).
- **Database:**
  - `enabled: true`: Levanta un pod de PostgreSQL dentro del clúster para ahorrar costos de RDS.
  - `storageSize: 2Gi`
  - `storageClassName: ebs-sc`: Clave de almacenamiento nativa para EKS Auto Mode.
  - `nodeSelector`: Filtra por arquitectura `kubernetes.io/arch: amd64` para obligar al pod de base de datos a correr en nodos AMD64 (evitando errores de compatibilidad binaria).
- **Ingress:** Configura el controlador `nginx` con host vacío para enrutar tráfico directamente por el DNS del balanceador de carga.
- **Backend & Frontend Specs:** Define recursos (CPU/Memoria), réplicas, HPAs (Horizontal Pod Autoscalers) y endpoints para cada uno de los microservicios y aplicaciones web.

### B. Plantillas de Kubernetes (Templates)
- `db-postgres.yaml`: Define un `StatefulSet` para persistir los datos de PostgreSQL y un `Service` interno llamado `db-global`.
- `deployment-backend.yaml`: Crea los deployments para los microservicios de Python, les asigna los límites de hardware y les inyecta secretos.
- `secrets.yaml`: Codifica las credenciales a Base64 e inyecta la cadena de conexión `DATABASE_URL` formateada como:
  `postgresql+asyncpg://<usuario>:<password>@db-global:5432/<dbname>`
- `ingress.yaml`: Expone los frontends y rutea las llamadas `/api/v1/*` al middleware y a sus respectivos backends.

---

## 3. Conexión de Aplicaciones Backend
Los microservicios de Python leen la cadena de conexión usando variables de entorno en su código:
```python
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql+asyncpg://admin:admin123@db-global:5432/asdf_db")
```
- Si la variable `DATABASE_URL` está definida (inyectada por el Kubernetes Secret), la aplicación la prefiere.
- Si no está definida (entorno local o compose rápido), intenta conectarse al fallback por defecto.
