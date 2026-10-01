/**
 * Aplicación Express - PlagaControl API
 */
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const authRoutes = require('./routes/auth');
const usersRoutes = require('./routes/users');
const reportesRoutes = require('./routes/reportes');
const foroRoutes = require('./routes/foro');
const guiasRoutes = require('./routes/guias');
const errorHandler = require('./middleware/errorHandler');
const { UPLOAD_DIR } = require('./middleware/upload');
const logger = require('./utils/logger');
const { auditMiddleware } = require('./middleware/auditMiddleware');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();

// Confiar en proxy si se despliega en Render o similar
app.set('trust proxy', 1);

// Habilitar CORS al inicio para todas las peticiones (incluyendo preflight OPTIONS)
app.use(cors({ origin: true, credentials: true }));

// Limitador de peticiones generales
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 300,
  message: {
    success: false,
    message: 'Demasiadas solicitudes desde esta IP, por favor intente de nuevo más tarde.',
    error: {}
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Limitador para autenticación
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 15,
  message: {
    success: false,
    message: 'Demasiados intentos de autenticación, intente de nuevo en 15 minutos.',
    error: {}
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Seguridad de headers de HTTP (permitiendo acceso a recursos entre diferentes orígenes)
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  crossOriginEmbedderPolicy: false,
}));

// Aplicar limitadores
app.use(generalLimiter);
app.use('/api/auth', authLimiter);

// Logging de auditoría
app.use(auditMiddleware);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Archivos estáticos (imágenes subidas) con permisos de origen cruzado explícitos
app.use('/uploads', (req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  next();
}, express.static(path.resolve(UPLOAD_DIR)));

// API REST
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/reportes', reportesRoutes);
app.use('/api/foro', foroRoutes);
app.use('/api/guias', guiasRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'PlagaControl API' });
});

app.use(errorHandler);

module.exports = app;
