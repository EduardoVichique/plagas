/**
 * Rutas de guías: /guias
 */
const express = require('express');
const guiasController = require('../controllers/guiasController');
const { authMiddleware, verificarRol } = require('../middleware/auth');
const { body, param } = require('express-validator');
const { handleValidationErrors } = require('../middleware/validator');

const router = express.Router();

router.get('/', authMiddleware, guiasController.listar);

router.get(
    '/:id',
    authMiddleware,
    [
        param('id').isInt().withMessage('ID inválido').toInt(),
        handleValidationErrors
    ],
    guiasController.obtener
);

// Solo roles autorizados pueden crear, modificar o eliminar guías
router.post(
    '/',
    authMiddleware,
    verificarRol('admin'), // RBAC
    [
        body('titulo').trim().notEmpty().withMessage('El título es requerido').escape(),
        body('descripcion').optional().trim().escape(),
        body('tipo_plaga').optional().trim().escape(),
        body('informacion_tecnica').optional().trim().escape(),
        body('imagen_url').optional().trim().isURL().withMessage('Debe ser una URL válida'),
        handleValidationErrors
    ],
    guiasController.crear
);

router.put(
    '/:id',
    authMiddleware,
    verificarRol('admin'), // RBAC
    [
        param('id').isInt().withMessage('ID inválido').toInt(),
        body('titulo').optional().trim().escape(),
        body('descripcion').optional().trim().escape(),
        body('tipo_plaga').optional().trim().escape(),
        body('informacion_tecnica').optional().trim().escape(),
        body('imagen_url').optional().trim().isURL(),
        body('activo').optional().isBoolean().toBoolean(),
        handleValidationErrors
    ],
    guiasController.actualizar
);

router.delete(
    '/:id',
    authMiddleware,
    verificarRol('admin'), // RBAC
    [
        param('id').isInt().withMessage('ID inválido').toInt(),
        handleValidationErrors
    ],
    guiasController.eliminar
);

module.exports = router;
