// backend/src/controllers/solicitud.controller.ts
import { Request, Response } from 'express';
import models from '../index'; 

export const createSolicitudInspeccion = async (req: Request, res: Response): Promise<void> => {
    try {
        const id_lugar_produccion = req.params.id; // Lo sacamos de la URL
        const payload = req.body;

        // 1. Verificamos que el lugar exista
        const lugar = await models.LugarProduccion.findByPk(id_lugar_produccion);
        if (!lugar) {
            res.status(404).json({ message: 'Lugar de producción no encontrado.' });
            return;
        }

        // 2. Insertamos la solicitud
        const nuevaSolicitud = await models.SolicitudInspeccion.create({
            fecha_tentativa_productor: payload.fecha_tentativa_productor,
            observaciones: payload.observaciones || null,
            id_lugar_produccion: id_lugar_produccion,
            estado: 'SOLICITADA' 
        });

        res.status(201).json({ message: 'Solicitud radicada con éxito', data: nuevaSolicitud });
    } catch (error) {
        console.error('❌ Error creando solicitud de inspección:', error);
        res.status(500).json({ message: 'Error interno radicando la solicitud.' });
    }
};

export const getSolicitudes = async (req: any, res: Response): Promise<void> => {
    try {
        const id_usuario = req.usuario.id;
        const rol = req.usuario.rol?.toLowerCase();

        // 💡 Filtro dinámico: El backend decide qué mostrar según quién pregunta
        let whereLugar: any = {};
        if (rol === 'productor') {
            whereLugar.id_usuario_productor = id_usuario;
        } else if (rol === 'asistente_tecnico') {
            whereLugar.id_asistente_asignado = id_usuario;
        }

        const solicitudes = await models.SolicitudInspeccion.findAll({
            include: [{
                association: 'lugarProduccion',
                where: whereLugar,
                include: [
                    // 💡 SOLUCIÓN: Declaramos explícitamente el modelo y su alias correcto
                    { 
                        model: models.Usuario, 
                        as: 'asistenteAsignado', // 👈 Ej: 'asistente', 'asistenteAsignado', etc.
                        attributes: ['nombre', 'apellidos'] 
                    },
                    { association: 'predio' }
                ]
            }],
            order: [['fecha_creacion', 'DESC']]
        });

        // Mapeo limpio para el frontend
        const data = solicitudes.map((s: any) => {
            const json = s.toJSON();
            const lugar = json.lugarProduccion;
            const asistente = lugar?.asistenteAsignado;
            
            return {
                id_solicitud: json.id_solicitud_inspeccion,
                fecha_creacion: json.fecha_creacion,
                fecha_tentativa: json.fecha_tentativa_productor,
                fecha_programada: json.fecha_programada_tecnico,
                estado: json.estado,
                observaciones: json.observaciones,
                // Datos del lugar
                lugar_nombre: lugar?.nombre_lugar_produccion || 'N/D',
                lugar_ubicacion: `${lugar?.predio?.[0]?.municipio || ''}`,
                asistente_nombre: asistente ? `${asistente.nombre} ${asistente.apellidos}` : 'Pendiente',
            };
        });

        res.status(200).json({ data });
    } catch (error) {
        console.error('❌ Error listando solicitudes:', error);
        res.status(500).json({ message: 'Error interno al cargar las solicitudes.' });
    }
};

export const programarSolicitud = async (req: any, res: Response): Promise<void> => {
    try {
        const id_solicitud = req.params.id;
        const { fecha_programada_tecnico } = req.body;

        const solicitud = await models.SolicitudInspeccion.findByPk(id_solicitud);
        if (!solicitud) {
            res.status(404).json({ message: 'Solicitud no encontrada.' });
            return;
        }

        await solicitud.update({
            fecha_programada_tecnico,
            estado: 'PROGRAMADA' // 🌟 Cambio de estado automático
        });

        res.status(200).json({ message: 'Inspección programada con éxito.', data: solicitud });
    } catch (error) {
        console.error('❌ Error programando solicitud:', error);
        res.status(500).json({ message: 'Error interno al programar la inspección.' });
    }
};