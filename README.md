# PlagaControl

Sistema móvil de control y reporte de plagas agrícolas. Aplicación completa con frontend Ionic + Angular, backend Node.js + Express, PostgreSQL y Docker.

## Estructura del proyecto

```
plagacontrol/
├── backend/          # API REST Node.js + Express + Sequelize
├── frontend/         # Ionic + Angular + Bootstrap 5
├── database/         # Script SQL PostgreSQL
├── docker-compose.yml
└── README.md
```

## Requisitos

- Node.js 18+
- Docker y Docker Compose
- (Opcional) Android Studio para compilar APK

---

## Ejecutar con Docker (recomendado)

Todo el sistema se levanta con un solo comando:

```bash
docker-compose up --build
```

- **Frontend (web):** http://localhost  
- **Backend API:** http://localhost:3000  
- **PostgreSQL:** localhost:5432 (usuario: `plaga_user`, BD: `plagacontrol`)

La base de datos se inicializa automáticamente con el script `database/init.sql` (tablas y guías de ejemplo).

---

## Desarrollo local (sin Docker)

### 1. Base de datos PostgreSQL

Crear base de datos y usuario (o usar los del script):

```bash
psql -U postgres -f database/init.sql
```

O crear manualmente:

```sql
CREATE USER plaga_user WITH PASSWORD 'plaga_pass_secure';
CREATE DATABASE plagacontrol OWNER plaga_user;
\c plagacontrol
-- luego ejecutar el contenido de database/init.sql
```

### 2. Backend

```bash
cd backend
cp .env.example .env
# Editar .env con DB_HOST=localhost y las credenciales
npm install
npm start
```

API en http://localhost:3000

### 3. Frontend

```bash
cd frontend
npm install
npm start
```

App en http://localhost:4200 (o el puerto que indique Angular).  
Configurar `src/environments/environment.ts` con `apiUrl: 'http://localhost:3000/api'` si usas otro puerto.

---

## API REST (resumen)

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/auth/registro` | Registro de usuario |
| POST | `/api/auth/login` | Login (devuelve JWT) |
| GET | `/api/auth/me` | Usuario actual (Bearer) |
| GET | `/api/users/perfil` | Perfil y estadísticas (Bearer) |
| PUT | `/api/users/perfil` | Actualizar perfil + avatar (Bearer) |
| GET | `/api/reportes` | Listar reportes (Bearer) |
| POST | `/api/reportes` | Crear reporte + imagen (Bearer) |
| GET | `/api/reportes/:id` | Detalle reporte (Bearer) |
| PUT | `/api/reportes/:id` | Actualizar reporte (Bearer) |
| DELETE | `/api/reportes/:id` | Eliminar reporte (Bearer) |
| POST | `/api/reportes/:id/comentarios` | Añadir comentario (Bearer) |
| GET | `/api/foro/temas` | Listar temas (Bearer) |
| POST | `/api/foro/temas` | Crear tema (Bearer) |
| GET | `/api/foro/temas/:id` | Tema + respuestas (Bearer) |
| POST | `/api/foro/temas/:id/ayuda` | +1 ayuda tema (Bearer) |
| POST | `/api/foro/temas/:id/respuestas` | Crear respuesta (Bearer) |
| POST | `/api/foro/respuestas/:id/ayuda` | +1 ayuda respuesta (Bearer) |
| GET | `/api/guias` | Listar guías (Bearer) |
| GET | `/api/guias/:id` | Detalle guía (Bearer) |

Autenticación: header `Authorization: Bearer <token>`.

---

## Compilar para Android (Capacitor)

1. El frontend ya incluye dependencias de Capacitor. Desde la raíz del repo:

```bash
cd frontend
```

2. Build de producción:

```bash
npm run build
```

3. Añadir plataforma Android y sincronizar:

```bash
npx cap add android
npx cap sync android
```

4. Abrir en Android Studio:

```bash
npx cap open android
```

En Android Studio: abrir el proyecto `frontend/android`, conectar dispositivo o emulador y ejecutar (Run).

### Permisos en Android

En `android/app/src/main/AndroidManifest.xml` deben estar (Capacitor suele añadirlos al usar los plugins):

- `android.permission.CAMERA`
- `android.permission.ACCESS_FINE_LOCATION` / `ACCESS_COARSE_LOCATION`
- `android.permission.READ_EXTERNAL_STORAGE` / `WRITE_EXTERNAL_STORAGE` (según necesidad)

Para desarrollo, configurar en `capacitor.config.ts` la URL del backend (por ejemplo tu IP local) si la app no usa el mismo host:

```ts
server: {
  url: 'http://192.168.1.X:3000',
  cleartext: true,
},
```

---

## Tecnologías

- **Frontend:** Ionic 7, Angular 17 (NgModules), Bootstrap 5, Ionic Icons, Leaflet (mapa), Capacitor (Android)
- **Backend:** Node.js, Express, Sequelize (PostgreSQL), JWT, Multer (imágenes)
- **Base de datos:** PostgreSQL 15
- **Infraestructura:** Docker, Docker Compose, Nginx

---

## Licencia

Uso educativo / proyecto interno.
