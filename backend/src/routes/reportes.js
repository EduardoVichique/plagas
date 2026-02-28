/**
 * Rutas de reportes: /reportes
 */
const express = require('express');
const reportesController = require('../controllers/reportesController');
const { authMiddleware } = require('../middleware/auth');
const { uploadReporte } = require('../middleware/upload');

const { body, param } = require('express-validator');
const { handleValidationErrors } = require('../middleware/validator');

const router = express.Router();

router.get('/', authMiddleware, reportesController.listar);

router.post(
    '/',
    authMiddleware,
    uploadReporte.single('imagen'),
    [
        body('titulo').trim().notEmpty().withMessage('El título es requerido').escape(),
        body('descripcion').optional().trim().escape(),
        body('latitud').optional().isFloat().withMessage('La latitud debe ser un número flotante').toFloat(),
        body('longitud').optional().isFloat().withMessage('La longitud debe ser un número flotante').toFloat(),
        body('tipo_plaga').optional().trim().escape(),
        handleValidationErrors
    ],
    reportesController.crear
);

router.get(
    '/:id',
    authMiddleware,
    [
        param('id').isInt().withMessage('ID inválido').toInt(),
        handleValidationErrors
    ],
    reportesController.obtener
);

router.put(
    '/:id',
    authMiddleware,
    uploadReporte.single('imagen'),
    [
        param('id').isInt().withMessage('ID inválido').toInt(),
        body('titulo').optional().trim().notEmpty().withMessage('El título no puede estar vacío').escape(),
        body('descripcion').optional().trim().escape(),
        body('latitud').optional().isFloat().toFloat(),
        body('longitud').optional().isFloat().toFloat(),
        body('tipo_plaga').optional().trim().escape(),
        body('estado').optional().trim().escape(),
        handleValidationErrors
    ],
    reportesController.actualizar
);

router.delete(
    '/:id',
    authMiddleware,
    [
        param('id').isInt().withMessage('ID inválido').toInt(),
        handleValidationErrors
    ],
    reportesController.eliminar
);

router.post(
    '/:id/comentarios',
    authMiddleware,
    [
        param('id').isInt().withMessage('ID inválido').toInt(),
        body('contenido').trim().notEmpty().withMessage('El contenido es requerido').escape(),
        handleValidationErrors
    ],
    reportesController.agregarComentario
);

module.exports = router;
