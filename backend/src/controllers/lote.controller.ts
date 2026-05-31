import { Request, Response } from 'express';
import models from '../index'; // modelos de BD operacional
import catalogModels from '../catalogIndex'; //  modelos de catálogo

export const createLote = async (req: Request, res: Response): Promise<void> => {
    try {
        const id_lugar_produccion = req.params.id;
        const payload = req.body;

        // 1. Control de seguridad: Validamos que el predio enviado sea obligatorio
        if (!payload.id_predio) {
            res.status(400).json({ message: 'El parámetro id_predio es obligatorio para la consistencia geográfica.' });
            return;
        }

        // 2. Validamos que el lugar de producción exista y esté habilitado
        const lugar = await models.LugarProduccion.findByPk(id_lugar_produccion);
        if (!lugar) {
            res.status(404).json({ message: 'El lugar de producción solicitado no existe.' });
            return;
        }

        const estadoLugar = String((lugar as any).estado || '').toLowerCase();
        if (estadoLugar === 'pendiente' || estadoLugar === 'rechazado') {
            res.status(409).json({
                message: 'No se puede crear lote: el lugar de producción está en estado Pendiente o Rechazado.'
            });
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

// backend/src/controllers/lote.controller.ts

export const getLotesPorLugar = async (req: Request, res: Response): Promise<void> => {
    try {
        const id_lugar_produccion = req.params.id;

        // 1. Buscamos los predios que le pertenecen a este lugar
        const lugar = await models.LugarProduccion.findByPk(id_lugar_produccion, {
            include: [{ association: 'predio' }]
        });

        if (!lugar || !lugar.predio || lugar.predio.length === 0) {
            res.status(200).json({ data: [] });
            return;
        }

        const prediosIds = lugar.predio.map((p: any) => p.id_predio);

        // 2. Buscamos todos los lotes plantados en esos predios
        const lotes = await models.Lote.findAll({
            where: { id_predio: prediosIds }
        });

        // 3. Traemos los catálogos para cruzar los nombres (Ultra seguro contra errores de Alias)
        const variedades = await catalogModels.VariedadEspecie.findAll();
        const especies = await catalogModels.EspecieVegetal.findAll();

        // 4. Armamos el rompecabezas para el Frontend
        const dataEnriquecida = lotes.map((l: any) => {
            const loteFisico = l.toJSON();
            const predio = lugar.predio.find((p: any) => p.id_predio === loteFisico.id_predio);
            const variedad = variedades.find((v: any) => v.id_variedad_especie === loteFisico.id_variedad_especie);
            const especie = especies.find((e: any) => e.id_especie_vegetal === variedad?.id_especie_vegetal);

            return {
                id_lote: loteFisico.id_lote,
                numero_lote: loteFisico.numero_lote,
                area_total: loteFisico.area_total,
                fecha_siembra: loteFisico.fecha_siembra,
                fecha_cosecha: loteFisico.fecha_cosecha,
                estado: loteFisico.estado,
                predio_nombre: predio ? predio.nombre_predio : 'N/D',
                variedad_nombre: variedad ? variedad.nombre_variedad : 'N/D',
                especie_nombre: especie ? especie.nombre_comun : 'Desconocida'
            };
        });

        res.status(200).json({ data: dataEnriquecida });
    } catch (error) {
        console.error("❌ Error en getLotesPorLugar:", error);
        res.status(500).json({ message: 'Error listando los lotes del lugar de producción.' });
    }
}

export const updateLote = async (req: Request, res: Response): Promise<void> => {
    try {
        const id_lote = req.params.id_lote;
        const payload = req.body;

        // Buscamos el lote en la base de datos
        const lote = await models.Lote.findByPk(id_lote);

        if (!lote) {
            res.status(404).json({ message: 'El lote solicitado no existe.' });
            return;
        }

        // Actualizamos estrictamente los campos permitidos en la edición
        await lote.update({
            numero_lote: payload.numero_lote,
            area_total: payload.area_total,
            fecha_siembra: payload.fecha_siembra,
            fecha_cosecha: payload.fecha_cosecha || null,
        });

        res.status(200).json({ message: 'Lote actualizado con éxito.', data: lote });
    } catch (error) {
        console.error('❌ Error actualizando lote:', error);
        res.status(500).json({ message: 'Error interno actualizando el lote.' });
    }
};

export const deleteLote = async (req: Request, res: Response): Promise<void> => {
    try {
        const id_lote = req.params.id_lote;

        // Buscamos el lote
        const lote = await models.Lote.findByPk(id_lote);

        if (!lote) {
            res.status(404).json({ message: 'El lote solicitado no existe.' });
            return;
        }

        // Eliminamos el lote de la base de datos
        // Nota: Si tienes ON DELETE CASCADE en la BD, esto también borrará las inspecciones asociadas
        await lote.destroy();

        res.status(200).json({ message: 'Lote eliminado con éxito.' });
    } catch (error) {
        console.error('❌ Error eliminando lote:', error);
        res.status(500).json({ message: 'Error interno al eliminar el lote.' });
    }
};