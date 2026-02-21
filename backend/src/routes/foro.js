/**
 * Rutas del foro: /foro
 */
const express = require('express');
const foroController = require('../controllers/foroController');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

router.get('/temas', authMiddleware, foroController.listarTemas);
router.post('/temas', authMiddleware, foroController.crearTema);
router.get('/temas/:id', authMiddleware, foroController.obtenerTema);
router.put('/temas/:id', authMiddleware, foroController.actualizarTema);
router.delete('/temas/:id', authMiddleware, foroController.eliminarTema);
router.post('/temas/:id/ayuda', authMiddleware, foroController.agregarAyudaTema);
router.post('/temas/:id/respuestas', authMiddleware, foroController.crearRespuesta);
router.post('/respuestas/:id/ayuda', authMiddleware, foroController.agregarAyudaRespuesta);

module.exports = router;
