import { Request, Response } from 'express';
import models from '../index'; // Tus modelos de Sequelize

export const createLote = async (req: Request, res: Response): Promise<void> => {
    try {
        const id_lugar_produccion = req.params.id;
        const payload = req.body;

        // 1. Control de seguridad: Validamos que el predio enviado sea obligatorio
        if (!payload.id_predio) {
            res.status(400).json({ message: 'El parámetro id_predio es obligatorio para la consistencia geográfica.' });
            return;
        }

        // 2. Validamos que el lugar de producción exista
        const lugar = await models.LugarProduccion.findByPk(id_lugar_produccion);
        if (!lugar) {
            res.status(404).json({ message: 'El lugar de producción solicitado no existe.' });
            return;
        }

        const idVariedadFinal = payload.id_variedad_especie;
        if (!idVariedadFinal) {
            res.status(400).json({ message: 'El parámetro id_variedad_especie es requerido para asociar el lote a un cultivo.' });
            return;
        }

        // Insertamos en la BD Física
        const nuevoLote = await models.Lote.create({
            numero_lote: payload.numero_lote,
            area_total: payload.area_total,
            fecha_siembra: payload.fecha_siembra,
            fecha_cosecha: payload.fecha_cosecha,
            estado: 'ACTIVO',
            cantidad_plantas: payload.cantidad_plantas || 0,
            id_variedad_especie: idVariedadFinal,
            id_predio: payload.id_predio // Si tu modelo físico exige un id_predio específico, debes enviarlo desde el frontend
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