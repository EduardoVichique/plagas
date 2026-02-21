/**
 * Controlador de guías de plagas - CRUD e información técnica
 */
const db = require('../models');

exports.listar = async (req, res, next) => {
  try {
    const { tipo_plaga, activo = true, limit = 50, offset = 0 } = req.query;
    const where = {};
    if (tipo_plaga) where.tipo_plaga = tipo_plaga;
    if (activo !== undefined) where.activo = activo === 'true' || activo === true;
    const { count, rows } = await db.Guia.findAndCountAll({
      where,
      order: [['titulo', 'ASC']],
      limit: Math.min(parseInt(limit, 10) || 50, 100),
      offset: parseInt(offset, 10) || 0,
    });
    res.json({ total: count, guias: rows });
  } catch (err) {
    next(err);
  }
};

exports.obtener = async (req, res, next) => {
  try {
    const guia = await db.Guia.findByPk(req.params.id);
    if (!guia) return res.status(404).json({ error: 'Guía no encontrada' });
    res.json(guia);
  } catch (err) {
    next(err);
  }
};

exports.crear = async (req, res, next) => {
  try {
    const { titulo, descripcion, tipo_plaga, informacion_tecnica, imagen_url } = req.body;
    const guia = await db.Guia.create({
      titulo,
      descripcion: descripcion || null,
      tipo_plaga: tipo_plaga || null,
      informacion_tecnica: informacion_tecnica || null,
      imagen_url: imagen_url || null,
    });
    res.status(201).json(guia);
  } catch (err) {
    next(err);
  }
};

exports.actualizar = async (req, res, next) => {
  try {
    const guia = await db.Guia.findByPk(req.params.id);
    if (!guia) return res.status(404).json({ error: 'Guía no encontrada' });
    const { titulo, descripcion, tipo_plaga, informacion_tecnica, imagen_url, activo } = req.body;
    if (titulo !== undefined) guia.titulo = titulo;
    if (descripcion !== undefined) guia.descripcion = descripcion;
    if (tipo_plaga !== undefined) guia.tipo_plaga = tipo_plaga;
    if (informacion_tecnica !== undefined) guia.informacion_tecnica = informacion_tecnica;
    if (imagen_url !== undefined) guia.imagen_url = imagen_url;
    if (activo !== undefined) guia.activo = activo;
    await guia.save();
    res.json(guia);
  } catch (err) {
    next(err);
  }
};

exports.eliminar = async (req, res, next) => {
  try {
    const guia = await db.Guia.findByPk(req.params.id);
    if (!guia) return res.status(404).json({ error: 'Guía no encontrada' });
    await guia.destroy();
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};
