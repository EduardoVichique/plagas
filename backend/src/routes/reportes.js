/**
 * Rutas de reportes: /reportes
 */
const express = require('express');
const reportesController = require('../controllers/reportesController');
const { authMiddleware } = require('../middleware/auth');
const { uploadReporte } = require('../middleware/upload');
const { logAudit } = require('../middleware/auditMiddleware');

const router = express.Router();

router.get('/', authMiddleware, reportesController.listar);
router.post('/', authMiddleware, uploadReporte.single('imagen'), logAudit('Crear Reporte', 'Reporte'), reportesController.crear);
router.get('/:id', authMiddleware, reportesController.obtener);
router.put('/:id', authMiddleware, uploadReporte.single('imagen'), logAudit('Actualizar Reporte', 'Reporte'), reportesController.actualizar);
router.delete('/:id', authMiddleware, logAudit('Eliminar Reporte', 'Reporte'), reportesController.eliminar);
router.post('/:id/comentarios', authMiddleware, logAudit('Comentar Reporte', 'Reporte'), reportesController.agregarComentario);

module.exports = router;
