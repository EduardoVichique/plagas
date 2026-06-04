/**
 * Rutas del foro: /foro
 */
const express = require('express');
const foroController = require('../controllers/foroController');
const { authMiddleware } = require('../middleware/auth');

const { body, param } = require('express-validator');
const { handleValidationErrors } = require('../middleware/validator');

const router = express.Router();

router.get('/temas', authMiddleware, foroController.listarTemas);

router.post(
    '/temas',
    authMiddleware,
    [
        body('titulo').trim().notEmpty().withMessage('El título es requerido').escape(),
        body('contenido').trim().notEmpty().withMessage('El contenido es requerido').escape(),
        body('categoria').optional().trim().escape(),
        handleValidationErrors
    ],
    foroController.crearTema
);

router.get(
    '/temas/:id',
    authMiddleware,
    [
        param('id').isInt().withMessage('ID inválido').toInt(),
        handleValidationErrors
    ],
    foroController.obtenerTema
);

router.put(
    '/temas/:id',
    authMiddleware,
    [
        param('id').isInt().withMessage('ID inválido').toInt(),
        body('titulo').optional().trim().notEmpty().escape(),
        body('contenido').optional().trim().notEmpty().escape(),
        body('categoria').optional().trim().escape(),
        handleValidationErrors
    ],
    foroController.actualizarTema
);

router.delete(
    '/temas/:id',
    authMiddleware,
    [
        param('id').isInt().withMessage('ID inválido').toInt(),
        handleValidationErrors
    ],
    foroController.eliminarTema
);

router.post(
    '/temas/:id/ayuda',
    authMiddleware,
    [
        param('id').isInt().withMessage('ID inválido').toInt(),
        handleValidationErrors
    ],
    foroController.agregarAyudaTema
);

router.post(
    '/temas/:id/respuestas',
    authMiddleware,
    [
        param('id').isInt().withMessage('ID inválido').toInt(),
        body('contenido').trim().notEmpty().withMessage('El contenido no puede estar vacío').escape(),
        handleValidationErrors
    ],
    foroController.crearRespuesta
);

router.post(
    '/respuestas/:id/ayuda',
    authMiddleware,
    [
        param('id').isInt().withMessage('ID inválido').toInt(),
        handleValidationErrors
    ],
    foroController.agregarAyudaRespuesta
);

module.exports = router;
