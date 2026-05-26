// src/controllers/lugarProduccion.controller.ts
import { Response } from 'express';
import sequelize from '../config/database';
import models from '../index';
import { AuthenticatedRequest } from '../types/usuario.types';

// ─── 1. ENDPOINT PARA CREAR LUGAR DE PRODUCCIÓN (POST) ────────────────────────
export const crearLugarProduccion = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    // Iniciamos una transacción atómica de Sequelize
    const t = await sequelize.transaction();

    try {
        const { nombre_lugar_produccion, numero_registro_ica, predios_ids, especies } = req.body;
        const id_usuario_productor = req.usuario?.id; // Extraído de forma segura desde el middleware de autenticación

        // Regla de negocio pre-condición: Debe tener al menos un predio asociado
        if (!predios_ids || predios_ids.length === 0) {
            res.status(400).json({ message: 'Un lugar de producción debe tener al menos un predio asociado.' });
            return;
        }

        // Generamos un Radicado Único Temporal (Ej: RAD-83726-2026)
        const anioActual = new Date().getFullYear();
        const numeroRadicadoProvisional = `RAD-${Math.floor(10000 + Math.random() * 90000)}-${anioActual}`;

        // 1. Crear el Lugar de Producción con su radicado provisional y estado pendiente
        const nuevoLugar = await models.LugarProduccion.create({
            nombre_lugar_produccion,
            numero_registro_ica: numeroRadicadoProvisional, // Se guarda el radicado automáticamente
            id_usuario_productor,
            estado: 'PENDIENTE',
            fecha_solicitud: new Date()
        }, { transaction: t });

        // 2. Asociar los predios existentes actualizando su FK externa
        await models.Predio.update(
            { id_lugar_produccion: nuevoLugar.id_lugar_produccion },
            { 
                where: { id_predio: predios_ids },
                transaction: t 
            }
        );

        // 3. Registrar las proyecciones de capacidad por cada especie vegetal seleccionada
        if (especies && especies.length > 0) {
            const autorizaciones = especies.map((esp: any) => ({
                id_lugar_produccion: nuevoLugar.id_lugar_produccion,
                id_especie_vegetal: esp.id_especie_vegetal,
                capacidad_produccion: esp.capacidad_produccion
            }));

            await models.AutorizacionEspecie.bulkCreate(autorizaciones, { transaction: t });
        }

        // Si todo el circuito se ejecutó sin errores, consolidamos los datos permanentemente
        await t.commit();

        res.status(201).json({
            message: 'Solicitud de lugar de producción creada con éxito y enviada a revisión ICA.',
            id_lugar_produccion: nuevoLugar.id_lugar_produccion
        });

    } catch (error) {
        // Si algo falla en cualquier punto, devolvemos la BD al estado original de forma segura
        await t.rollback();
        console.error('❌ Error transaccional al crear lugar de producción:', error);
        res.status(500).json({ message: 'Error interno al procesar la creación del lugar de producción.' });
    }
};

// ─── 2. ENDPOINT PARA LISTAR LUGARES DEL PRODUCTOR (GET) ──────────────────────
export const obtenerLugaresDelProductor = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const id_usuario_productor = req.usuario?.id; // Extraído de forma segura desde el middleware de autenticación

        const lugares = await models.LugarProduccion.findAll({
            where: { id_usuario_productor },
            include: [
                { association: 'predio' }, // Trae los predios vinculados
                { association: 'autorizacionEspecie' } // Trae las especies lógicas autorizadas
            ]
        });

        res.json({ data: lugares });
    } catch (error) {
        console.error('❌ Error al listar lugares de producción:', error);
        res.status(500).json({ message: 'Error interno al cargar tus lugares de producción.' });
    }
};