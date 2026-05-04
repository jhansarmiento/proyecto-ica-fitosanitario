import { Router } from 'express';
import Lote from '../models/Lote';
import Predio from '../models/Predio';

const lotesRoutes = Router();

lotesRoutes.get('/', async (_req, res) => {
  try {
    const lotes = await Lote.findAll({
      include: [{ model: Predio, as: 'predio', attributes: ['id', 'nombrePredio', 'numeroPredial'] }],
      order: [['numeroLote', 'ASC']],
    });
    return res.status(200).json({ data: lotes });
  } catch (error) {
    console.error('Error listando lotes:', error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
});

lotesRoutes.get('/:id', async (req, res) => {
  try {
    const lote = await Lote.findByPk(req.params.id, {
      include: [{ model: Predio, as: 'predio', attributes: ['id', 'nombrePredio', 'numeroPredial'] }],
    });

    if (!lote) return res.status(404).json({ message: 'Lote no encontrado' });
    return res.status(200).json({ data: lote });
  } catch (error) {
    console.error('Error obteniendo lote:', error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
});

lotesRoutes.post('/', async (req, res) => {
  try {
    const body = req.body as {
      numeroLote?: string;
      areaTotal?: number;
      fechaSiembra?: string;
      fechaCosecha?: string;
      idVariedad?: string;
      idPredio?: string;
    };

    if (
      !body.numeroLote ||
      body.areaTotal === undefined ||
      !body.fechaSiembra ||
      !body.fechaCosecha ||
      !body.idVariedad ||
      !body.idPredio
    ) {
      return res.status(400).json({
        message: 'numeroLote, areaTotal, fechaSiembra, fechaCosecha, idVariedad e idPredio son obligatorios',
      });
    }

    const created = await Lote.create({
      numeroLote: body.numeroLote,
      areaTotal: body.areaTotal,
      fechaSiembra: body.fechaSiembra,
      fechaCosecha: body.fechaCosecha,
      idVariedad: body.idVariedad,
      idPredio: body.idPredio,
    });

    const lote = await Lote.findByPk(created.getDataValue('id'), {
      include: [{ model: Predio, as: 'predio', attributes: ['id', 'nombrePredio', 'numeroPredial'] }],
    });

    return res.status(201).json({ message: 'Lote creado', data: lote });
  } catch (error) {
    console.error('Error creando lote:', error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
});

lotesRoutes.put('/:id', async (req, res) => {
  try {
    const lote = await Lote.findByPk(req.params.id);
    if (!lote) return res.status(404).json({ message: 'Lote no encontrado' });

    const body = req.body as {
      numeroLote?: string;
      areaTotal?: number;
      fechaSiembra?: string;
      fechaCosecha?: string;
      idVariedad?: string;
      idPredio?: string;
    };

    await lote.update({
      numeroLote: body.numeroLote ?? lote.getDataValue('numeroLote'),
      areaTotal: body.areaTotal ?? lote.getDataValue('areaTotal'),
      fechaSiembra: body.fechaSiembra ?? lote.getDataValue('fechaSiembra'),
      fechaCosecha: body.fechaCosecha ?? lote.getDataValue('fechaCosecha'),
      idVariedad: body.idVariedad ?? lote.getDataValue('idVariedad'),
      idPredio: body.idPredio ?? lote.getDataValue('idPredio'),
    });

    const updated = await Lote.findByPk(lote.getDataValue('id'), {
      include: [{ model: Predio, as: 'predio', attributes: ['id', 'nombrePredio', 'numeroPredial'] }],
    });

    return res.status(200).json({ message: 'Lote actualizado', data: updated });
  } catch (error) {
    console.error('Error actualizando lote:', error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
});

lotesRoutes.delete('/:id', async (req, res) => {
  try {
    const lote = await Lote.findByPk(req.params.id);
    if (!lote) return res.status(404).json({ message: 'Lote no encontrado' });

    await lote.destroy();
    return res.status(200).json({ message: 'Lote eliminado' });
  } catch (error) {
    console.error('Error eliminando lote:', error);
    return res.status(500).json({ message: 'No se pudo eliminar el lote (puede estar en uso)' });
  }
});

export default lotesRoutes;
