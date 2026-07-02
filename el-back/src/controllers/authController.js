// src/controllers/authController.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

// --- HU 1.1: Registro de nuevo usuario ---
const registrarUsuario = async (req, res) => {
    const { nombre, email, password } = req.body;

    if (!nombre || !email || !password) {
        return res.status(400).json({ error: 'Nombre, email y contraseña son obligatorios.' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ error: 'El formato del correo electrónico no es válido.' });
    }

    if (password.length < 8) {
        return res.status(400).json({ error: 'La contraseña debe tener al menos 8 caracteres.' });
    }

    try {
        const usuarioExistente = await pool.query(
            'SELECT usu_email FROM Usuario WHERE usu_email = $1',
            [email]
        );

        if (usuarioExistente.rows.length > 0) {
            return res.status(409).json({ error: 'Este correo ya se encuentra registrado.' });
        }

        const salt = await bcrypt.genSalt(10);
        const passwordEncriptada = await bcrypt.hash(password, salt);
        const rolPorDefecto = 'N';

        const nuevoUsuario = await pool.query(
            `INSERT INTO Usuario (usu_nombre, usu_email, usu_password, usu_rol) 
             VALUES ($1, $2, $3, $4) RETURNING usu_id, usu_nombre, usu_email, usu_rol`,
            [nombre, email, passwordEncriptada, rolPorDefecto]
        );

        res.status(201).json({
            mensaje: 'Usuario registrado con éxito.',
            usuario: nuevoUsuario.rows[0]
        });

    } catch (error) {
        console.error('Error en el registro:', error);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
};

// --- HU 1.2: Inicio de sesión ---
const loginUsuario = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Por favor, ingresá email y contraseña.' });
    }

    try {
        // 1. Buscamos al usuario en la BD
        const resultado = await pool.query('SELECT * FROM Usuario WHERE usu_email = $1', [email]);
        
        // 2. Si no existe, tiramos error genérico
        if (resultado.rows.length === 0) {
            return res.status(401).json({ error: 'Credenciales inválidas.' }); 
        }

        const usuario = resultado.rows[0];

        // 3. Comparamos la contraseña enviada con la encriptada
        const passwordValida = await bcrypt.compare(password, usuario.usu_password);
        if (!passwordValida) {
            return res.status(401).json({ error: 'Credenciales inválidas.' });
        }

        // 4. Generamos el token JWT (asegurate de tener JWT_SECRET en tu .env)
        const token = jwt.sign(
            { id: usuario.usu_id, rol: usuario.usu_rol }, 
            process.env.JWT_SECRET || 'secreto_de_desarrollo', 
            { expiresIn: '8h' }
        );

        // 5. Devolvemos la data al frontend
        res.json({
            mensaje: 'Inicio de sesión exitoso.',
            token,
            usuario: {
                id: usuario.usu_id,
                nombre: usuario.usu_nombre,
                rol: usuario.usu_rol
            }
        });

    } catch (error) {
        console.error('Error en el login:', error);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
};

module.exports = {
    registrarUsuario,
    loginUsuario
};