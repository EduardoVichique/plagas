/**
 * Rutas de usuarios: /users
 */
const express = require('express');
const usersController = require('../controllers/usersController');
const { authMiddleware } = require('../middleware/auth');
const { uploadAvatar } = require('../middleware/upload');

const router = express.Router();
const { requireRole } = require('../middleware/roleMiddleware');

router.get('/admin', authMiddleware, requireRole(['admin']), usersController.getAllUsers);
router.get('/admin/auditorias', authMiddleware, requireRole(['admin']), usersController.getAuditLogs);

router.get('/perfil', authMiddleware, (req, res, next) => {
  req.params.id = req.userId;
  return usersController.getPerfil(req, res, next);
});
router.get('/:id/perfil', authMiddleware, usersController.getPerfil);
router.put('/perfil', authMiddleware, uploadAvatar.single('avatar'), usersController.actualizarPerfil);

module.exports = router;
