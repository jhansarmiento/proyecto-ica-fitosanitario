import { Router } from 'express';
import Predio from '../models/Predio';
import Propietario from '../models/Propietario';
import LugarProduccion from '../models/LugarProduccion';

const prediosRoutes = Router();

prediosRoutes.get('/', async (_req, res) => {
  try {
    const predios = await Predio.findAll({
      include: [
        { model: Propietario, as: 'propietario', attributes: ['id', 'nombre', 'numeroIdentificacion'] },
        { model: LugarProduccion, as: 'lugarProduccion', attributes: ['id', 'nombreLugarProduccion'] },
      ],
      order: [['nombrePredio', 'ASC']],
    });
    return res.status(200).json({ data: predios });
  } catch (error) {
    console.error('Error listando predios:', error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
});

prediosRoutes.get('/:id', async (req, res) => {
  try {
    const predio = await Predio.findByPk(req.params.id, {
      include: [
        { model: Propietario, as: 'propietario', attributes: ['id', 'nombre', 'numeroIdentificacion'] },
        { model: LugarProduccion, as: 'lugarProduccion', attributes: ['id', 'nombreLugarProduccion'] },
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
      numeroPredial?: string;
      numeroRegistroICA?: string;
      nombrePredio?: string;
      direccion?: string;
      areaTotal?: number;
      idVereda?: string;
      idLugarProduccion?: string | null;
      idPropietario?: string;
    };

    if (
      !body.numeroPredial ||
      !body.numeroRegistroICA ||
      !body.nombrePredio ||
      body.areaTotal === undefined ||
      !body.idVereda ||
      !body.idPropietario
    ) {
      return res.status(400).json({
        message:
          'numeroPredial, numeroRegistroICA, nombrePredio, areaTotal, idVereda e idPropietario son obligatorios',
      });
    }

    const created = await Predio.create({
      numeroPredial: body.numeroPredial,
      numeroRegistroICA: body.numeroRegistroICA,
      nombrePredio: body.nombrePredio,
      direccion: body.direccion ?? '',
      areaTotal: body.areaTotal,
      idVereda: body.idVereda,
      idLugarProduccion: body.idLugarProduccion ?? null,
      idPropietario: body.idPropietario,
    });

    const predio = await Predio.findByPk(created.getDataValue('id'), {
      include: [
        { model: Propietario, as: 'propietario', attributes: ['id', 'nombre', 'numeroIdentificacion'] },
        { model: LugarProduccion, as: 'lugarProduccion', attributes: ['id', 'nombreLugarProduccion'] },
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

prediosRoutes.put('/:id', async (req, res) => {
  try {
    const predio = await Predio.findByPk(req.params.id);
    if (!predio) return res.status(404).json({ message: 'Predio no encontrado' });

    const body = req.body as {
      numeroPredial?: string;
      numeroRegistroICA?: string;
      nombrePredio?: string;
      direccion?: string;
      areaTotal?: number;
      idVereda?: string;
      idLugarProduccion?: string | null;
      idPropietario?: string;
    };

    await predio.update({
      numeroPredial: body.numeroPredial ?? predio.getDataValue('numeroPredial'),
      numeroRegistroICA: body.numeroRegistroICA ?? predio.getDataValue('numeroRegistroICA'),
      nombrePredio: body.nombrePredio ?? predio.getDataValue('nombrePredio'),
      direccion: body.direccion ?? predio.getDataValue('direccion'),
      areaTotal: body.areaTotal ?? predio.getDataValue('areaTotal'),
      idVereda: body.idVereda ?? predio.getDataValue('idVereda'),
      idLugarProduccion:
        body.idLugarProduccion !== undefined ? body.idLugarProduccion : predio.getDataValue('idLugarProduccion'),
      idPropietario: body.idPropietario ?? predio.getDataValue('idPropietario'),
    });

    const updated = await Predio.findByPk(predio.getDataValue('id'), {
      include: [
        { model: Propietario, as: 'propietario', attributes: ['id', 'nombre', 'numeroIdentificacion'] },
        { model: LugarProduccion, as: 'lugarProduccion', attributes: ['id', 'nombreLugarProduccion'] },
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

prediosRoutes.delete('/:id', async (req, res) => {
  try {
    const predio = await Predio.findByPk(req.params.id);
    if (!predio) return res.status(404).json({ message: 'Predio no encontrado' });

    await predio.destroy();
    return res.status(200).json({ message: 'Predio eliminado' });
  } catch (error) {
    console.error('Error eliminando predio:', error);
    return res.status(500).json({ message: 'No se pudo eliminar el predio (puede estar en uso)' });
  }
});

export default prediosRoutes;
