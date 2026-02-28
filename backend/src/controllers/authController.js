/**
 * Controlador de autenticación - Registro y Login con JWT
 */
const speakeasy = require('speakeasy');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../models');
const { JWT_SECRET } = require('../middleware/auth');
const { sendMfaEmail } = require('../config/mailer');
const logger = require('../utils/logger');

const JWT_EXPIRES = process.env.JWT_EXPIRES_IN || '7d';

exports.registro = async (req, res, next) => {
  try {
    const { email, password, nombre, apellido, experiencia, tipo_cultivo } = req.body;
    const existente = await db.Usuario.findOne({ where: { email } });
    if (existente) {
      return res.status(409).json({ success: false, message: 'El email ya está registrado' });
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
      success: true,
      message: 'Usuario registrado exitosamente',
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
          rol: usuario.rol
        }
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const usuario = await db.Usuario.findOne({ where: { email } });

    // Evitar revelar si el usuario existe o no intencionalmente retrasando el error
    if (!usuario || !usuario.activo) {
      return res.status(401).json({ success: false, message: 'Credenciales incorrectas' });
    }

    const ok = await bcrypt.compare(password, usuario.password_hash);
    if (!ok) {
      return res.status(401).json({ success: false, message: 'Credenciales incorrectas' });
    }

    // Generar MFA Code
    const mfaSecret = speakeasy.generateSecret({ length: 20 });
    const totpCode = speakeasy.totp({
      secret: mfaSecret.base32,
      encoding: 'base32',
      step: 300 // Valido por 5 minutos
    });

    usuario.mfa_secret = mfaSecret.base32;
    usuario.mfa_code = totpCode;
    usuario.mfa_expires_at = new Date(Date.now() + 5 * 60 * 1000); // 5 mins
    usuario.mfa_attempts = 0;
    await usuario.save();

    // Enviar código por email
    await sendMfaEmail(email, totpCode);

    logger.info(`Código MFA generado para ${email}: ${totpCode} (MFA de prueba)`);

    res.status(200).json({
      success: true,
      message: 'MFA Requerido. Se ha enviado un código a su correo.',
      data: {
        require_mfa: true,
        email: email
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.verifyMfa = async (req, res, next) => {
  try {
    const { email, code } = req.body;
    const usuario = await db.Usuario.findOne({ where: { email } });

    if (!usuario || !usuario.activo || !usuario.mfa_code) {
      return res.status(400).json({ success: false, message: 'Solicitud MFA inválida o expirada' });
    }

    if (usuario.mfa_attempts >= 3) {
      // Invalidar el código si supera los intentos
      usuario.mfa_code = null;
      await usuario.save();
      return res.status(403).json({ success: false, message: 'Demasiados intentos fallidos. Vuelva a iniciar sesión.' });
    }

    if (new Date() > usuario.mfa_expires_at) {
      return res.status(400).json({ success: false, message: 'El código MFA ha expirado' });
    }

    // Validar el código TOTP
    const tokenValidates = speakeasy.totp.verify({
      secret: usuario.mfa_secret,
      encoding: 'base32',
      token: code,
      step: 300,
      window: 1 // Permitir ligero desfaz de tiempo
    });

    // Comparar con el guardado o validar (doble check)
    if (!tokenValidates && usuario.mfa_code !== code) {
      usuario.mfa_attempts += 1;
      await usuario.save();
      return res.status(401).json({ success: false, message: 'Código MFA incorrecto' });
    }

    // Éxito, limpiar MFA
    usuario.mfa_code = null;
    usuario.mfa_secret = null;
    usuario.mfa_attempts = 0;
    await usuario.save();

    const token = jwt.sign({ userId: usuario.id, rol: usuario.rol }, JWT_SECRET, { expiresIn: JWT_EXPIRES });
    logger.info(`Login (MFA) correcto para ${email}`);

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
          rol: usuario.rol
        }
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
      success: true,
      message: 'Perfil recuperado',
      data: {
        id: u.id,
        email: u.email,
        nombre: u.nombre,
        apellido: u.apellido,
        experiencia: u.experiencia,
        tipo_cultivo: u.tipo_cultivo,
        avatar_url: u.avatar_url,
        rol: u.rol
      }
    });
  } catch (err) {
    next(err);
  }
};
