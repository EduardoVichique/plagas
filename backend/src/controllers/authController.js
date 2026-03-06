/**
 * Controlador de autenticación - Registro y Login con JWT, además de MFA
 */
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const speakeasy = require('speakeasy');
const qrcode = require('qrcode');
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
      rol: email === 'admin@plagacontrol.com' ? 'admin' : 'user',
    });
    const token = jwt.sign({ userId: usuario.id }, JWT_SECRET, { expiresIn: JWT_EXPIRES });
    res.status(201).json({
      success: true,
      message: 'Usuario registrado',
      data: {
        token,
        user: {
          id: usuario.id,
          email: usuario.email,
          nombre: usuario.nombre,
          apellido: usuario.apellido,
          experiencia: usuario.experiencia,
          tipo_cultivo: usuario.tipo_cultivo,
          avatar_url: usuario.avatar_url,
          mfa_enabled: usuario.mfa_enabled,
          rol: usuario.rol,
        },
      }
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

    if (usuario.mfa_enabled) {
      const tempToken = jwt.sign({ userId: usuario.id, isTemp: true }, JWT_SECRET, { expiresIn: '5m' });
      return res.json({
        success: true,
        message: 'MFA Requerido',
        data: { mfaRequired: true, tempToken }
      });
    }

    const token = jwt.sign({ userId: usuario.id }, JWT_SECRET, { expiresIn: JWT_EXPIRES });
    res.json({
      success: true,
      message: 'Login correcto',
      data: {
        token,
        user: {
          id: usuario.id,
          email: usuario.email,
          nombre: usuario.nombre,
          apellido: usuario.apellido,
          experiencia: usuario.experiencia,
          tipo_cultivo: usuario.tipo_cultivo,
          avatar_url: usuario.avatar_url,
          mfa_enabled: usuario.mfa_enabled,
          rol: usuario.rol,
        }
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.me = async (req, res, next) => {
  try {
    const u = req.user;
    res.json({
      success: true,
      message: 'Detalle de usuario',
      data: {
        id: u.id,
        email: u.email,
        nombre: u.nombre,
        apellido: u.apellido,
        experiencia: u.experiencia,
        tipo_cultivo: u.tipo_cultivo,
        avatar_url: u.avatar_url,
        mfa_enabled: u.mfa_enabled,
        rol: u.rol,
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.generateMfa = async (req, res, next) => {
  try {
    const usuario = req.user;
    const secret = speakeasy.generateSecret({ name: `PlagaControl (${usuario.email})` });

    usuario.mfa_secret = secret.base32;
    await usuario.save();

    qrcode.toDataURL(secret.otpauth_url, (err, data_url) => {
      if (err) return next(err);
      res.json({
        success: true,
        message: 'MFA se ha generado. Escanea el código QR.',
        data: {
          qrCodeImage: data_url,
          secret: secret.base32
        }
      });
    });
  } catch (err) {
    next(err);
  }
};

exports.verifyMfa = async (req, res, next) => {
  try {
    const { token } = req.body;
    const usuario = req.user;

    const verified = speakeasy.totp.verify({
      secret: usuario.mfa_secret,
      encoding: 'base32',
      token
    });

    if (verified) {
      usuario.mfa_enabled = true;
      await usuario.save();
      res.json({
        success: true,
        message: 'MFA habilitado exitosamente',
        data: { mfa_enabled: true }
      });
    } else {
      res.status(400).json({ error: 'Código inválido' });
    }
  } catch (err) {
    next(err);
  }
};

exports.loginMfa = async (req, res, next) => {
  try {
    const { tempToken, token } = req.body;
    if (!tempToken || !token) {
      return res.status(400).json({ error: 'Tokens requeridos' });
    }

    let decoded;
    try {
      decoded = jwt.verify(tempToken, JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ error: 'Token temporal no válido o caducado' });
    }

    if (!decoded.isTemp) {
      return res.status(401).json({ error: 'Token temporal no válido' });
    }

    const usuario = await db.Usuario.findByPk(decoded.userId);
    if (!usuario) {
      return res.status(401).json({ error: 'Usuario no encontrado' });
    }

    const verified = speakeasy.totp.verify({
      secret: usuario.mfa_secret,
      encoding: 'base32',
      token
    });

    if (!verified) {
      return res.status(401).json({ error: 'Código MFA incorrecto' });
    }

    const finalToken = jwt.sign({ userId: usuario.id }, JWT_SECRET, { expiresIn: JWT_EXPIRES });

    res.json({
      success: true,
      message: 'Login MFA exitoso',
      data: {
        token: finalToken,
        user: {
          id: usuario.id,
          email: usuario.email,
          nombre: usuario.nombre,
          apellido: usuario.apellido,
          experiencia: usuario.experiencia,
          tipo_cultivo: usuario.tipo_cultivo,
          avatar_url: usuario.avatar_url,
          mfa_enabled: usuario.mfa_enabled,
          rol: usuario.rol,
        }
      }
    });
  } catch (err) {
    next(err);
  }
};
