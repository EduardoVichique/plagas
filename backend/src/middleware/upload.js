/**
 * Multer - Configuración para subida de imágenes
 */
const path = require('path');
const multer = require('multer');
const fs = require('fs');

const UPLOAD_DIR = process.env.UPLOAD_PATH || './uploads';
const REPORTES_DIR = path.join(UPLOAD_DIR, 'reportes');
const AVATARS_DIR = path.join(UPLOAD_DIR, 'avatars');

[UPLOAD_DIR, REPORTES_DIR, AVATARS_DIR].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

const storageReportes = multer.diskStorage({
  destination: (req, file, cb) => cb(null, REPORTES_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '.jpg';
    cb(null, `reporte-${Date.now()}${ext}`);
  },
});

const storageAvatares = multer.diskStorage({
  destination: (req, file, cb) => cb(null, AVATARS_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '.jpg';
    cb(null, `avatar-${req.userId}-${Date.now()}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = /image\/(jpeg|jpg|png|gif|webp)/;
  if (allowed.test(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten imágenes (jpeg, png, gif, webp)'), false);
  }
};

const uploadReporte = multer({
  storage: storageReportes,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

const uploadAvatar = multer({
  storage: storageAvatares,
  fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 },
});

module.exports = { uploadReporte, uploadAvatar, UPLOAD_DIR, REPORTES_DIR, AVATARS_DIR };
