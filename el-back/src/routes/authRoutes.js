// src/routes/authRoutes.js
const express = require('express');
const router = express.Router();

// Importamos los controladores
const { registrarUsuario, loginUsuario } = require('../controllers/authController');

// Definimos los endpoints
router.post('/registro', registrarUsuario);
router.post('/login', loginUsuario);

module.exports = router;