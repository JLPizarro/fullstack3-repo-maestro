# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# 1. Copiar las dependencias globales compartidas requeridas por el monorepo
COPY packages/ui ./packages/ui
COPY shared_components ./shared_components

# 2. Copiar los archivos de configuración del módulo para aprovechar la caché de capas de Docker
COPY front_modulo_bodega/package.json ./front_modulo_bodega/
RUN cd front_modulo_bodega && npm install

# 3. Copiar el código fuente real del módulo e iniciar la compilación
COPY front_modulo_bodega/ ./front_modulo_bodega/
WORKDIR /app/front_modulo_bodega
RUN npm run build

# Stage 2: Serve (Entorno de producción minimalista Nginx Alpine)
FROM nginx:1.25-alpine

# Limpiar archivos por defecto de Nginx
RUN rm -rf /usr/share/nginx/html/*

# Crear directorio físico idéntico a la subruta productiva
RUN mkdir -p /usr/share/nginx/html/bodega

# Copiar el empaquetado final de la SPA de Vite
COPY --from=builder /app/front_modulo_bodega/dist /usr/share/nginx/html/bodega

EXPOSE 80

# CMD definitivo compatible con las sondas de salud (Liveness/Readiness Probes)
CMD ["sh", "-c", "echo 'server { listen 80; location / { root /usr/share/nginx/html/bodega; index index.html; try_files $uri $uri/ /index.html; } location /bodega/ { root /usr/share/nginx/html; index index.html; try_files $uri $uri/ /bodega/index.html; } }' > /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'"]