# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copiamos las dependencias globales compartidas primero
COPY packages/ui ./packages/ui
COPY shared_components ./shared_components

# Nos posicionamos en la carpeta del módulo
WORKDIR /app/front_modulo_rrhh

# Copiamos el package y las fuentes del módulo
COPY front_modulo_rrhh/package.json ./
RUN npm install

COPY front_modulo_rrhh ./
RUN npm run build

# Stage 2: Serve
FROM nginx:alpine
RUN mkdir -p /usr/share/nginx/html/rrhh
COPY --from=builder /app/front_modulo_rrhh/dist /usr/share/nginx/html/rrhh
EXPOSE 80
CMD ["sh", "-c", "echo 'server { listen 80; location /rrhh/ { root /usr/share/nginx/html; index index.html; try_files $uri $uri/ /rrhh/index.html; } }' > /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'"]