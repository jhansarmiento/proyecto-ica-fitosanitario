import { Router } from 'express';
import LugarProduccion from '../models/LugarProduccion';
import Usuario from '../models/Usuario';

const lugaresRoutes = Router();

lugaresRoutes.get('/', async (_req, res) => {
  try {
    const lugares = await LugarProduccion.findAll({
      include: [{ model: Usuario, as: 'productor', attributes: ['id', 'nombre', 'apellidos', 'ingresoUsuario'] }],
      order: [['nombreLugarProduccion', 'ASC']],
    });
    return res.status(200).json({ data: lugares });
  } catch (error) {
    console.error('Error listando lugares de producción:', error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
});

lugaresRoutes.get('/:id', async (req, res) => {
  try {
    const lugar = await LugarProduccion.findByPk(req.params.id, {
      include: [{ model: Usuario, as: 'productor', attributes: ['id', 'nombre', 'apellidos', 'ingresoUsuario'] }],
    });

    if (!lugar) return res.status(404).json({ message: 'Lugar de producción no encontrado' });
    return res.status(200).json({ data: lugar });
  } catch (error) {
    console.error('Error obteniendo lugar de producción:', error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
});

lugaresRoutes.post('/', async (req, res) => {
  try {
    const { nombreLugarProduccion, numeroRegistroICA, estado, idUsuarioProductor } = req.body as {
      nombreLugarProduccion?: string;
      numeroRegistroICA?: string;
      estado?: string;
      idUsuarioProductor?: string;
    };

    if (!nombreLugarProduccion || !numeroRegistroICA || !estado || !idUsuarioProductor) {
      return res.status(400).json({
        message: 'nombreLugarProduccion, numeroRegistroICA, estado e idUsuarioProductor son obligatorios',
      });
    }

    const created = await LugarProduccion.create({
      nombreLugarProduccion,
      numeroRegistroICA,
      estado,
      idUsuarioProductor,
    });

    const lugar = await LugarProduccion.findByPk(created.getDataValue('id'), {
      include: [{ model: Usuario, as: 'productor', attributes: ['id', 'nombre', 'apellidos', 'ingresoUsuario'] }],
    });

    return res.status(201).json({ message: 'Lugar de producción creado', data: lugar });
  } catch (error: any) {
    if (error?.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ message: 'Ya existe un lugar con ese número de registro ICA' });
    }
    console.error('Error creando lugar de producción:', error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
});

lugaresRoutes.put('/:id', async (req, res) => {
  try {
    const lugar = await LugarProduccion.findByPk(req.params.id);
    if (!lugar) return res.status(404).json({ message: 'Lugar de producción no encontrado' });

    const { nombreLugarProduccion, numeroRegistroICA, estado, idUsuarioProductor } = req.body as {
      nombreLugarProduccion?: string;
      numeroRegistroICA?: string;
      estado?: string;
      idUsuarioProductor?: string;
    };

    await lugar.update({
      nombreLugarProduccion: nombreLugarProduccion ?? lugar.getDataValue('nombreLugarProduccion'),
      numeroRegistroICA: numeroRegistroICA ?? lugar.getDataValue('numeroRegistroICA'),
      estado: estado ?? lugar.getDataValue('estado'),
      idUsuarioProductor: idUsuarioProductor ?? lugar.getDataValue('idUsuarioProductor'),
    });

    const updated = await LugarProduccion.findByPk(lugar.getDataValue('id'), {
      include: [{ model: Usuario, as: 'productor', attributes: ['id', 'nombre', 'apellidos', 'ingresoUsuario'] }],
    });

    return res.status(200).json({ message: 'Lugar de producción actualizado', data: updated });
  } catch (error: any) {
    if (error?.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ message: 'Ya existe un lugar con ese número de registro ICA' });
    }
    console.error('Error actualizando lugar de producción:', error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
});

lugaresRoutes.delete('/:id', async (req, res) => {
  try {
    const lugar = await LugarProduccion.findByPk(req.params.id);
    if (!lugar) return res.status(404).json({ message: 'Lugar de producción no encontrado' });

    await lugar.destroy();
    return res.status(200).json({ message: 'Lugar de producción eliminado' });
  } catch (error) {
    console.error('Error eliminando lugar de producción:', error);
    return res.status(500).json({ message: 'No se pudo eliminar el lugar de producción (puede estar en uso)' });
  }
});

export default lugaresRoutes;
