import { Router } from 'express';
import EspecieVegetal from '../models/EspecieVegetal';

const especiesRoutes = Router();

especiesRoutes.get('/', async (_req, res) => {
  try {
    const especies = await EspecieVegetal.findAll({
      order: [['nombreComun', 'ASC']],
    });
    return res.status(200).json({ data: especies });
  } catch (error) {
    console.error('Error listando especies vegetales:', error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
});

export default especiesRoutes;
