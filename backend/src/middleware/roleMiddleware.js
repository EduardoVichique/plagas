/**
 * Middleware para Control de Acceso Basado en Roles (RBAC)
 */
const requireRole = (roles = []) => {
    return (req, res, next) => {
        if (!req.user || !req.user.rol) {
            return res.status(401).json({ error: 'No autorizado' });
        }

        if (!roles.includes(req.user.rol)) {
            return res.status(403).json({ error: 'Acceso denegado. Permisos insuficientes.' });
        }

        next();
    };
};

module.exports = { requireRole };
