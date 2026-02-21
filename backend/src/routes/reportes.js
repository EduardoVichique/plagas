/**
 * Rutas de reportes: /reportes
 */
const express = require('express');
const reportesController = require('../controllers/reportesController');
const { authMiddleware } = require('../middleware/auth');
const { uploadReporte } = require('../middleware/upload');

const router = express.Router();

router.get('/', authMiddleware, reportesController.listar);
router.post('/', authMiddleware, uploadReporte.single('imagen'), reportesController.crear);
router.get('/:id', authMiddleware, reportesController.obtener);
router.put('/:id', authMiddleware, uploadReporte.single('imagen'), reportesController.actualizar);
router.delete('/:id', authMiddleware, reportesController.eliminar);
router.post('/:id/comentarios', authMiddleware, reportesController.agregarComentario);

module.exports = router;
