# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app
WORKDIR /app/front_modulo_prevencion

COPY front_modulo_prevencion/package.json ./
COPY packages/ui ../packages/ui
COPY shared_components ../shared_components
RUN npm install

COPY front_modulo_prevencion ./
RUN npm run build

# Stage 2: Serve
FROM nginx:alpine
COPY --from=builder /app/front_modulo_prevencion/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
