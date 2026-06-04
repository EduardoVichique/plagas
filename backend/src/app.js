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
const auditMiddleware = require('./middleware/auditMiddleware');
const helmet = require('helmet');

const app = express();

// Confiar en proxy si se despliega en Render o similar
app.set('trust proxy', 1);

// Redirección HTTP -> HTTPS en producción
app.use((req, res, next) => {
  if (process.env.NODE_ENV === 'production' && req.headers['x-forwarded-proto'] !== 'https') {
    return res.redirect(`https://${req.get('host')}${req.url}`);
  }
  next();
});

// Seguridad de headers de HTTP
app.use(helmet());

// Logging de auditoría
app.use(auditMiddleware);

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Archivos estáticos (imágenes subidas)
app.use('/uploads', express.static(path.resolve(UPLOAD_DIR)));

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
