// src/controllers/reportController.js
const pool = require('../config/db');

// --- HU 3.2: Exportación de la campaña ---
const exportarCampanaJSON = async (req, res) => {
    const campanaId = req.params.id;
    const usuarioId = req.usuario.id;

    try {
        // Buscamos la campaña asegurándonos de que sea del usuario logueado
        const resultado = await pool.query(
            'SELECT * FROM Campaña WHERE camp_id = $1 AND camp_usu_id_fk = $2',
            [campanaId, usuarioId]
        );

        if (resultado.rows.length === 0) {
            return res.status(404).json({ error: 'Campaña no encontrada o no autorizada.' });
        }

        const campana = resultado.rows[0];

        // Configuramos los headers para forzar la descarga de un archivo .json en el navegador del usuario
        res.setHeader('Content-disposition', `attachment; filename=campana_${campana.camp_id}.json`);
        res.setHeader('Content-type', 'application/json');

        // Enviamos los datos formateados
        res.send(JSON.stringify(campana, null, 2));

    } catch (error) {
        console.error('Error al exportar campaña:', error);
        res.status(500).json({ error: 'Error interno al generar el archivo.' });
    }
};

// --- HU 4.1: Visualización de métricas globales ---
const obtenerMetricasGlobales = async (req, res) => {
    try {
        // Extraemos totales numéricos de los almacenes D1 y D2 [cite: 84]
        const totalUsuarios = await pool.query('SELECT COUNT(*) AS total FROM Usuario');
        const totalCampanas = await pool.query('SELECT COUNT(*) AS total FROM Campaña');

        res.json({
            mensaje: 'Métricas obtenidas con éxito.',
            data: {
                usuarios_registrados: parseInt(totalUsuarios.rows[0].total),
                campanas_creadas: parseInt(totalCampanas.rows[0].total)
            }
        });
    } catch (error) {
        console.error('Error al obtener métricas:', error);
        res.status(500).json({ error: 'Error al consultar las estadísticas.' });
    }
};

module.exports = {
    exportarCampanaJSON,
    obtenerMetricasGlobales
};