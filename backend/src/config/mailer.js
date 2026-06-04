const nodemailer = require('nodemailer');
const logger = require('../utils/logger');

// Configuración SMTP usando variables de entorno o un config default para pruebas
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.ethereal.email', // Cuidado: No usar etheral en prod, setear env vars
    port: process.env.SMTP_PORT || 587,
    secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER || 'plagacontrol@test.com',
        pass: process.env.SMTP_PASS || 'T3stP4ssw0rd!',
    },
});

const sendMfaEmail = async (to, code) => {
    try {
        const info = await transporter.sendMail({
            from: `"PlagaControl Seguridad" <${process.env.SMTP_USER || 'no-reply@plagacontrol.com'}>`, // sender address
            to, // list of receivers
            subject: "🛡️ Tu Código de Verificación MFA", // Subject line
            text: `Tu código de verificación es: ${code}. Es válido por 5 minutos.`, // plain text body
            html: `<b>Tu código de verificación es:</b> <h2>${code}</h2><p>Es válido por 5 minutos.</p>`, // html body
        });
        logger.info(`Email de MFA enviado a ${to}`, { messageId: info.messageId });
        return true;
    } catch (error) {
        logger.error(`Error enviando email de MFA a ${to}: ${error.message}`);
        return false;
    }
};

module.exports = {
    transporter,
    sendMfaEmail
};
