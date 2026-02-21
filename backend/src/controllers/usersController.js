/**
 * Controlador de usuarios - Perfil y estadísticas
 */
const db = require('../models');
const { Op } = require('sequelize');

exports.getPerfil = async (req, res, next) => {
  try {
    const userId = parseInt(req.params.id, 10) || req.userId;
    const usuario = await db.Usuario.findByPk(userId, {
      attributes: { exclude: ['password_hash'] },
    });
    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    const [reportesCount, foroCount, respuestasCount] = await Promise.all([
      db.Reporte.count({ where: { usuario_id: userId } }),
      db.Foro.count({ where: { usuario_id: userId } }),
      db.Respuesta.count({ where: { usuario_id: userId } }),
    ]);
    const reportesRecientes = await db.Reporte.findAll({
      where: { usuario_id: userId },
      order: [['created_at', 'DESC']],
      limit: 5,
      attributes: ['id', 'titulo', 'estado', 'created_at'],
    });
    const temasRecientes = await db.Foro.findAll({
      where: { usuario_id: userId },
      order: [['created_at', 'DESC']],
      limit: 5,
      attributes: ['id', 'titulo', 'ayudas_count', 'created_at'],
    });
    res.json({
      user: usuario.toJSON(),
      stats: {
        reportes: reportesCount,
        temas_foro: foroCount,
        respuestas: respuestasCount,
      },
      actividad_reciente: {
        reportes: reportesRecientes,
        temas: temasRecientes,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.actualizarPerfil = async (req, res, next) => {
  try {
    const { nombre, apellido, experiencia, tipo_cultivo } = req.body;
    const usuario = await db.Usuario.findByPk(req.userId);
    if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado' });
    if (nombre !== undefined) usuario.nombre = nombre;
    if (apellido !== undefined) usuario.apellido = apellido;
    if (experiencia !== undefined) usuario.experiencia = experiencia;
    if (tipo_cultivo !== undefined) usuario.tipo_cultivo = tipo_cultivo;
    if (req.file && req.file.path) {
      const baseUrl = process.env.API_URL || 'http://localhost:3000';
      usuario.avatar_url = `${baseUrl}/uploads/avatars/${req.file.filename}`;
    }
    await usuario.save();
    res.json({
      id: usuario.id,
      email: usuario.email,
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      experiencia: usuario.experiencia,
      tipo_cultivo: usuario.tipo_cultivo,
      avatar_url: usuario.avatar_url,
    });
  } catch (err) {
    next(err);
  }
};
