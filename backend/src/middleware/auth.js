/**
 * Middleware JWT - Verificación de token en rutas protegidas
 */
const jwt = require('jsonwebtoken');
const db = require('../models');

const JWT_SECRET = process.env.JWT_SECRET || 'plaga-secret-key';

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Token no proporcionado' });
    }
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    const usuario = await db.Usuario.findByPk(decoded.userId);
    if (!usuario || !usuario.activo) {
      return res.status(401).json({ success: false, message: 'Usuario no válido' });
    }
    req.user = usuario;
    req.userId = usuario.id;
    req.userRol = usuario.rol;
    next();
  } catch (err) {
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ success: false, message: 'Token inválido' });
    }
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Token expirado' });
    }
    next(err);
  }
};

/**
 * Middleware para Control de Acceso basado en Roles (RBAC)
 * @param {...string} roles Permitidos
 */
const verificarRol = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Usuario no autenticado' });
    }
    if (!roles.includes(req.user.rol)) {
      return res.status(403).json({ success: false, message: 'Acceso denegado: rol insuficiente' });
    }
    next();
  };
};

module.exports = { authMiddleware, verificarRol, JWT_SECRET };
