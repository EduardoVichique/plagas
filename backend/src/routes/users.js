/**
 * Rutas de usuarios: /users
 */
const express = require('express');
const usersController = require('../controllers/usersController');
const { authMiddleware } = require('../middleware/auth');
const { uploadAvatar } = require('../middleware/upload');

const { body, param } = require('express-validator');
const { handleValidationErrors } = require('../middleware/validator');

const router = express.Router();

router.get('/perfil', authMiddleware, (req, res, next) => {
  req.params.id = req.userId;
  return usersController.getPerfil(req, res, next);
});

router.get(
  '/:id/perfil',
  authMiddleware,
  [
    param('id').isInt().withMessage('ID debe ser un número entero').toInt(),
    handleValidationErrors
  ],
  usersController.getPerfil
);

router.put(
  '/perfil',
  authMiddleware,
  uploadAvatar.single('avatar'),
  [
    body('nombre').optional().trim().notEmpty().withMessage('Nombre no puede estar vacío').escape(),
    body('apellido').optional().trim().escape(),
    body('experiencia').optional().trim().escape(),
    body('tipo_cultivo').optional().trim().escape(),
    handleValidationErrors
  ],
  usersController.actualizarPerfil
);

module.exports = router;
