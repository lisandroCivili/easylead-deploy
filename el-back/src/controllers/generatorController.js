// src/controllers/generatorController.js

const generarCampana = (req, res) => {
    const {
        negocio,
        producto,
        objetivo,
        edad,
        ubicacion,
        intereses,
        presupuestoDiario,
        dias
    } = req.body;

    // --- HU 2.1 y 2.3: Validaciones básicas ---
    if (!negocio || !producto || !objetivo || !presupuestoDiario || !dias) {
        return res.status(400).json({ error: 'Faltan parámetros obligatorios para generar la campaña.' });
    }

    if (presupuestoDiario <= 0) {
        return res.status(400).json({ error: 'El presupuesto diario debe ser mayor a 0.' });
    }

    // --- HU 2.2: Recomendación de segmentación (Proceso 3.2) ---
    // En un MVP simulamos la IA agregando intereses complementarios genéricos.
    const interesesIngresados = intereses || [];
    const audienciaSugerida = [
        ...interesesIngresados, 
        'Compradores online', 
        `Interesados en ${producto}`
    ];

    // --- HU 2.3: Cálculo de presupuesto y alcance (Proceso 3.3) ---
    const presupuestoTotal = presupuestoDiario * dias;
    // Constante estática de conversión (ej: 10 personas por cada $1 invertido)
    const CONSTANTE_CONVERSION = 10; 
    const alcanceEstimado = presupuestoTotal * CONSTANTE_CONVERSION;

    // --- HU 2.4: Generación de copies y CTA (Procesos 3.4.1 a 3.4.5) ---
    const mapeoCTA = {
        'Más ventas': 'Comprar ahora',
        'Más mensajes': 'Enviar mensaje',
        'Reconocimiento': 'Ver más'
    };
    const cta = mapeoCTA[objetivo] || 'Más información';

    const anuncios = [
        {
            titulo: `¡Descubrí el mejor ${producto} en ${negocio}!`,
            descripcion: `¿Buscás calidad? En ${negocio} tenemos el ${producto} ideal para vos. ¡Aprovechá nuestra atención hoy y no te quedes sin el tuyo!`
        },
        {
            titulo: `Tu nuevo ${producto} te está esperando`,
            descripcion: `No des más vueltas. Llevate tu ${producto} con la confianza que solo ${negocio} te puede dar. Hacé clic en "${cta}" y charlamos.`
        },
        {
            titulo: `Promo especial de ${producto}`,
            descripcion: `Mejorá tu día con nuestro ${producto}. En ${negocio} estamos listos para asesorarte rápido y fácil.`
        }
    ];

    // --- Proceso 3.5: Consolidar Estructura ---
    const campañaConsolidada = {
        estructura: {
            negocio,
            producto,
            objetivo,
            cta_recomendado: cta
        },
        segmentacion: {
            edad,
            ubicacion,
            intereses_sugeridos: audienciaSugerida
        },
        presupuesto: {
            diario: presupuestoDiario,
            dias: dias,
            inversion_total: presupuestoTotal,
            alcance_estimado: alcanceEstimado
        },
        textos_publicitarios: anuncios
    };

    // Devolvemos el JSON armado al frontend para la Vista Previa (HU 3.1)
    res.json({
        mensaje: 'Campaña estructurada con éxito.',
        data: campañaConsolidada
    });
};

module.exports = { generarCampana };