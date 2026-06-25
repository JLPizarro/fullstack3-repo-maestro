# Guía de Configuración Manual en Consola AWS (EKS y Base de Datos gp2)

Esta guía detalla paso a paso cómo configurar manualmente un clúster de **AWS EKS** desde la consola web de AWS (sin usar EKS Auto Mode), cómo habilitar almacenamiento persistente mediante el **Amazon EBS CSI Driver** usando la clase de almacenamiento estándar `gp2`, y cómo realizar el despliegue final de la base de datos y microservicios.

---

## 1. Arquitectura de Almacenamiento y Base de Datos (EKS Manual)

En un despliegue manual de EKS, el almacenamiento dinámico no viene preconfigurado. Debemos instalar y autorizar explícitamente el driver de almacenamiento.

### Componentes Clave:
* **StorageClass (`gp2`)**: Es la clase de almacenamiento estándar en AWS EKS. Al aprovisionar volúmenes persistentes (`PVC`), Kubernetes solicitará a AWS la creación de discos EBS (Elastic Block Store) tipo GP2. Todo el repositorio se ha configurado de manera uniforme para utilizar `gp2` a fin de evitar problemas de compatibilidad.
* **StatefulSet (`db-global`)**: Garantiza la estabilidad del nombre DNS interno (`db-global`) y que el volumen persistente de `2Gi` se asocie consistentemente al Pod de la base de datos.
* **Restricción de Arquitectura (AMD64)**: Dado que la imagen de la base de datos está compilada para arquitecturas de procesador x86_64/AMD64, el Pod se fuerza a correr en nodos AMD64 usando `nodeSelector` para evitar fallos de ejecución.

---

## 2. Configuración del Clúster y Grupo de Nodos en la Consola AWS

### Paso 2.1: Crear el Clúster EKS
1. Inicia sesión en la **Consola de AWS** y busca el servicio **Elastic Kubernetes Service (EKS)**.
2. Haz clic en **Create cluster** (o **Add cluster** -> **Create**).
3. **Configurar el Clúster**:
   - **Name**: `cluster-maestro`
   - **Kubernetes version**: Selecciona la versión recomendada (ej. `1.29` o `1.30`).
   - **Cluster service role**: Selecciona el rol IAM de servicio para tu EKS (generalmente provisto por tu cuenta o creado como `AWSServiceRoleForAmazonEKS`).
   - Haz clic en **Next**.
4. **Especificar Redes**:
   - Selecciona la **VPC** y las **Subnets** del clúster (deben ser al menos dos subredes públicas/privadas en diferentes zonas de disponibilidad).
   - En **Security groups**, asigna un grupo de seguridad que permita tráfico adecuado.
   - En **Cluster endpoint access**, selecciona **Public** (o **Public and private**) para que puedas conectarte externamente mediante tu máquina local usando `kubectl`.
   - Haz clic en **Next**.
5. **Configurar Registros (Logging)**: Deja la configuración por defecto y haz clic en **Next**.
6. **Seleccionar complementos por defecto**: Deja los complementos por defecto (`kube-proxy`, `CoreDNS`, `Amazon VPC CNI`) y haz clic en **Next**.
7. **Revisar y Crear**: Revisa todos los parámetros y haz clic en **Create**. La creación tomará de 10 a 15 minutos. Espera a que el estado sea **Active**.

### Paso 2.2: Crear el Grupo de Nodos (Node Group)
Una vez que el clúster esté activo:
1. Haz clic en el nombre de tu clúster (`cluster-maestro`) y ve a la pestaña **Compute** (Cómputo).
2. Desplázate hacia abajo hasta la sección **Node groups** y haz clic en **Add node group** (Agregar grupo de nodos).
3. **Configurar el Grupo de Nodos**:
   - **Name**: `grupo-nodos-maestro`
   - **Node IAM role**: Selecciona el rol IAM asignado a tus nodos EC2 de Kubernetes. 
     > [!IMPORTANT]
     > Este rol debe tener adjuntas al menos las políticas de AWS: `AmazonEKSWorkerNodePolicy`, `AmazonEC2ContainerRegistryReadOnly`, `AmazonEKS_CNI_Policy` y **`AmazonEBSCSIDriverPolicy`** (ve el Paso 3.1 para aprender a adjuntarla).
   - Haz clic en **Next**.
4. **Configurar la Computación y el Escalado**:
   - **AMI type**: `Amazon Linux 2` (o `Amazon Linux 2023`).
   - **Capacity type**: `On-Demand`.
   - **Instance types**: Selecciona **`t3.medium`** (escribe `t3.medium` en el buscador y elígelo. Evita usar micro/small para evitar errores de falta de memoria).
   - **Disk size**: `20 GiB`.
   - **Node Group scaling configuration**:
     - **Minimum size**: `2`
     - **Maximum size**: `3`
     - **Desired size**: `2` (esto garantiza que los microservicios quepan sin problemas).
   - Haz clic en **Next**.
5. **Configurar las subredes**: Elige las mismas subredes y haz clic en **Next**.
6. **Revisar y Crear**: Haz clic en **Create**. Tardará unos minutos en aprovisionar las instancias EC2 y cambiar su estado a **Active**.

---

## 3. Instalación del Driver de Almacenamiento (EBS CSI Driver) desde Consola

EKS manual requiere la instalación y autorización de un driver para interactuar con AWS EBS.

### Paso 3.1: Configurar los Permisos IAM para el Driver en la Consola
1. Abre una nueva pestaña de tu navegador e ingresa a la consola de **IAM (Identity and Access Management)**.
2. En el menú izquierdo, haz clic en **Roles**.
3. En la barra de búsqueda, busca y haz clic sobre el **rol de IAM que le asignaste a tus nodos de EKS** en el paso 2.2.
4. En la pestaña **Permissions** (Permisos), haz clic en el botón **Add permissions** (Agregar permisos) -> **Attach policies** (Adjuntar políticas).
5. En la barra de búsqueda, ingresa: **`AmazonEBSCSIDriverPolicy`**.
6. Marca la casilla de verificación al lado de dicha política y haz clic en el botón **Add permissions** (o **Attach policy**).

### Paso 3.2: Instalar el Add-on de AWS EBS CSI en la Consola de EKS
1. Vuelve a la consola de **EKS** y entra a la vista de tu clúster `cluster-maestro`.
2. Ve a la pestaña **Add-ons** (Complementos).
3. Haz clic en **Get more add-ons** (Obtener más complementos).
4. En el buscador, localiza **Amazon EBS CSI Driver**, marca su casilla de selección y haz clic en **Next**.
5. Selecciona la versión del complemento (deja la más reciente seleccionada por defecto).
6. En **Select IAM role**, selecciona la opción **Inherit from node** (Heredar del nodo), ya que le adjuntamos la política directamente al rol del nodo en el paso 3.1.
7. Haz clic en **Next** y luego en **Create**. El complemento se instalará y pasará a estado **Active** en unos momentos.

---

## 4. Conexión Local y Parche de Región (Terminal)

Una vez que tu infraestructura en la consola AWS esté configurada, abre tu terminal local para enlazar `kubectl` y aplicar el parche esencial para la región.

### Paso 4.1: Conectar `kubectl`
```bash
aws eks update-kubeconfig --region us-east-1 --name cluster-maestro
```

### Paso 4.2: Aplicar Parche de Región (Esencial en AWS Academy)
Las cuentas de AWS Academy y Sandboxes tienen directivas restrictivas que impiden la auto-detección regional del driver de almacenamiento. Ejecuta este comando en tu terminal para parchear el controlador y evitar que falle al arrancar:
```bash
kubectl patch deployment ebs-csi-controller -n kube-system --type='json' \
  -p='[{"op": "add", "path": "/spec/template/spec/containers/0/args/-", "value": "--skip-region-validation=true"}]'
```

### Paso 4.3: Verificar la Clase de Almacenamiento
El driver creará automáticamente la clase de almacenamiento estándar `gp2`. Verifica su estado en tu terminal:
```bash
kubectl get storageclass gp2
```

---

## 5. Preparación de la Base de Datos Personalizada (`pg_cron`)

> [!NOTE]
> **Paso Automatizado:** Si estás utilizando el pipeline de integración continua, el archivo [.github/workflows/deploy.yml](file:///home/jose-luis/Descargas/fullstack3-repo-maestro/.github/workflows/deploy.yml) compila automáticamente esta imagen y la sube a GitHub Container Registry (`ghcr.io`) en cada push a la rama `deploy`.

Si por algún motivo necesitas realizar este paso de forma **manual** (fuera de GitHub Actions), ejecuta:
```bash
# 1. Compilar localmente
docker build -t ghcr.io/<tu-usuario>/db-postgres:latest ./db_postgres

# 2. Subir al registro de imágenes
docker push ghcr.io/<tu-usuario>/db-postgres:latest
```

---

## 6. Proceso de Despliegue con Helm

> [!NOTE]
> **Paso Automatizado:** El pipeline de GitHub Actions se encarga de este proceso de despliegue de forma totalmente automática. 
> Para que funcione correctamente, debes asegurarte de configurar los siguientes **Repository Secrets** en tu repositorio de GitHub:
> * `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, y `AWS_SESSION_TOKEN` (credenciales de AWS).
> * `JWT_SECRET` (clave de firma para tokens JWT).
> * `DB_PASSWORD` (contraseña para el usuario `admin` de PostgreSQL).
> * `SITRACK_USER` y `SITRACK_PASS` (credenciales para el MS de mantención).

Si deseas realizar el despliegue de forma **manual** en tu terminal local (con kubectl apuntando a tu EKS), ejecuta:

```bash
# 1. Instalar NGINX Ingress Controller (requerido para el balanceador y enrutamiento)
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.8.2/deploy/static/provider/aws/deploy.yaml

# 2. Esperar que Ingress esté activo
kubectl wait --namespace ingress-nginx \
  --for=condition=ready pod \
  --selector=app.kubernetes.io/component=controller \
  --timeout=120s

# 3. Desplegar los servicios usando Helm (inyectando parámetros)
helm upgrade --install modular-app ./kubernetes/helm/modular-app \
  -f ./kubernetes/helm/modular-app/values-aws.yaml \
  --set global.image.registry="ghcr.io/<tu-usuario>" \
  --set global.jwtSecret="MiClaveSecretaSuperSeguraJWT" \
  --set database.password="ContrasenaSeguraDeMiBaseDeDatos" \
  --set database.passwordPlaintext="ContrasenaSeguraDeMiBaseDeDatos" \
  --set database.storageClassName="gp2" \
  --set backends.ms-mantencion.sitrackUser="miUsuarioSitrack" \
  --set backends.ms-mantencion.sitrackPass="miClaveSitrack"

# 4. Forzar reinicio de pods para descargar las últimas versiones de imágenes
kubectl rollout restart deployment -n default
```

---

## 7. Diagnóstico y Monitoreo de Almacenamiento y Base de Datos

Si tienes problemas para que la base de datos se ejecute, usa los siguientes comandos de diagnóstico en tu terminal:

* **Revisar si el Pod está esperando por almacenamiento**:
  ```bash
  kubectl describe pod db-global-0
  ```
  *(Si observas un evento `FailedScheduling` o `VolumeBinding`, comprueba el estado del driver EBS CSI en `kubectl get pods -n kube-system`).*

* **Revisar la Solicitud del Volumen Persistente (PVC)**:
  ```bash
  kubectl get pvc
  ```
  *(Debe mostrar estado `Bound`. Si está en `Pending`, la StorageClass `gp2` tiene problemas de comunicación con la API de AWS).*

* **Acceder y Validar pg_cron en la Base de Datos**:
  Una vez el pod esté `Running`, conéctate a él:
  ```bash
  kubectl exec -it db-global-0 -- psql -U admin -d asdf_db
  ```
  Dentro de psql, verifica que la extensión de cron diario esté cargada y activa:
  ```sql
  \dx pg_cron
  SELECT * FROM cron.job;
  ```
