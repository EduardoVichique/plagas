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

const app = express();

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
