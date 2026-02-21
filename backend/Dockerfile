# PlagaControl Backend - Node Alpine
FROM node:18-alpine

WORKDIR /app

# Dependencias
COPY package*.json ./
RUN npm ci --omit=dev

# Código fuente
COPY . .

# Directorio para uploads
RUN mkdir -p uploads/reportes uploads/avatars

ENV NODE_ENV=production
EXPOSE 3000

CMD ["node", "src/server.js"]
