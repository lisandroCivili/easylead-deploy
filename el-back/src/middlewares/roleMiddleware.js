// src/middlewares/roleMiddleware.js

const verificarAdmin = (req, res, next) => {
    // Verificamos el rol que inyectó el authMiddleware en req.usuario
    if (req.usuario.rol !== 'A') {
        return res.status(403).json({ 
            error: 'Acceso denegado. Se requieren permisos de Administrador.' 
        });
    }
    
    // Si es admin, lo dejamos pasar al controlador
    next();
};

module.exports = { verificarAdmin };