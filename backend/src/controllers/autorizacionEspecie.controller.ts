// src/controllers/autorizacionEspecie.controller.ts
import { Response } from 'express';
import models from '../index';
import { AuthenticatedRequest } from '../types/usuario.types';

export const obtenerAutorizacionesEspecie = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        // Retornamos los registros de la tabla operacional intermedia
        const autorizaciones = await models.AutorizacionEspecie.findAll();
        
        res.json({ data: autorizaciones });
    } catch (error) {
        console.error('❌ Error al obtener autorizaciones de especie:', error);
        res.status(500).json({ message: 'Error interno al cargar las autorizaciones de especie.' });
    }
};