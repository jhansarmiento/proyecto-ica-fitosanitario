import { Router } from 'express';
import { forgotPassword, login, resetPassword } from '../controllers/auth.controller';
import { registerProductor } from '../controllers/registerProductor.controller';

const router = Router();

// Endpoint: POST /api/auth/login
router.post('/login', login);

// Endpoint: POST /api/auth/register-productor
router.post('/register-productor', registerProductor);

// Endpoint: POST /api/auth/forgot-password
router.post('/forgot-password', forgotPassword);

// Endpoint: POST /api/auth/reset-password
router.post('/reset-password', resetPassword);

export default router;
