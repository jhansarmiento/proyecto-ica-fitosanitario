import { Router } from 'express';
import AutorizacionEspecie from '../models/AutorizacionEspecie';
import LugarProduccion from '../models/LugarProduccion';

const autorizacionesRoutes = Router();

autorizacionesRoutes.get('/', async (_req, res) => {
  try {
    const autorizaciones = await AutorizacionEspecie.findAll({
      include: [
        {
          model: LugarProduccion,
          as: 'lugarProduccion',
          attributes: ['id', 'nombreLugarProduccion'],
          required: false,
        },
      ],
      order: [['idLugarProduccion', 'ASC']],
    });
    return res.status(200).json({ data: autorizaciones });
  } catch (error) {
    console.error('Error listando autorizaciones de especie:', error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
});

export default autorizacionesRoutes;
