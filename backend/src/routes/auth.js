/**
 * Rutas de autenticación: /auth
 */
const express = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const { handleValidationErrors } = require('../middleware/validator');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

router.post(
  '/registro',
  [
    body('email').isEmail().normalizeEmail().withMessage('Debe ser un correo electrónico válido'),
    body('password').isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres').escape(),
    body('nombre').trim().notEmpty().withMessage('El nombre es obligatorio').escape(),
    body('apellido').optional().trim().escape(),
    body('experiencia').optional().trim().escape(),
    body('tipo_cultivo').optional().trim().escape(),
    handleValidationErrors
  ],
  authController.registro
);

router.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail().withMessage('Debe ser un correo electrónico válido'),
    body('password').notEmpty().withMessage('La contraseña es obligatoria').escape(),
    handleValidationErrors
  ],
  authController.login
);

router.post(
  '/verify-mfa',
  [
    body('email').isEmail().normalizeEmail().withMessage('Debe ser un correo electrónico válido'),
    body('code').isLength({ min: 6, max: 6 }).isNumeric().withMessage('El código debe ser de 6 dígitos numéricos').escape(),
    handleValidationErrors
  ],
  authController.verifyMfa
);

router.get('/me', authMiddleware, authController.me);

module.exports = router;
