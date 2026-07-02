// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

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

app.listen(PORT, () => {
    console.log(`🚀 Servidor backend levantado en http://localhost:${PORT}`);
});