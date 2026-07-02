// src/routes/reportRoutes.js
const express = require('express');
const router = express.Router();
const { verificarToken } = require('../middlewares/authMiddleware');
const { verificarAdmin } = require('../middlewares/roleMiddleware');
const { exportarCampanaJSON, obtenerMetricasGlobales } = require('../controllers/reportController');

// Protegemos todas las rutas con el token base
router.use(verificarToken);

// Endpoint para el emprendedor (descarga la campaña por ID)
router.get('/exportar/:id', exportarCampanaJSON);

// Endpoint exclusivo para el administrador (aplica el doble middleware)
router.get('/metricas', verificarAdmin, obtenerMetricasGlobales);

module.exports = router;