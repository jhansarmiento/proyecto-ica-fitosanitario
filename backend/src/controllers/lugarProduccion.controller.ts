import { Response } from 'express';
import sequelize from '../config/database';
import models from '../index';
import { AuthenticatedRequest } from '../types/usuario.types'; // Asumiendo que extendiste Request con el usuario del JWT

export const crearLugarProduccion = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    // Iniciamos una transacción atómica de Sequelize
    const t = await sequelize.transaction();

    try {
        // Obtenemos los datos del cuerpo de la solicitud
        const { nombre_lugar_produccion, numero_registro_ica, predios_ids, especies } = req.body;
        const id_usuario_productor = req.usuario?.id; // Extraído de forma segura desde el middleware de autenticación

        // Regla de negocio pre-condición: Debe tener al menos un predio asociado
        if (!predios_ids || predios_ids.length === 0) {
            res.status(400).json({ message: 'Un lugar de producción debe tener al menos un predio asociado.' });
            return;
        }

        // 1. Crear el Lugar de Producción en estado PENDIENTE
        const nuevoLugar = await models.LugarProduccion.create({
            nombre_lugar_produccion,
            numero_registro_ica,
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
        res.status(500).json({ message: 'Error interno del servidor al procesar la solicitud.' });
    }
};