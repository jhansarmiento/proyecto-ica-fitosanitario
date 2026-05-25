import { Request, Response } from 'express';
import EspecieVegetalModel from '../models/EspecieVegetal';
import type { EspecieVegetal, EspecieVegetalDbRecord } from '../types/especieVegetal.types';

/**
 * Mapea un registro físico (snake_case) de Sequelize a entidad de dominio (camelCase).
 * Este contrato es el que se expone al frontend y mantiene coherencia con UML.
 */
function mapDbToDomain(record: EspecieVegetalDbRecord): EspecieVegetal {
  return {
    id: record.id_especie_vegetal,
    nombreEspecie: record.nombre_especie,
    nombreComun: record.nombre_comun,
    cicloCultivo: record.ciclo_cultivo,
    imagenEspecieVegetal: record.imagen_especie_vegetal ?? null,
  };
}

/**
 * GET /api/especies-vegetales
 * Lista especies vegetales del catálogo con salida en camelCase.
 */
export async function listarEspeciesVegetales(_req: Request, res: Response): Promise<Response> {
  try {
    const especies = await EspecieVegetalModel.findAll({
      order: [['nombre_especie', 'ASC']],
    });

    const data = especies.map((item) => mapDbToDomain(item.get({ plain: true }) as EspecieVegetalDbRecord));

    return res.status(200).json({ data });
  } catch (error) {
    console.error('Error listando especies vegetales:', error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
}
