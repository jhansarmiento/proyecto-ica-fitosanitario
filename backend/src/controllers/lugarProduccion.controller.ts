// src/controllers/lugarProduccion.controller.ts
import { Response } from 'express';
import sequelize from '../config/database';
import models from '../index';
import catalogmodels from '../catalogIndex'; 
import Predio from '../models/Predio';
import type { IVeredaGeografica } from '../types/infoGeo.interface';
import { AuthenticatedRequest } from '../types/usuario.types';

// ─── 1. ENDPOINT PARA CREAR LUGAR DE PRODUCCIÓN (POST) ────────────────────────
export const crearLugarProduccion = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    // Iniciamos una transacción atómica de Sequelize
    const t = await sequelize.transaction();

    try {
        const { nombre_lugar_produccion, predios_ids, especies } = req.body;
        const id_usuario_productor = req.usuario?.id; // Extraído de forma segura desde el middleware de autenticación

        // Regla de negocio pre-condición: Debe tener al menos un predio asociado
        if (!predios_ids || predios_ids.length === 0) {
            res.status(400).json({ message: 'Un lugar de producción debe tener al menos un predio asociado.' });
            return;
        }


        // ─── VALIDACIÓN DE CONTIGÜIDAD (MISMO DEPARTAMENTO) ───────────────────
        // 1. Buscamos los predios seleccionados en la BD Operacional para obtener sus id_vereda
        const prediosBase = await Predio.findAll({
            where: { id_predio: predios_ids }
        });

        const idVeredas = prediosBase.map(p => p.id_vereda)

        // 2. Consultamos el árbol geográfico en la BD de Catálogos
        const veredasGeograficas = await catalogmodels.Vereda.findAll({
            where: { id_vereda: idVeredas},
            include: [
                {
                    model: catalogmodels.Municipio,
                    as: 'municipio',
                    include: [{
                        model: catalogmodels.Departamento,
                        as: 'departamento',
                    }]
                }
            ]
        }) as unknown as IVeredaGeografica[];

        // 3. Extraemos los IDs de los departamentos a los que pertenecen las veredas
        const departamentosIds = veredasGeograficas
            .map(v => v.municipio?.departamento?.id_departamento)
            .filter(Boolean)

        // Usamos un Set para eliminar duplicados. Si el tamaño es mayor a 1, significa que hay más de un departamento.
        const departamentosUnicos = [...new Set(departamentosIds)];

        if (departamentosUnicos.length > 1) {
            // Cancelamos el flujo antes de tocar la base de datos
            res.status(400).json({ 
                message: 'Criterio de aceptación ICA rechazado: Todos los predios asociados deben pertenecer al mismo departamento para garantizar la contigüidad.' 
            });
            return;
        }

        // Generamos un Radicado Único Temporal (Ej: RAD-83726-2026)
        const anioActual = new Date().getFullYear();
        const numeroRadicadoProvisional = `ICA-LP-${Math.floor(10000 + Math.random() * 90000)}-${anioActual}`;

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

        // Devolvemos una respuesta exitosa con el número de radicado provisional para seguimiento
        res.status(201).json({
            message: 'Solicitud de lugar de producción creada con éxito y enviada a revisión ICA.',
            id_lugar_produccion: nuevoLugar.id_lugar_produccion,
            radicado_provisional: numeroRadicadoProvisional
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

// ─── 3. ENDPOINT PARA LISTAR SOLICITUDES PENDIENTES PARA EL ICA (GET) ──────────────────────
export const obtenerSolicitudesPendientesICA = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        // 1. Buscamos todas las solicitudes pendientes de la BD Operacional
        const solicitudes = await models.LugarProduccion.findAll({
            where: { estado: 'PENDIENTE' },
            include: [
                {
                    model: models.Usuario,
                    as: 'productor',
                    attributes: ['nombre', 'apellidos', 'numero_identificacion', 'correo_electronico', 'telefono']
                },
                {
                    association: 'predio' // Trae los terrenos amarrados
                }
            ],
            order: [['fecha_solicitud', 'DESC']]
        });

        // 2. Extraer todos los id_vereda únicos de todos los predios de la lista
        const allVeredaIds: string[] = [];
        solicitudes.forEach((sol: any) => {
            if (sol.predio) {
                sol.predio.forEach((p: any) => {
                    if (p.id_vereda) allVeredaIds.push(p.id_vereda);
                });
            }
        });
        const uniqueVeredaIds = [...new Set(allVeredaIds)];

        // 3. Consultar las ubicaciones de las veredas en la BD de Catálogos 
        // para obtener municipio y departamento, y mapearlo en un objeto de consulta rápida
        const veredasCatalogo = await catalogmodels.Vereda.findAll({
            where: { id_vereda: uniqueVeredaIds },
            include: [
                {
                    model: catalogmodels.Municipio,
                    as: 'municipio',
                    include: [{ model: catalogmodels.Departamento, as: 'departamento' }]
                }
            ]
        });

        // Mapeamos los datos del catálogo en un Map O(1)
        const geoMap = new Map<string, any>(
            veredasCatalogo.map((v: any) => [v.id_vereda, v])
        );

        // 4. Inyectar de forma transparente las ubicaciones del catálogo en cada predio
        const solicitudesEnriquecidas = solicitudes.map((sol: any) => {
            const solJson = sol.toJSON();
            if (solJson.predio) {
                solJson.predio = solJson.predio.map((p: any) => {
                    const infoGeo = geoMap.get(p.id_vereda);
                    return {
                        ...p,
                        vereda: infoGeo?.nombre || 'N/D',
                        municipio: infoGeo?.municipio?.nombre || 'N/D',
                        departamento: infoGeo?.municipio?.departamento?.nombre || 'N/D'
                    };
                });
            }
            return solJson;
        });

        // Retornamos la respuesta enriquecida al frontend
        res.json({ data: solicitudesEnriquecidas });
    } catch (error) {
        console.error('❌ Error al obtener solicitudes pendientes para el ICA:', error);
        res.status(500).json({ message: 'Error interno al cargar la bandeja de revisión fitosanitaria.' });
    }
};