# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app
WORKDIR /app/front_modulo_administracion

COPY front_modulo_administracion/package.json ./
COPY packages/ui ../packages/ui
COPY shared_components ../shared_components
RUN npm install

COPY front_modulo_administracion ./
RUN npm run build

# Stage 2: Serve
FROM nginx:alpine
COPY --from=builder /app/front_modulo_administracion/dist /usr/share/nginx/html
EXPOSE 80
CMD ["sh", "-c", "echo 'server { listen 80; location / { root /usr/share/nginx/html; index index.html; try_files $uri $uri/ /index.html; } }' > /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'"]
