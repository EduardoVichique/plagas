/**
 * Controlador de autenticación - Registro y Login con JWT
 */
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const db = require('../models');
const { JWT_SECRET } = require('../middleware/auth');

const JWT_EXPIRES = process.env.JWT_EXPIRES_IN || '7d';

exports.registro = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Datos inválidos', details: errors.array() });
    }
    const { email, password, nombre, apellido, experiencia, tipo_cultivo } = req.body;
    const existente = await db.Usuario.findOne({ where: { email } });
    if (existente) {
      return res.status(409).json({ error: 'El email ya está registrado' });
    }
    const password_hash = await bcrypt.hash(password, 10);
    const usuario = await db.Usuario.create({
      email,
      password_hash,
      nombre,
      apellido: apellido || null,
      experiencia: experiencia || 'Principiante',
      tipo_cultivo: tipo_cultivo || null,
    });
    const token = jwt.sign({ userId: usuario.id }, JWT_SECRET, { expiresIn: JWT_EXPIRES });
    res.status(201).json({
      message: 'Usuario registrado',
      token,
      user: {
        id: usuario.id,
        email: usuario.email,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        experiencia: usuario.experiencia,
        tipo_cultivo: usuario.tipo_cultivo,
        avatar_url: usuario.avatar_url,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Datos inválidos', details: errors.array() });
    }
    const { email, password } = req.body;
    const usuario = await db.Usuario.findOne({ where: { email } });
    if (!usuario || !usuario.activo) {
      return res.status(401).json({ error: 'Credenciales incorrectas' });
    }
    const ok = await bcrypt.compare(password, usuario.password_hash);
    if (!ok) {
      return res.status(401).json({ error: 'Credenciales incorrectas' });
    }
    const token = jwt.sign({ userId: usuario.id }, JWT_SECRET, { expiresIn: JWT_EXPIRES });
    res.json({
      message: 'Login correcto',
      token,
      user: {
        id: usuario.id,
        email: usuario.email,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        experiencia: usuario.experiencia,
        tipo_cultivo: usuario.tipo_cultivo,
        avatar_url: usuario.avatar_url,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.me = async (req, res, next) => {
  try {
    const u = req.user;
    res.json({
      id: u.id,
      email: u.email,
      nombre: u.nombre,
      apellido: u.apellido,
      experiencia: u.experiencia,
      tipo_cultivo: u.tipo_cultivo,
      avatar_url: u.avatar_url,
    });
  } catch (err) {
    next(err);
  }
};
