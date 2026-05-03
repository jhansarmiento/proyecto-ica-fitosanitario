import fs from 'fs';
import path from 'path';
import catalogModels, { sequelizeCatalog } from '../catalogIndex'; 

export const seedEspeciesVegetales = async () => {
    const t = await sequelizeCatalog.transaction();

    try {

        const jsonPath = path.join(__dirname, '../data/catalogos_fitosanitarios.json')
        const rawData = fs.readFileSync(jsonPath, 'utf-8');
        const data = JSON.parse(rawData);

        console.log('⏳ Iniciando inyección de Especies, Variedades y Plagas...');

        for (const item of data) {
            // 1. Inyectar Especie Vegetal
            const [especie] = await catalogModels.EspecieVegetal.findOrCreate({
                where: { 
                    nombreEspecie: item.nombre_especie 
                },
                defaults: {
                    nombreComun: item.nombre_comun,
                    cicloCultivo: item.ciclo_cultivo
                },
                transaction: t
            });

            // 2. Inyectar Variedades para esta especie
            for (const nombreVar of item.variedades) {
                await catalogModels.VariedadEspecie.findOrCreate({
                    where: { 
                        nombreVariedad: nombreVar, 
                        idEspecieVegetal: especie.get('id') 
                    },
                    transaction: t
                });
            }

            // 3. Inyectar Plagas y vincular con la especie (Tabla Intermedia, muchos a muchos)
            for (const p of item.plagas) {
                const [plaga] = await catalogModels.Plaga.findOrCreate({
                    where: { 
                        nombreCientificoPlaga: p.nombre_especie_plaga 
                    },
                    defaults: { 
                        nombreComunPlaga: p.nombre_comun_plaga 
                    },
                    transaction: t
                });

                // 4. EL VÍNCULO: Inyectar en la tabla intermedia EspeciePlaga
                // Sequelize suele crear métodos automáticos como especie.addPlaga(plaga) 
                // si las asociaciones están bien hechas, pero también puedes hacerlo manual:
                await catalogModels.EspeciePlaga.findOrCreate({
                    where: { 
                        idEspecieVegetal: especie.get('id'), 
                        idPlaga: plaga.get('id') 
                    },
                    transaction: t
                });
            }
        }
        
        await t.commit();
        console.log('✅ Datos de Especies, variedades y Plagas inyectados exitosamente.');
    } catch (error) {
        await t.rollback();
        console.error('❌ Error al inyectar datos de especies vegetales:', error);
    }
}