import fs from 'fs';
import path from 'path';
import models from '../index'; // DB Operacional
import catalogModels from '../catalogIndex'; // DB Catálogos

export const seedPropietariosYPredios = async () => {
    try {
        // 1. Cargar datos de los archivos JSON
        const propData = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/propietarios.json'), 'utf-8'));
        const predioData = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/predios.json'), 'utf-8'));

        // 2. Inyectar Propietarios
        console.log('⏳ Inyectando propietarios...');
        for (const p of propData) {
            await models.Propietario.findOrCreate({
                where: { numeroIdentificacion: p.numeroIdentificacion },
                defaults: p
            });
        }

        // 3. Recuperar Propietarios y Veredas para asociar
        const propietarios = await models.Propietario.findAll();
        const veredas = await catalogModels.Vereda.findAll();

        if (veredas.length === 0) {
            console.error('❌ Error: No hay veredas en el catálogo. Primero corre el seeder geográfico.');
            return;
        }

        // 4. Inyectar Predios (Sin obligar a que existan Lugares de Producción)
        console.log(`⏳ Inyectando ${predioData.length} predios independientes...`);

        for (let i = 0; i < predioData.length; i++) {
            const data = predioData[i];
            
            // Asignamos aleatoriamente un Propietario y una Vereda del catálogo
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
                    idVereda: veredaAleatoria.id,
                    idPropietario: propietarioAleatorio.id,
                    idLugarProduccion: null // <--- IMPORTANTE: Queda vacío por ahora
                }
            });
        }

        console.log('✅ Propietarios y Predios inyectados con éxito.');
    } catch (error) {
        console.error('❌ Error en el seeder de predios:', error);
    }
};