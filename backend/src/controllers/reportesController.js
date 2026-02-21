/**
 * Controlador de reportes de plagas - CRUD y comentarios
 */
const db = require('../models');
const path = require('path');

const getImageUrl = (req, filename) => {
  const baseUrl = process.env.API_URL || 'http://localhost:3000';
  if (!filename) return null;
  return `${baseUrl}/uploads/reportes/${path.basename(filename)}`;
};

exports.listar = async (req, res, next) => {
  try {
    const { estado, usuario_id, limit = 50, offset = 0 } = req.query;
    const where = {};
    if (estado) where.estado = estado;
    if (usuario_id) where.usuario_id = parseInt(usuario_id, 10);
    const { count, rows } = await db.Reporte.findAndCountAll({
      where,
      include: [{ model: db.Usuario, as: 'Usuario', attributes: ['id', 'nombre', 'apellido', 'avatar_url'] }],
      order: [['created_at', 'DESC']],
      limit: Math.min(parseInt(limit, 10) || 50, 100),
      offset: parseInt(offset, 10) || 0,
    });
    res.json({ total: count, reportes: rows });
  } catch (err) {
    next(err);
  }
};

exports.crear = async (req, res, next) => {
  try {
    const { titulo, descripcion, latitud, longitud, tipo_plaga } = req.body;
    const imagen_url = req.file ? getImageUrl(req, req.file.filename) : null;
    const reporte = await db.Reporte.create({
      usuario_id: req.userId,
      titulo,
      descripcion: descripcion || null,
      latitud: latitud ? parseFloat(latitud) : null,
      longitud: longitud ? parseFloat(longitud) : null,
      imagen_url,
      tipo_plaga: tipo_plaga || null,
    });
    const conUsuario = await db.Reporte.findByPk(reporte.id, {
      include: [{ model: db.Usuario, as: 'Usuario', attributes: ['id', 'nombre', 'apellido', 'avatar_url'] }],
    });
    res.status(201).json(conUsuario);
  } catch (err) {
    next(err);
  }
};

exports.obtener = async (req, res, next) => {
  try {
    const reporte = await db.Reporte.findByPk(req.params.id, {
      include: [
        { model: db.Usuario, as: 'Usuario', attributes: ['id', 'nombre', 'apellido', 'avatar_url'] },
        { model: db.Comentario, as: 'Comentarios', include: [{ model: db.Usuario, as: 'Usuario', attributes: ['id', 'nombre', 'avatar_url'] }] },
      ],
    });
    if (!reporte) return res.status(404).json({ error: 'Reporte no encontrado' });
    res.json(reporte);
  } catch (err) {
    next(err);
  }
};

exports.actualizar = async (req, res, next) => {
  try {
    const reporte = await db.Reporte.findOne({ where: { id: req.params.id, usuario_id: req.userId } });
    if (!reporte) return res.status(404).json({ error: 'Reporte no encontrado' });
    const { titulo, descripcion, estado, tipo_plaga } = req.body;
    if (titulo !== undefined) reporte.titulo = titulo;
    if (descripcion !== undefined) reporte.descripcion = descripcion;
    if (estado !== undefined) reporte.estado = estado;
    if (tipo_plaga !== undefined) reporte.tipo_plaga = tipo_plaga;
    if (req.file) reporte.imagen_url = getImageUrl(req, req.file.filename);
    await reporte.save();
    res.json(reporte);
  } catch (err) {
    next(err);
  }
};

exports.eliminar = async (req, res, next) => {
  try {
    const reporte = await db.Reporte.findOne({ where: { id: req.params.id, usuario_id: req.userId } });
    if (!reporte) return res.status(404).json({ error: 'Reporte no encontrado' });
    await reporte.destroy();
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

exports.agregarComentario = async (req, res, next) => {
  try {
    const reporte = await db.Reporte.findByPk(req.params.id);
    if (!reporte) return res.status(404).json({ error: 'Reporte no encontrado' });
    const comentario = await db.Comentario.create({
      reporte_id: reporte.id,
      usuario_id: req.userId,
      contenido: req.body.contenido,
    });
    const conUsuario = await db.Comentario.findByPk(comentario.id, {
      include: [{ model: db.Usuario, as: 'Usuario', attributes: ['id', 'nombre', 'avatar_url'] }],
    });
    res.status(201).json(conUsuario);
  } catch (err) {
    next(err);
  }
};
