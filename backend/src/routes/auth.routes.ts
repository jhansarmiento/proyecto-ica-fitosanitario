import { Router } from 'express';
import { login } from '../controllers/auth.controller';
import { registerProductor } from '../controllers/registerProductor.controller';

const router = Router();

// Endpoint: POST /api/auth/login
router.post('/login', login);

// Endpoint: POST /api/auth/register-productor
router.post('/register-productor', registerProductor);

export default router;
