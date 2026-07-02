// src/routes/generatorRoutes.js
const express = require('express');
const router = express.Router();
const { verificarToken } = require('../middlewares/authMiddleware');
const { generarCampana } = require('../controllers/generatorController');

router.use(verificarToken);
router.post('/generar', generarCampana);

module.exports = router;