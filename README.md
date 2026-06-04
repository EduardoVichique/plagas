# PlagaControl 🌿

Sistema completo de control y reporte de plagas agrícolas.  
Stack: **Ionic + Angular 17** · **Node.js + Express** · **PostgreSQL 15** · **Docker**

---

## 📁 Estructura del proyecto

```
plagacontrol/
├── backend/              # API REST Node.js + Express + Sequelize
│   ├── src/
│   │   ├── config/       # Configuración BD y mailer
│   │   ├── controllers/  # Lógica de peticiones HTTP
│   │   ├── middleware/   # Auth JWT, roles, validación, auditoría
│   │   ├── models/       # Modelos Sequelize (ORM)
│   │   ├── routes/       # Definición de endpoints
│   │   └── utils/        # Logger Winston
│   ├── migrations/       # Migraciones Sequelize
│   ├── .env.example      # Variables de entorno de referencia
│   └── Dockerfile
├── frontend/             # Ionic + Angular 17 (NgModules)
│   ├── src/
│   ├── nginx.conf        # Configuración Nginx con proxy HTTPS
│   ├── certs/            # Certificados SSL auto-firmados (incluidos)
│   └── Dockerfile
├── database/
│   └── init.sql          # Script inicial de PostgreSQL
├── docker-compose.yml
└── README.md
```

---

## 🚀 Levantar con Docker (recomendado — un solo comando)

### Requisitos previos
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) instalado y corriendo
- Git

### Pasos

```bash
# 1. Clonar el repositorio
git clone https://github.com/EduardoVichique/plagas.git
cd plagas

# 2. Levantar todos los servicios (PostgreSQL + Backend + Frontend)
docker-compose up --build
```

> La primera vez tarda ~3–5 minutos mientras descarga imágenes y construye el frontend Angular.

### URLs disponibles

| Servicio | URL |
|----------|-----|
| **Frontend (web)** | https://localhost *(acepta el certificado auto-firmado)* |
| **Backend API** | http://localhost:3000 |
| **PostgreSQL** | localhost:5432 |

La base de datos se inicializa **automáticamente** con `database/init.sql` (tablas + datos de ejemplo).  
Las migraciones Sequelize se ejecutan automáticamente al iniciar el contenedor del backend.

---

## 🛠️ Desarrollo local (sin Docker)

### 1. Base de datos PostgreSQL

Tener PostgreSQL 15 instalado localmente y ejecutar:

```bash
psql -U postgres -f database/init.sql
```

O crear manualmente:

```sql
CREATE USER plaga_user WITH PASSWORD 'plaga_pass_secure';
CREATE DATABASE plagacontrol OWNER plaga_user;
\c plagacontrol
-- ejecutar el contenido de database/init.sql
```

### 2. Backend

```bash
cd backend

# Copiar variables de entorno y ajustar DB_HOST a localhost
cp .env.example .env.development

# Editar .env.development:
# DB_HOST=localhost
# JWT_SECRET=cambia-esto-por-algo-seguro

npm install
npm run dev
```

API disponible en: **http://localhost:3000**

### 3. Frontend

```bash
cd frontend
npm install
npm start
```

App disponible en: **http://localhost:4200**

> Verificar que `src/environments/environment.ts` tenga `apiUrl: 'http://localhost:3000/api'`

---

## 🔐 Seguridad implementada

| Característica | Implementación |
|---|---|
| Autenticación | JWT (7 días de expiración) |
| Doble Factor (MFA) | TOTP con speakeasy + código QR |
| Contraseñas | bcrypt con sal |
| Validación de inputs | express-validator + sanitización |
| Protección headers | Helmet.js |
| Rate limiting | express-rate-limit (100 req/15min) |
| Roles | admin / user con middleware de autorización |
| Auditoría | Registro en BD + logs Winston |
| HTTPS | Nginx con TLS 1.2/1.3 |

---

## 📡 API REST — Endpoints

> Todos los endpoints protegidos requieren header: `Authorization: Bearer <token>`

### Autenticación
| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/auth/registro` | Registro de usuario |
| POST | `/api/auth/login` | Login (devuelve JWT o tempToken si MFA activo) |
| GET | `/api/auth/me` | Perfil del usuario autenticado |
| POST | `/api/auth/mfa/generate` | Generar secreto TOTP + QR code 🔒 |
| POST | `/api/auth/mfa/verify` | Activar MFA con código TOTP 🔒 |
| POST | `/api/auth/mfa/login` | Login con código MFA TOTP |

### Usuarios
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/users/perfil` | Perfil + estadísticas 🔒 |
| PUT | `/api/users/perfil` | Actualizar perfil + avatar 🔒 |
| GET | `/api/users` | Listar usuarios 🔒👑 |
| GET | `/api/users/:id` | Detalle de usuario 🔒👑 |

### Reportes
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/reportes` | Listar reportes 🔒 |
| POST | `/api/reportes` | Crear reporte + imagen 🔒 |
| GET | `/api/reportes/:id` | Detalle de reporte 🔒 |
| PUT | `/api/reportes/:id` | Actualizar reporte 🔒 |
| DELETE | `/api/reportes/:id` | Eliminar reporte 🔒 |
| POST | `/api/reportes/:id/comentarios` | Añadir comentario 🔒 |

### Foro
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/foro/temas` | Listar temas 🔒 |
| POST | `/api/foro/temas` | Crear tema 🔒 |
| GET | `/api/foro/temas/:id` | Tema + respuestas 🔒 |
| POST | `/api/foro/temas/:id/respuestas` | Responder tema 🔒 |
| POST | `/api/foro/temas/:id/ayuda` | +1 útil a tema 🔒 |

### Guías
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/guias` | Listar guías 🔒 |
| GET | `/api/guias/:id` | Detalle de guía 🔒 |
| POST | `/api/guias` | Crear guía 🔒👑 |
| PUT | `/api/guias/:id` | Actualizar guía 🔒👑 |
| DELETE | `/api/guias/:id` | Eliminar guía 🔒👑 |

> 🔒 = requiere autenticación · 👑 = requiere rol `admin`

---

## 📱 Compilar para Android (Capacitor)

```bash
cd frontend
npm install
npm run build

npx cap add android      # Solo la primera vez
npx cap sync android
npx cap open android     # Abre Android Studio
```

Ejecutar desde Android Studio con dispositivo físico o emulador.

---

## 🐳 Variables de entorno

Copiar `.env.example` a `.env.development` o `.env.production` y ajustar:

```env
NODE_ENV=development
PORT=3000
DB_HOST=localhost          # postgres (en Docker) | localhost (local)
DB_PORT=5432
DB_NAME=plagacontrol
DB_USER=plaga_user
DB_PASSWORD=plaga_pass_secure
JWT_SECRET=cambia-esto-en-produccion
JWT_EXPIRES_IN=7d
UPLOAD_PATH=./uploads
```

---

## 🧱 Tecnologías

| Capa | Tecnología |
|------|-----------|
| Frontend | Ionic 7, Angular 17, Bootstrap 5, Leaflet, Capacitor |
| Backend | Node.js 18, Express 4, Sequelize 6 |
| Base de datos | PostgreSQL 15 |
| Auth | JWT, bcrypt, speakeasy (TOTP/MFA) |
| Infraestructura | Docker, Docker Compose, Nginx |
| Logging | Winston |

---

## Licencia

Uso educativo / proyecto interno.
