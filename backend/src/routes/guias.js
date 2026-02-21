/**
 * Rutas de guías: /guias
 */
const express = require('express');
const guiasController = require('../controllers/guiasController');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

router.get('/', authMiddleware, guiasController.listar);
router.get('/:id', authMiddleware, guiasController.obtener);
router.post('/', authMiddleware, guiasController.crear);
router.put('/:id', authMiddleware, guiasController.actualizar);
router.delete('/:id', authMiddleware, guiasController.eliminar);

module.exports = router;
