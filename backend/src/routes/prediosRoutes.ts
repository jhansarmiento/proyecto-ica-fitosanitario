import { Router } from 'express';
import Predio from '../models/Predio';
import Propietario from '../models/Propietario';
import LugarProduccion from '../models/LugarProduccion';

const prediosRoutes = Router();

prediosRoutes.get('/', async (_req, res) => {
  try {
    const predios = await Predio.findAll({
      include: [
        { model: Propietario, as: 'propietario', attributes: ['id_propietario', 'nombre', 'numero_identificacion'] },
        { model: LugarProduccion, as: 'lugarProduccion', attributes: ['id_lugar_produccion', 'nombre_lugar_produccion'] },
      ],
      order: [['nombre_predio', 'ASC']],
    });
    return res.status(200).json({ data: predios });
  } catch (error) {
    console.error('Error listando predios:', error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
});

prediosRoutes.get('/:id_predio', async (req, res) => {
  try {
    const predio = await Predio.findByPk(req.params.id_predio, {
      include: [
        { model: Propietario, as: 'propietario', attributes: ['id_propietario', 'nombre', 'numero_identificacion'] },
        { model: LugarProduccion, as: 'lugarProduccion', attributes: ['id_lugar_produccion', 'nombre_lugar_produccion'] },
      ],
    });

    if (!predio) return res.status(404).json({ message: 'Predio no encontrado' });
    return res.status(200).json({ data: predio });
  } catch (error) {
    console.error('Error obteniendo predio:', error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
});

prediosRoutes.post('/', async (req, res) => {
  try {
    const body = req.body as {
      numero_predial?: string;
      numero_registro_ica?: string;
      nombre_predio?: string;
      direccion?: string;
      area_total?: number;
      id_vereda?: string;
      numero_identificacion_productor?: string;
      id_lugar_produccion?: string | null;
      id_propietario?: string;
    };

    if (
      !body.numero_predial ||
      !body.numero_registro_ica ||
      !body.nombre_predio ||
      body.area_total === undefined ||
      !body.id_vereda ||
      !body.id_propietario
    ) {
      return res.status(400).json({
        message:
          'numero_predial, numero_registro_ica, nombre_predio, area_total, id_vereda e id_propietario son obligatorios',
      });
    }

    const created = await Predio.create({
      numero_predial: body.numero_predial,
      numero_registro_ica: body.numero_registro_ica,
      nombre_predio: body.nombre_predio,
      direccion: body.direccion ?? '',
      area_total: body.area_total,
      id_vereda: body.id_vereda,
      numero_identificacion_productor: body.numero_identificacion_productor ?? null,
      id_lugar_produccion: body.id_lugar_produccion ?? null,
      id_propietario: body.id_propietario,
    });

    const predio = await Predio.findByPk(created.getDataValue('id_predio'), {
      include: [
        { model: Propietario, as: 'propietario', attributes: ['id_propietario', 'nombre', 'numero_identificacion'] },
        { model: LugarProduccion, as: 'lugarProduccion', attributes: ['id_lugar_produccion', 'nombre_lugar_produccion'] },
      ],
    });

    return res.status(201).json({ message: 'Predio creado', data: predio });
  } catch (error: any) {
    if (error?.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ message: 'Ya existe un predio con ese número predial o registro ICA' });
    }
    console.error('Error creando predio:', error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
});

prediosRoutes.put('/:id_predio', async (req, res) => {
  try {
    const predio = await Predio.findByPk(req.params.id_predio);
    if (!predio) return res.status(404).json({ message: 'Predio no encontrado' });

    const body = req.body as {
      numero_predial?: string;
      numero_registro_ica?: string;
      nombre_predio?: string;
      direccion?: string;
      area_total?: number;
      id_vereda?: string;
      numero_identificacion_productor?: string;
      id_lugar_produccion?: string | null;
      id_propietario?: string;
    };

    await predio.update({
      numero_predial: body.numero_predial ?? predio.getDataValue('numero_predial'),
      numero_registro_ica: body.numero_registro_ica ?? predio.getDataValue('numero_registro_ica'),
      nombre_predio: body.nombre_predio ?? predio.getDataValue('nombre_predio'),
      direccion: body.direccion ?? predio.getDataValue('direccion'),
      area_total: body.area_total ?? predio.getDataValue('area_total'),
      id_vereda: body.id_vereda ?? predio.getDataValue('id_vereda'),
      numero_identificacion_productor: body.numero_identificacion_productor ?? predio.getDataValue('numero_identificacion_productor'),
      id_lugar_produccion:
        body.id_lugar_produccion !== undefined ? body.id_lugar_produccion : predio.getDataValue('id_lugar_produccion'),
      id_propietario: body.id_propietario ?? predio.getDataValue('id_propietario'),
    });

    const updated = await Predio.findByPk(predio.getDataValue('id_predio'), {
      include: [
        { model: Propietario, as: 'propietario', attributes: ['id_propietario', 'nombre', 'numero_identificacion'] },
        { model: LugarProduccion, as: 'lugarProduccion', attributes: ['id_lugar_produccion', 'nombre_lugar_produccion'] },
      ],
    });

    return res.status(200).json({ message: 'Predio actualizado', data: updated });
  } catch (error: any) {
    if (error?.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ message: 'Ya existe un predio con ese número predial o registro ICA' });
    }
    console.error('Error actualizando predio:', error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
});

prediosRoutes.delete('/:id_predio', async (req, res) => {
  try {
    const predio = await Predio.findByPk(req.params.id_predio);
    if (!predio) return res.status(404).json({ message: 'Predio no encontrado' });

    await predio.destroy();
    return res.status(200).json({ message: 'Predio eliminado' });
  } catch (error) {
    console.error('Error eliminando predio:', error);
    return res.status(500).json({ message: 'No se pudo eliminar el predio (puede estar en uso)' });
  }
});

export default prediosRoutes;
