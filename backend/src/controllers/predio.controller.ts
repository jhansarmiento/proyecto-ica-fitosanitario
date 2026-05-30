import { Request, Response } from 'express';
import Predio from '../models/Predio';
import catalogmodels from '../catalogIndex'; // Tu nuevo índice de catálogos
import type { IVeredaGeografica } from '../types/infoGeo.interface';



export const obtenerPrediosDisponibles = async (req: Request, res: Response): Promise<void> => {
    try {
        // Traer los predios sin lugar de producción asignado (BD Operacional)
        const predios = await Predio.findAll({
            where: { id_lugar_produccion: null }
        });

        if (predios.length === 0) {
            res.json({ data: [] });
            return;
        }

        // Extraer los IDs de vereda únicos
        const idVeredas: string[] = [...new Set(predios.map(p => p.id_vereda))];

        // Buscar las ubicaciones en la BD de Catálogos cruzando las relaciones.
        // Forzamos el tipado de la respuesta con un "as unknown as" hacia nuestra interfaz limpia.
        const veredasCatalogo = await catalogmodels.Vereda.findAll({
            where: { id_vereda: idVeredas },
            include: [
                {
                    model: catalogmodels.Municipio,
                    as: 'municipio',
                    include: [{ model: catalogmodels.Departamento, as: 'departamento' }]
                }
            ]
        }) as unknown as IVeredaGeografica[];

        // Crear un mapa de veredas con sus respectivas ubicaciones
        const geoMap = new Map<string, IVeredaGeografica>(
            veredasCatalogo.map((v) => [v.id_vereda, v])
        );

        // Combinar la información de forma segura y tipada
        const prediosEnriquecidos = predios.map(p => {
            const infoGeo = geoMap.get(p.id_vereda);
            
            return {
                ...p.toJSON(),
                vereda: infoGeo?.nombre || 'N/D',
                municipio: infoGeo?.municipio?.nombre || 'N/D',
                departamento: infoGeo?.municipio?.departamento?.nombre || 'N/D'
            };
        });

        res.json({ data: prediosEnriquecidos });

    } catch (error) {
        console.error('❌ Error al obtener predios con datos geográficos:', error);
        res.status(500).json({ message: 'Error interno al procesar la ubicación de los predios.' });
    }
};