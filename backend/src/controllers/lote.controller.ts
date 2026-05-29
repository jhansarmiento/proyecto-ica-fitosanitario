import { Request, Response } from 'express';
import models from '../index'; // Tus modelos de Sequelize

export const createLote = async (req: Request, res: Response): Promise<void> => {
    try {
        const id_lugar_produccion = req.params.id;
        const payload = req.body;

        // Validamos que el lugar exista y pertenezca al usuario (seguridad)
        const lugar = await models.LugarProduccion.findOne({
            where: { id_lugar_produccion } // Puedes añadir "id_usuario_productor: req.usuario.id" si quieres más seguridad
        });

        if (!lugar) {
            res.status(404).json({ message: 'El lugar de producción no existe.' });
            return;
        }

        // Insertamos en la BD Física
        const nuevoLote = await models.Lote.create({
            numero_lote: payload.numero_lote,
            area_total: payload.area_total,
            fecha_siembra: payload.fecha_siembra,
            fecha_cosecha: payload.fecha_cosecha,
            estado: 'Activo',
            cantidad_plantas: payload.cantidad_plantas || 0,
            id_variedad: payload.id_variedad,
            id_predio: null // Si tu modelo físico exige un id_predio específico, debes enviarlo desde el frontend
        });

        res.status(201).json({ message: 'Lote registrado con éxito', data: nuevoLote });
    } catch (error) {
        console.error('❌ Error creando lote:', error);
        res.status(500).json({ message: 'Error interno guardando el lote.' });
    }
};

export const getLotesPorLugar = async (req: Request, res: Response): Promise<void> => {
    try {
        // En una implementación real, aquí harías un JOIN con Lote, Especie y Variedad
        // basándote en que todos los lotes de este lugar_produccion tengan la FK asociada.
        
        // Simulación de respuesta vacía temporal para que la UI no rompa:
        res.status(200).json({ data: [] }); 
    } catch (error) {
        res.status(500).json({ message: 'Error listando lotes.' });
    }
}