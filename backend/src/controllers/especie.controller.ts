import { Request, Response } from 'express';
import catalogmodels from '../catalogIndex'; // Asegúrate de apuntar a tu index central de modelos

export const obtenerCatalogoEspecies = async (req: Request, res: Response): Promise<void> => {
    try {
        const especies = await catalogmodels.EspecieVegetal.findAll();
        
        // Enviamos la respuesta limpia envuelta en la propiedad 'data' que espera el frontend
        res.json({ data: especies });
    } catch (error) {
        console.error('❌ Error al obtener el catálogo de especies:', error);
        res.status(500).json({ message: 'Error interno al cargar el catálogo fitosanitario.' });
    }
};

export const getVariedadesPorEspecie = async (req: Request, res: Response): Promise<void> => {
    try {
        const id_especie_vegetal = req.params.id;
        // Consulta las variedades reales que pertenecen a la especie seleccionada
        const variedades = await catalogmodels.VariedadEspecie.findAll({
            where: { id_especie_vegetal }
        });
        res.status(200).json({ data: variedades });
    } catch (error) {
        res.status(500).json({ message: 'Error cargando las variedades.' });
    }
};