// src/middlewares/authMiddleware.js
const jwt = require('jsonwebtoken');

const verificarToken = (req, res, next) => {
    // Obtenemos el token del header de autorización
    const authHeader = req.header('Authorization');

    if (!authHeader) {
        return res.status(401).json({ error: 'Acceso denegado. No hay token de autenticación.' });
    }

    try {
        // El formato estándar que manda el front es "Bearer eyJhbGci..." así que lo separamos
        const token = authHeader.split(' ')[1];
        
        // Verificamos el token usando la misma llave secreta que en el login
        const verificado = jwt.verify(token, process.env.JWT_SECRET || 'secreto_de_desarrollo');
        
        // Inyectamos los datos del usuario (id y rol) en la request
        req.usuario = verificado;
        
        // Le damos luz verde para que siga al controlador correspondiente
        next();
    } catch (error) {
        res.status(401).json({ error: 'Token no válido o expirado.' });
    }
};

module.exports = { verificarToken };