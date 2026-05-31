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
    const t = await sequelize.transaction();

    try {
        const { nombre_lugar_produccion, predios_ids, especies } = req.body;
        const id_usuario_productor = req.usuario?.id;

        if (!predios_ids || predios_ids.length === 0) {
            res.status(400).json({ message: 'Un lugar de producción debe tener al menos un predio asociado.' });
            return;
        }

        // Verificar que el usuario del token aún existe en la BD
        const usuarioExiste = await models.Usuario.findByPk(id_usuario_productor);
        if (!usuarioExiste) {
            await t.rollback();
            res.status(401).json({ message: 'Sesión inválida. Por favor cierra sesión y vuelve a ingresar.' });
            return;
        }

        // ─── VALIDACIÓN DE CONTIGÜIDAD (MISMO DEPARTAMENTO) ───────────────────
        const prediosBase = await Predio.findAll({
            where: { id_predio: predios_ids }
        });

        const idVeredas = prediosBase.map(p => p.id_vereda);

        const veredasGeograficas = await catalogmodels.Vereda.findAll({
            where: { id_vereda: idVeredas },
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

        const departamentosIds = veredasGeograficas
            .map(v => v.municipio?.departamento?.id_departamento)
            .filter(Boolean);

        const departamentosUnicos = [...new Set(departamentosIds)];

        if (departamentosUnicos.length > 1) {
            res.status(400).json({
                message: 'Criterio de aceptación ICA rechazado: Todos los predios asociados deben pertenecer al mismo departamento para garantizar la contigüidad.'
            });
            return;
        }

        const anioActual = new Date().getFullYear();
        const numeroRadicadoProvisional = `ICA-LP-${Math.floor(10000 + Math.random() * 90000)}-${anioActual}`;

        const nuevoLugar = await models.LugarProduccion.create({
            nombre_lugar_produccion,
            numero_registro_ica: numeroRadicadoProvisional,
            id_usuario_productor,
            estado: 'PENDIENTE',
            fecha_solicitud: new Date()
        }, { transaction: t });

        await models.Predio.update(
            { id_lugar_produccion: nuevoLugar.id_lugar_produccion },
            {
                where: { id_predio: predios_ids },
                transaction: t
            }
        );

        if (especies && especies.length > 0) {
            const autorizaciones = especies.map((esp: any) => ({
                id_lugar_produccion: nuevoLugar.id_lugar_produccion,
                id_especie_vegetal: esp.id_especie_vegetal,
                capacidad_produccion: esp.capacidad_produccion
            }));

            await models.AutorizacionEspecie.bulkCreate(autorizaciones, { transaction: t });
        }

        await t.commit();

        res.status(201).json({
            message: 'Solicitud de lugar de producción creada con éxito y enviada a revisión ICA.',
            id_lugar_produccion: nuevoLugar.id_lugar_produccion,
            radicado_provisional: numeroRadicadoProvisional
        });

    } catch (error) {
        await t.rollback();
        console.error('❌ Error transaccional al crear lugar de producción:', error);
        res.status(500).json({ message: 'Error interno al procesar la creación del lugar de producción.' });
    }
};

// ─── 2. ENDPOINT PARA LISTAR LUGARES DEL PRODUCTOR (GET) ──────────────────────
export const obtenerLugaresDelProductor = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const id_usuario_productor = req.usuario?.id;
        console.log('🔍 GET lugares - id_usuario_productor del token:', id_usuario_productor);

        if (!id_usuario_productor) {
            res.status(401).json({ message: 'Sesión inválida. Por favor cierra sesión y vuelve a ingresar.' });
            return;
        }

        const lugares = await models.LugarProduccion.findAll({
            where: { id_usuario_productor },
            include: [
                { association: 'predio' },
                { association: 'autorizacionEspecie' },
                {
                    model: models.Usuario,
                    as: 'asistenteAsignado',
                    attributes: ['nombre', 'apellidos']
                }
            ],
            order: [['fecha_solicitud', 'DESC']]
        });

        const veredaIds: string[] = [];
        lugares.forEach((l: any) => {
            if (l.predio) {
                l.predio.forEach((p: any) => {
                    if (p.id_vereda) veredaIds.push(p.id_vereda);
                });
            }
        });

        const uniqueVeredaIds = [...new Set(veredaIds)];

        let geoMap = new Map<string, any>();
        if (uniqueVeredaIds.length > 0) {
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
            geoMap = new Map<string, any>(veredasCatalogo.map((v: any) => [v.id_vereda, v]));
        }

        const lugaresEnriquecidos = lugares.map((l: any) => {
            const lugarJson = l.toJSON();

            const nombreAsistente = lugarJson.asistenteAsignado
                ? `${lugarJson.asistenteAsignado.nombre} ${lugarJson.asistenteAsignado.apellidos}`
                : 'Pendiente de asignación';

            if (lugarJson.predio) {
                lugarJson.predio = lugarJson.predio.map((p: any) => {
                    const infoGeo = geoMap.get(p.id_vereda);
                    return {
                        ...p,
                        vereda: infoGeo?.nombre || p.vereda || 'N/D',
                        municipio: infoGeo?.municipio?.nombre || p.municipio || 'N/D',
                        departamento: infoGeo?.municipio?.departamento?.nombre || p.departamento || 'N/D'
                    };
                });
            }

            return {
                ...lugarJson,
                nombre_asistente_real: nombreAsistente
            };
        });

        res.json({ data: lugaresEnriquecidos });
    } catch (error) {
        console.error('❌ Error al listar lugares de producción:', error);
        res.status(500).json({ message: 'Error interno al cargar tus lugares de producción.' });
    }
};

// ─── 3. ENDPOINT PARA LISTAR SOLICITUDES PARA EL ICA (GET) ──────────────────────
export const obtenerSolicitudesPendientesICA = async (_req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const solicitudes = await models.LugarProduccion.findAll({
            include: [
                {
                    model: models.Usuario,
                    as: 'productor',
                    attributes: ['nombre', 'apellidos', 'numero_identificacion', 'correo_electronico', 'telefono']
                },
                { association: 'predio' },
                { association: 'autorizacionEspecie' }
            ],
            order: [['fecha_solicitud', 'DESC']]
        });

        const normalizarId = (value: unknown) =>
            String(value ?? '').toLowerCase().replace(/[{}]/g, '').trim();

        const allVeredaIds: string[] = [];
        const allEspecieIds: string[] = [];

        solicitudes.forEach((sol: any) => {
            (sol.predio || []).forEach((p: any) => {
                if (p.id_vereda) allVeredaIds.push(p.id_vereda);
            });
            (sol.autorizacionEspecie || []).forEach((e: any) => {
                if (e.id_especie_vegetal) allEspecieIds.push(e.id_especie_vegetal);
            });
        });

        const uniqueVeredaIds = [...new Set(allVeredaIds)];
        const uniqueEspecieIds = [...new Set(allEspecieIds)];

        const [veredasCatalogo, especiesCatalogo] = await Promise.all([
            catalogmodels.Vereda.findAll({
                where: uniqueVeredaIds.length > 0 ? { id_vereda: uniqueVeredaIds } : undefined,
                include: [
                    {
                        model: catalogmodels.Municipio,
                        as: 'municipio',
                        include: [{ model: catalogmodels.Departamento, as: 'departamento' }]
                    }
                ]
            }),
            uniqueEspecieIds.length > 0
                ? catalogmodels.EspecieVegetal.findAll({
                    where: { id_especie_vegetal: uniqueEspecieIds }
                })
                : Promise.resolve([])
        ]);

        const geoMap = new Map<string, any>(
            (veredasCatalogo as any[]).map((v: any) => [normalizarId(v.id_vereda), v])
        );

        const especiesMap = new Map<string, string>(
            (especiesCatalogo as any[]).map((e: any) => [
                normalizarId(e.id_especie_vegetal),
                e.nombre_especie || e.nombre_comun || ''
            ])
        );

        // Respaldo desde JSON local de catálogos
        let catalogJsonEspecies: any[] = [];
        try {
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            const data = require('../data/catalogos_fitosanitarios.json');
            catalogJsonEspecies = Array.isArray(data?.especies_vegetales) ? data.especies_vegetales : [];
        } catch (_e) {
            catalogJsonEspecies = [];
        }

        const especiesJsonMap = new Map<string, string>(
            catalogJsonEspecies.map((cj: any) => [
                normalizarId(cj.id_especie_vegetal),
                cj.nombre_especie || cj.nombre_comun || ''
            ])
        );

        const solicitudesEnriquecidas = solicitudes.map((sol: any) => {
            const solJson = sol.toJSON();

            if (solJson.predio) {
                solJson.predio = solJson.predio.map((p: any) => {
                    const infoGeo = geoMap.get(normalizarId(p.id_vereda));
                    return {
                        ...p,
                        vereda: infoGeo?.nombre || 'N/D',
                        municipio: infoGeo?.municipio?.nombre || 'N/D',
                        departamento: infoGeo?.municipio?.departamento?.nombre || 'N/D'
                    };
                });
            }

            const autorizaciones = Array.isArray(solJson.autorizacionEspecie) ? solJson.autorizacionEspecie : [];
            const especiesResueltas = autorizaciones.map((e: any) => {
                const idNorm = normalizarId(e.id_especie_vegetal);

                const nombreCatalogDb = especiesMap.get(idNorm);
                if (nombreCatalogDb && String(nombreCatalogDb).trim()) return String(nombreCatalogDb).trim();

                const nombreCatalogJson = especiesJsonMap.get(idNorm);
                if (nombreCatalogJson && String(nombreCatalogJson).trim()) return String(nombreCatalogJson).trim();

                const relacion = e.especieVegetal || e.EspecieVegetal || e.especie || null;
                const nombreRelacion = relacion?.nombre || relacion?.nombre_especie || relacion?.nombre_comun;
                if (nombreRelacion && String(nombreRelacion).trim()) return String(nombreRelacion).trim();

                // Fallback obligatorio para no dejar vacío
                return `Especie ID: ${String(e.id_especie_vegetal || '').trim()}`;
            });

            solJson.especies_nombres = [...new Set(especiesResueltas.filter((n: string) => !!String(n).trim()))];

            console.log('🌿 Solicitud especies debug:', {
                id_lugar_produccion: solJson.id_lugar_produccion,
                autorizacion_count: autorizaciones.length,
                especies_nombres: solJson.especies_nombres
            });

            return solJson;
        });

        res.json({ data: solicitudesEnriquecidas });
    } catch (error) {
        console.error('❌ Error al obtener solicitudes para el ICA:', error);
        res.status(500).json({ message: 'Error interno al cargar la bandeja de revisión fitosanitaria.' });
    }
};

// ─── 4. ENDPOINT PARA APROBAR LUGAR DE PRODUCCIÓN (PATCH) ───────────────────
export const aprobarLugarProduccion = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { numero_registro_ica_oficial, id_asistente_asignado } = req.body;

        if (!id_asistente_asignado) {
            res.status(400).json({ message: 'Criterio ICA rechazado: Es obligatorio asignar un asistente técnico calificado para aprobar el lugar.' });
            return;
        }

        const lugar = await models.LugarProduccion.findByPk(id);
        if (!lugar) {
            res.status(404).json({ message: 'El lugar de producción solicitado no existe.' });
            return;
        }

        await lugar.update({
            estado: 'APROBADO',
            numero_registro_ica: numero_registro_ica_oficial,
            id_asistente_asignado: id_asistente_asignado,
            fecha_aprobacion: new Date(),
            id_admin_aprobador: req.usuario?.id
        });

        await models.Notificacion.create({
            id_usuario_destino: lugar.getDataValue('id_usuario_productor'),
            titulo: 'Solicitud de lugar aprobada',
            mensaje: `Tu lugar de producción "${lugar.getDataValue('nombre_lugar_produccion')}" fue aprobado. Registro ICA: ${numero_registro_ica_oficial}.`,
            tipo: 'success',
            leida: false,
            metadata: {
                id_lugar_produccion: lugar.getDataValue('id_lugar_produccion'),
                estado: 'APROBADO'
            }
        });
        console.log('🔔 Notificación creada (APROBADO) para usuario:', lugar.getDataValue('id_usuario_productor'));

        res.json({
            message: 'Lugar de producción aprobado con éxito. Se ha emitido el Registro oficial del ICA y asignado el asistente técnico.',
            registro_oficial: numero_registro_ica_oficial
        });
    } catch (error) {
        console.error('❌ Error al aprobar lugar de producción:', error);
        res.status(500).json({ message: 'Error interno al procesar el cambio de estado a Aprobado.' });
    }
};

// ─── 5. ENDPOINT PARA RECHAZAR SOLICITUD (PATCH) ─────────────────────────────
export const rechazarLugarProduccion = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { observaciones } = req.body;

        if (!observaciones || observaciones.trim() === '') {
            res.status(400).json({ message: 'Es obligatorio ingresar una justificación técnica para rechazar la solicitud.' });
            return;
        }

        const lugar = await models.LugarProduccion.findByPk(id);
        if (!lugar) {
            res.status(404).json({ message: 'El lugar de producción solicitado no existe.' });
            return;
        }

        await lugar.update({
            estado: 'RECHAZADO',
            observaciones_administrador: observaciones.trim(),
            id_admin_aprobador: req.usuario?.id
        });

        await models.Notificacion.create({
            id_usuario_destino: lugar.getDataValue('id_usuario_productor'),
            titulo: 'Solicitud de lugar rechazada',
            mensaje: `Tu lugar de producción "${lugar.getDataValue('nombre_lugar_produccion')}" fue rechazado. Observación: ${observaciones.trim()}`,
            tipo: 'error',
            leida: false,
            metadata: {
                id_lugar_produccion: lugar.getDataValue('id_lugar_produccion'),
                estado: 'RECHAZADO'
            }
        });
        console.log('🔔 Notificación creada (RECHAZADO) para usuario:', lugar.getDataValue('id_usuario_productor'));

        res.json({ message: 'La solicitud ha sido rechazada formalmente con las observaciones adjuntas.' });
    } catch (error) {
        console.error('❌ Error al rechazar lugar de producción:', error);
        res.status(500).json({ message: 'Error interno al procesar el rechazo de la solicitud.' });
    }
};
