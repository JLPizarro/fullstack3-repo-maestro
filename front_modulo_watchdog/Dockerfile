# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copiamos las dependencias globales compartidas primero
COPY packages/ui ./packages/ui
COPY shared_components ./shared_components

# Nos posicionamos en la carpeta del módulo
WORKDIR /app/front_modulo_watchdog

# Copiamos el package y las fuentes del módulo
COPY front_modulo_watchdog/package.json ./
RUN npm install

COPY front_modulo_watchdog ./
RUN npm run build

# Stage 2: Serve
FROM nginx:alpine
RUN mkdir -p /usr/share/nginx/html/watchdog
COPY --from=builder /app/front_modulo_watchdog/dist /usr/share/nginx/html/watchdog
EXPOSE 80
CMD ["sh", "-c", "echo 'server { listen 80; location /watchdog/ { root /usr/share/nginx/html; index index.html; try_files $uri $uri/ /watchdog/index.html; } }' > /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'"]