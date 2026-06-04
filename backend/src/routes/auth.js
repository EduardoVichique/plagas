/**
 * Rutas de autenticación: /auth
 */
const express = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const { handleValidationErrors } = require('../middleware/validator');
const { authMiddleware } = require('../middleware/auth');
const { logAudit } = require('../middleware/auditMiddleware');

const router = express.Router();

router.post(
  '/registro',
  [
    body('email').isEmail().normalizeEmail().withMessage('Debe ser un correo electrónico válido'),
    body('password').isStrongPassword({
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1
    }).withMessage('La contraseña debe tener al menos 8 caracteres, incluyendo 1 mayúscula, 1 minúscula, 1 número y 1 carácter especial'),
    body('nombre').trim().notEmpty().withMessage('El nombre es obligatorio').escape(),
    body('apellido').optional().trim().escape(),
    body('experiencia').optional().trim().escape(),
    body('tipo_cultivo').optional().trim().escape(),
    handleValidationErrors
  ],
  logAudit('Registro de nuevo usuario', (req, res) => req.body.email),
  authController.registro
);

router.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail().withMessage('Debe ser un correo electrónico válido'),
    body('password').notEmpty().withMessage('La contraseña es obligatoria'),
    handleValidationErrors
  ],
  logAudit('Inicio de sesión (Intento)', (req, res) => req.body.email),
  authController.login
);

router.post(
  '/mfa/login',
  [
    body('tempToken').notEmpty().withMessage('Token temporal requerido'),
    body('token').notEmpty().withMessage('Código MFA requerido'),
    handleValidationErrors
  ],
  authController.loginMfa
);

router.post(
  '/mfa/generate',
  authMiddleware,
  authController.generateMfa
);

router.post(
  '/mfa/verify',
  authMiddleware,
  [
    body('token').notEmpty().withMessage('Código MFA requerido'),
    handleValidationErrors
  ],
  authController.verifyMfa
);

router.get('/me', authMiddleware, authController.me);

module.exports = router;
