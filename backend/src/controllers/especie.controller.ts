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