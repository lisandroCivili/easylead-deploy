const express = require('express');
const router = express.Router();
const { verificarToken } = require('../middlewares/authMiddleware');
const { crearCampana, obtenerMisCampanas, actualizarCampana, eliminarCampana } = require('../controllers/campaignController');

router.use(verificarToken);

router.post('/', crearCampana);
router.get('/', obtenerMisCampanas);
// Agregamos las dos rutas nuevas recibiendo el ID por parámetro:
router.put('/:id', actualizarCampana);
router.delete('/:id', eliminarCampana);

module.exports = router;