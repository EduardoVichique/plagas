# PlagaControl Backend - Node Alpine
FROM node:18-alpine

WORKDIR /app

# Dependencias (incluye devDependencies para sequelize-cli en migraciones)
COPY package*.json ./
RUN npm ci

# Código fuente
COPY . .

# Directorio para uploads
RUN mkdir -p uploads/reportes uploads/avatars

ENV NODE_ENV=production
EXPOSE 3000

CMD ["sh", "-c", "npx sequelize-cli db:migrate && node src/server.js"]
