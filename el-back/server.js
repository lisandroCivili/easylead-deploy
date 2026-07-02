// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

const bcrypt = require('bcryptjs');
const pool = require('./src/config/db');

// Middlewares globales
app.use(cors());
app.use(express.json()); // Fundamental para leer req.body


// Montamos las rutas de autenticación bajo el prefijo /api/auth
app.use('/api/auth', require('./src/routes/authRoutes'));

// Montamos las rutas de campañas protegidas
app.use('/api/campaigns', require('./src/routes/campaignRoutes'));

app.use('/api/generator', require('./src/routes/generatorRoutes')); 

app.use('/api/reports', require('./src/routes/reportRoutes')); 

// Ruta de prueba para ver si el server responde
app.get('/api/health', (req, res) => {
    res.json({ estado: 'Servidor corriendo de 10' });
});


const PORT = process.env.PORT || 5000;

// --- SEMILLA: Hardcodear usuario Admin si no existe ---
const inicializarAdmin = async () => {
    const emailAdmin = 'administrador@admin.com';
    const passwordAdmin = 'admin123';

    try {
        // Chequeamos si el admin ya está en la base de datos
        const { rows } = await pool.query('SELECT * FROM Usuario WHERE usu_email = $1', [emailAdmin]);

        if (rows.length === 0) {
            // Si no existe, encriptamos la clave y lo insertamos con rol 'A'
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(passwordAdmin, salt);

            await pool.query(
                `INSERT INTO Usuario (usu_nombre, usu_email, usu_password, usu_rol) 
                 VALUES ($1, $2, $3, $4)`,
                ['Administrador Jefe', emailAdmin, hashedPassword, 'A']
            );
            console.log('👑 Usuario Admin hardcodeado y listo para usar.');
        } else {
            // Si ya existe pero por algún error quedó como 'N', lo forzamos a 'A'
            if (rows[0].usu_rol !== 'A') {
                await pool.query('UPDATE Usuario SET usu_rol = $1 WHERE usu_email = $2', ['A', emailAdmin]);
                console.log('🔧 Permisos de Admin restaurados.');
            }
        }
    } catch (error) {
        console.error('Error al hardcodear el admin:', error);
    }
};

// Ejecutamos la función cuando arranca el server
inicializarAdmin();

app.listen(PORT, () => {
    console.log(`🚀 Servidor backend levantado en http://localhost:${PORT}`);
});