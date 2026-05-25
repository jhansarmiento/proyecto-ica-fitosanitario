import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthenticatedRequest, JWTPayload } from '../types/usuario.types';

export const validarJWT = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    // 1. Extraer el header de autorización
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ message: 'Acceso denegado. No se proporcionó un token de seguridad.' });
        return;
    }

    // Obtenemos el token
    const token = authHeader.split(' ')[1];

    try {
        // 2. Verificar la firma del token usando la clave secreta
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'semilla_secreta_desarrollo') as JWTPayload;
        
        // 3. Inyectamos los datos decodificados en el Request extendido
        req.usuario = decoded; 
        
        // Damos paso al siguiente componente (el controlador)
        next();
    } catch (error) {
        res.status(403).json({ message: 'Token de seguridad inválido o expirado.' });
    }
};