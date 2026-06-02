/**
 * Rutas de autenticación: /auth
 */
const express = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const { authMiddleware } = require('../middleware/auth');
const { logAudit } = require('../middleware/auditMiddleware');

const router = express.Router();

router.post(
  '/registro',
  [
    body('email', 'Debe ser un correo electrónico válido').isEmail().normalizeEmail(),
    body('password', 'La contraseña debe tener al menos 8 caracteres, 1 mayúscula, 1 minúscula, 1 número y 1 carácter especial')
      .isStrongPassword({ minLength: 8, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 1 }),
    body('nombre', 'El nombre es requerido').trim().notEmpty(),
  ],
  logAudit('Registro de nuevo usuario', (req, res) => req.body.email),
  authController.registro
);

router.post(
  '/login',
  [
    body('email', 'Debe ser un correo electrónico válido').isEmail().normalizeEmail(),
    body('password', 'La contraseña es requerida').notEmpty()
  ],
  logAudit('Inicio de sesión (Intento)', (req, res) => req.body.email),
  authController.login
);

router.post('/mfa/login', [body('tempToken').notEmpty(), body('token').notEmpty()], authController.loginMfa);
router.post('/mfa/generate', authMiddleware, authController.generateMfa);
router.post('/mfa/verify', authMiddleware, [body('token').notEmpty()], authController.verifyMfa);

router.get('/me', authMiddleware, authController.me);

module.exports = router;
