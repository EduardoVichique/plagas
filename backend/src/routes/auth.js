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
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 6 }),
    body('nombre').trim().notEmpty(),
  ],
  logAudit('Registro de nuevo usuario', (req, res) => req.body.email),
  authController.registro
);

router.post(
  '/login',
  [body('email').isEmail().normalizeEmail(), body('password').notEmpty()],
  logAudit('Inicio de sesión (Intento)', (req, res) => req.body.email),
  authController.login
);

router.post('/mfa/login', [body('tempToken').notEmpty(), body('token').notEmpty()], authController.loginMfa);
router.post('/mfa/generate', authMiddleware, authController.generateMfa);
router.post('/mfa/verify', authMiddleware, [body('token').notEmpty()], authController.verifyMfa);

router.get('/me', authMiddleware, authController.me);

module.exports = router;
