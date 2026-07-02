// src/controllers/campaignController.js
const pool = require('../config/db');

// --- Crear o guardar una campaña ---
const crearCampana = async (req, res) => {
    // Agregamos "metadata" a lo que recibimos del body
    const { nombre, objetivo, presupuesto, estado, metadata } = req.body;
    const usuarioId = req.usuario.id; 

    try {
        const result = await pool.query(
            `INSERT INTO Campaña (camp_nombre, camp_objetivo, camp_presupuesto, camp_estado, camp_usu_id_fk, camp_metadata) 
             VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
            [nombre, objetivo, presupuesto, estado, usuarioId, metadata] // metadata va al final
        );

        res.status(201).json({
            mensaje: 'Campaña creada exitosamente',
            campana: result.rows[0]
        });
    } catch (error) {
        console.error('Error al crear campaña:', error);
        res.status(500).json({ error: 'Error interno del servidor al crear la campaña' });
    }
};

// --- Obtener las campañas del usuario logueado ---
const obtenerMisCampanas = async (req, res) => {
    const usuarioId = req.usuario.id;

    try {
        // Traemos solo las campañas que le pertenecen al usuario del token
        const campanas = await pool.query(
            'SELECT * FROM Campaña WHERE camp_usu_id_fk = $1 ORDER BY camp_id DESC',
            [usuarioId]
        );

        res.json(campanas.rows);
    } catch (error) {
        console.error('Error al obtener campañas:', error);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
};

// --- Editar/Actualizar una campaña ---
const actualizarCampana = async (req, res) => {
    const { id } = req.params;
    const { nombre, objetivo, presupuesto, estado } = req.body;
    const usuarioId = req.usuario.id; // Validamos que sea el dueño

    try {
        // Usamos COALESCE para que si un campo no se envía, mantenga el valor que ya tenía
        const result = await pool.query(
            `UPDATE Campaña 
             SET camp_nombre = COALESCE($1, camp_nombre), 
                 camp_objetivo = COALESCE($2, camp_objetivo), 
                 camp_presupuesto = COALESCE($3, camp_presupuesto), 
                 camp_estado = COALESCE($4, camp_estado)
             WHERE camp_id = $5 AND camp_usu_id_fk = $6 
             RETURNING *`,
            [nombre, objetivo, presupuesto, estado, id, usuarioId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Campaña no encontrada o no autorizada.' });
        }

        res.json({
            mensaje: 'Campaña actualizada con éxito.',
            campana: result.rows[0]
        });
    } catch (error) {
        console.error('Error al actualizar:', error);
        res.status(500).json({ error: 'Error interno al actualizar la campaña.' });
    }
};

// --- Eliminar una campaña ---
const eliminarCampana = async (req, res) => {
    const { id } = req.params;
    const usuarioId = req.usuario.id;

    try {
        const result = await pool.query(
            'DELETE FROM Campaña WHERE camp_id = $1 AND camp_usu_id_fk = $2 RETURNING *',
            [id, usuarioId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Campaña no encontrada o no autorizada.' });
        }

        res.json({ mensaje: 'Campaña eliminada correctamente.' });
    } catch (error) {
        console.error('Error al eliminar:', error);
        res.status(500).json({ error: 'Error interno al eliminar la campaña.' });
    }
};

// No te olvides de exportarlas:
module.exports = { crearCampana, obtenerMisCampanas, actualizarCampana, eliminarCampana };