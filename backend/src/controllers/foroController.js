/**
 * Controlador del foro - Temas y respuestas con contador de ayudas
 */
const db = require('../models');

exports.listarTemas = async (req, res, next) => {
  try {
    const { categoria, limit = 30, offset = 0 } = req.query;
    const where = {};
    if (categoria) where.categoria = categoria;
    const { count, rows } = await db.Foro.findAndCountAll({
      where,
      include: [{ model: db.Usuario, as: 'Usuario', attributes: ['id', 'nombre', 'apellido', 'avatar_url'] }],
      order: [['created_at', 'DESC']],
      limit: Math.min(parseInt(limit, 10) || 30, 100),
      offset: parseInt(offset, 10) || 0,
    });
    const temasConRespuestas = await Promise.all(
      rows.map(async (t) => {
        const numRespuestas = await db.Respuesta.count({ where: { foro_id: t.id } });
        return { ...t.toJSON(), num_respuestas: numRespuestas };
      })
    );
    res.json({ total: count, temas: temasConRespuestas });
  } catch (err) {
    next(err);
  }
};

exports.crearTema = async (req, res, next) => {
  try {
    const { titulo, contenido, categoria } = req.body;
    const tema = await db.Foro.create({
      usuario_id: req.userId,
      titulo,
      contenido,
      categoria: categoria || null,
    });
    const conUsuario = await db.Foro.findByPk(tema.id, {
      include: [{ model: db.Usuario, as: 'Usuario', attributes: ['id', 'nombre', 'apellido', 'avatar_url'] }],
    });
    res.status(201).json(conUsuario);
  } catch (err) {
    next(err);
  }
};

exports.obtenerTema = async (req, res, next) => {
  try {
    const tema = await db.Foro.findByPk(req.params.id, {
      include: [{ model: db.Usuario, as: 'Usuario', attributes: ['id', 'nombre', 'apellido', 'avatar_url'] }],
    });
    if (!tema) return res.status(404).json({ error: 'Tema no encontrado' });
    const respuestas = await db.Respuesta.findAll({
      where: { foro_id: tema.id },
      include: [{ model: db.Usuario, as: 'Usuario', attributes: ['id', 'nombre', 'avatar_url'] }],
      order: [['created_at', 'ASC']],
    });
    res.json({ tema, respuestas });
  } catch (err) {
    next(err);
  }
};

exports.actualizarTema = async (req, res, next) => {
  try {
    const tema = await db.Foro.findOne({ where: { id: req.params.id, usuario_id: req.userId } });
    if (!tema) return res.status(404).json({ error: 'Tema no encontrado' });
    const { titulo, contenido, categoria } = req.body;
    if (titulo !== undefined) tema.titulo = titulo;
    if (contenido !== undefined) tema.contenido = contenido;
    if (categoria !== undefined) tema.categoria = categoria;
    await tema.save();
    res.json(tema);
  } catch (err) {
    next(err);
  }
};

exports.eliminarTema = async (req, res, next) => {
  try {
    const tema = await db.Foro.findOne({ where: { id: req.params.id, usuario_id: req.userId } });
    if (!tema) return res.status(404).json({ error: 'Tema no encontrado' });
    await tema.destroy();
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

exports.agregarAyudaTema = async (req, res, next) => {
  try {
    const tema = await db.Foro.findByPk(req.params.id);
    if (!tema) return res.status(404).json({ error: 'Tema no encontrado' });
    tema.ayudas_count = (tema.ayudas_count || 0) + 1;
    await tema.save();
    res.json({ ayudas_count: tema.ayudas_count });
  } catch (err) {
    next(err);
  }
};

exports.crearRespuesta = async (req, res, next) => {
  try {
    const tema = await db.Foro.findByPk(req.params.id);
    if (!tema) return res.status(404).json({ error: 'Tema no encontrado' });
    const respuesta = await db.Respuesta.create({
      foro_id: tema.id,
      usuario_id: req.userId,
      contenido: req.body.contenido,
    });
    const conUsuario = await db.Respuesta.findByPk(respuesta.id, {
      include: [{ model: db.Usuario, as: 'Usuario', attributes: ['id', 'nombre', 'avatar_url'] }],
    });
    res.status(201).json(conUsuario);
  } catch (err) {
    next(err);
  }
};

exports.agregarAyudaRespuesta = async (req, res, next) => {
  try {
    const respuesta = await db.Respuesta.findByPk(req.params.id);
    if (!respuesta) return res.status(404).json({ error: 'Respuesta no encontrada' });
    respuesta.ayudas_count = (respuesta.ayudas_count || 0) + 1;
    await respuesta.save();
    res.json({ ayudas_count: respuesta.ayudas_count });
  } catch (err) {
    next(err);
  }
};
