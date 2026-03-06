# =============================================================================
# PlagaControl Frontend - Multi-stage: Ionic/Angular build + Nginx
# =============================================================================
# Etapa 1: Build de la aplicación Ionic + Angular
# -----------------------------------------------------------------------------
FROM node:18-alpine AS build

WORKDIR /app

# Dependencias (patches para postinstall de patch-package)
COPY package*.json ./
COPY patches ./patches/
RUN npm ci

# Código fuente y build de producción
COPY . .
RUN npm run build

# Angular 17+ application builder escribe en www/browser/, no en www/
# Verificamos que exista el artefacto antes de continuar
RUN test -f /app/www/browser/index.html || (echo "ERROR: Build no generó www/browser/index.html" && exit 1)

# -----------------------------------------------------------------------------
# Etapa 2: Servir con Nginx (sin página por defecto)
# -----------------------------------------------------------------------------
FROM nginx:alpine

# Limpiar directorio html por defecto de Nginx
RUN rm -rf /usr/share/nginx/html/*

# Eliminar configuración por defecto de Nginx
RUN rm -f /etc/nginx/conf.d/default.conf

# Copiar configuración Nginx personalizada para SPA + proxy API
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiar los archivos build del frontend a la raíz de Nginx
COPY --from=build /app/www/browser /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
