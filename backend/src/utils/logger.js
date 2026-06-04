const winston = require('winston');
const path = require('path');
const fs = require('fs');

// Ensure logs directory exists
const logDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
}

// Custom format for structured JSON
const customFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DDTHH:mm:ss.SSSZ' }),
    winston.format.errors({ stack: true }),
    winston.format.json()
);

const logger = winston.createLogger({
    level: 'info',
    format: customFormat,
    defaultMeta: { service: 'plagacontrol-api' },
    transports: [
        // - Write all logs with level `error` and below to `errores.log`
        new winston.transports.File({ filename: path.join(logDir, 'errores.log'), level: 'error' }),
        // - Write all logs with level `info` and below to `auditoria.log`
        new winston.transports.File({ filename: path.join(logDir, 'auditoria.log') }),
    ],
    // Do not exit on handled exceptions
    exitOnError: false,
});

// If we're not in production then log to the `console` with simple format
if (process.env.NODE_ENV !== 'production') {
    logger.add(
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.simple()
            ),
        })
    );
}

module.exports = logger;
