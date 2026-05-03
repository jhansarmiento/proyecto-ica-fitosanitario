import fs from 'fs';
import path from 'path';
import models from '../index'; // DB Operacional
import catalogModels from '../catalogIndex'; // DB Catálogos

export const seedPropietariosYPredios = async () => {
    try {
        // 1. Cargar Propietarios
        const propData = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/propietarios.json'), 'utf-8'));
        console.log('⏳ Inyectando propietarios...');
        for (const p of propData) {
            await models.Propietario.findOrCreate({
                where: { numeroIdentificacion: p.numeroIdentificacion },
                defaults: p
            });
        }

        // 2. Necesitamos datos de apoyo para los Predios
        const propietarios = await models.Propietario.findAll();
        const lugares = await models.LugarProduccion.findAll();
        const veredas = await catalogModels.Vereda.findAll();

        if (lugares.length === 0) {
            console.warn('⚠️ No hay Lugares de Producción. Debes crear al menos uno para asociar los predios.');
            return;
        }

        // 3. Cargar Predios
        const predioData = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/predios.json'), 'utf-8'));
        console.log(`⏳ Inyectando ${predioData.length} predios...`);

        for (let i = 0; i < predioData.length; i++) {
            const data = predioData[i];
            
            // Asignamos aleatoriamente un Propietario y una Vereda
            const propietarioAleatorio = propietarios[i % propietarios.length];
            const veredaAleatoria = veredas[i % veredas.length];

            await models.Predio.findOrCreate({
                where: { numeroPredial: data.numeroPredial },
                defaults: {
                    numeroPredial: data.numeroPredial,
                    numeroRegistroICA: data.numeroRegistroICA,
                    nombrePredio: data.nombrePredio,
                    direccion: data.direccion,
                    areaTotal: data.areaTotal,
                    idVereda: veredaAleatoria.id, // Puente lógico
                    idPropietario: propietarioAleatorio.id,
                    idLugarProduccion: null // Se puede asignar un Lugar de Producción específico si se desea
                }
            });
        }

        console.log('✅ Propietarios y Predios inyectados con éxito.');
    } catch (error) {
        console.error('❌ Error en el seeder de predios:', error);
    }
};