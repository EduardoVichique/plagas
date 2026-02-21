/**
 * Rutas de usuarios: /users
 */
const express = require('express');
const usersController = require('../controllers/usersController');
const { authMiddleware } = require('../middleware/auth');
const { uploadAvatar } = require('../middleware/upload');

const router = express.Router();

router.get('/perfil', authMiddleware, (req, res, next) => {
  req.params.id = req.userId;
  return usersController.getPerfil(req, res, next);
});
router.get('/:id/perfil', authMiddleware, usersController.getPerfil);
router.put('/perfil', authMiddleware, uploadAvatar.single('avatar'), usersController.actualizarPerfil);

module.exports = router;
