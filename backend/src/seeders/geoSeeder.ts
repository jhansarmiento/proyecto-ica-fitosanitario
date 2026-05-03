import fs from 'fs'; // Para trabajar con archivos
import path from 'path'; // Para manejar rutas de archivos
import catalogModels, { sequelizeCatalog } from '../catalogIndex'; 

export const seedGeoData = async () => {

    const t = await sequelizeCatalog.transaction(); // Iniciamos una transacción para asegurar la integridad de los datos

    try {
        const jsonPath = path.join(__dirname, '../data/colombia.json'); // Ruta al archivo JSON con los datos geográficos
        const rawData = fs.readFileSync(jsonPath, 'utf-8'); // Leemos el archivo JSON
        const data = JSON.parse(rawData); // Parseamos el JSON para obtener un objeto JavaScript

        console.log('⏳ Iniciando inyección de datos geográficos...');

        for(const dep of data) {
            // Insertamos el departamento
            const [departamento] = await catalogModels.Departamento.findOrCreate({
                where: { id: dep.codigo_dep },
                defaults: {
                    nombre: dep.departamento
                },
                transaction: t
            });

            for(const mun of dep.municipios) {
                // Insertamos el municipio, asociándolo al departamento
                const [municipio] = await catalogModels.Municipio.findOrCreate({
                    where: { id: mun.codigo_mun },
                    defaults: {
                        nombre: mun.nombre,
                        idDepartamento: departamento.get('id')
                    },
                    transaction: t
                });

                for(const veredaNombre of mun.veredas) {
                    // Insertamos la vereda, asociándola al municipio
                    await catalogModels.Vereda.findOrCreate({
                        where: {
                            nombre: veredaNombre,
                            idMunicipio: municipio.get('id')
                        },
                        transaction: t
                    });
                }
            }
        }
        await t.commit(); // Si todo sale bien, confirmamos la transacción
        console.log('✅ Datos geográficos inyectados exitosamente.');
    } catch (error) {
        await t.rollback(); // Si algo falla, deshacemos la transacción
        console.error('❌ Error al inyectar datos geográficos:', error);
    }
};