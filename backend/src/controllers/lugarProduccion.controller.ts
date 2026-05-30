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
        // 1. Traemos los lugares del productor con sus relaciones crudas de la BD Operacional
        const lugares = await models.LugarProduccion.findAll({
            where: { id_usuario_productor },
            include: [
                { association: 'predio' }, // Trae los predios vinculados
                { association: 'autorizacionEspecie' }, // Trae las especies lógicas autorizadas
                { 
                    model: models.Usuario, 
                    as: 'asistenteAsignado', 
                    attributes: ['nombre', 'apellidos'] 
                }
            ],
            order: [['fecha_solicitud', 'DESC']]
        });

        // 2. Recolectamos todos los id_vereda para buscar sus nombres en el Catálogo
        const veredaIds: string[] = [];
        lugares.forEach((l: any) => {
            if (l.predio) {
                l.predio.forEach((p: any) => {
                    if (p.id_vereda) veredaIds.push(p.id_vereda);
                });
            }
        });
        const uniqueVeredaIds = [...new Set(veredaIds)];
        
        // 3. Consulta al Catálogo Geográfico (Mapeo Completo)
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
            geoMap = new Map<string, any>(
                veredasCatalogo.map((v: any) => [v.id_vereda, v])
            );
        }

        // 4. Estampamos las cadenas de texto geográficas en cada predio del objeto
        const lugaresEnriquecidos = lugares.map((l: any) => {
            const lugarJson = l.toJSON();

            // Formateamos el nombre del asistente real
            const nombreAsistente = lugarJson.asistenteAsignado
                ? `${lugarJson.asistenteAsignado.nombre} ${lugarJson.asistenteAsignado.apellidos}`
                : 'Pendiente de asignación';
        

            if (lugarJson.predio) {
                lugarJson.predio = lugarJson.predio.map((p: any) => {
                    const infoGeo = geoMap.get(p.id_vereda);
                    return {
                        ...p,
                        // 💡 CORRECCIÓN: Si el catálogo falla, usamos el dato guardado en texto plano (si existe)
                        vereda: infoGeo?.nombre || p.vereda || 'N/D',
                        municipio: infoGeo?.municipio?.nombre || p.municipio || 'N/D',
                        departamento: infoGeo?.municipio?.departamento?.nombre || p.departamento || 'N/D'
                    };
                });
            }
            
            return {
                ...lugarJson,
                nombre_asistente_real: nombreAsistente // Mandamos el string listo al frontend
            };
        });

        res.json({ data: lugaresEnriquecidos });
    } catch (error) {
        console.error('❌ Error al listar lugares de producción:', error);
        res.status(500).json({ message: 'Error interno al cargar tus lugares de producción.' });
    }
};

// ─── 3. ENDPOINT PARA LISTAR SOLICITUDES PARA EL ICA (GET) ──────────────────────
export const obtenerSolicitudesPendientesICA = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        // 🌟 1. Buscamos TODAS las solicitudes (Quitamos el where: 'PENDIENTE' para que sirvan los filtros del admin)
        const solicitudes = await models.LugarProduccion.findAll({
            include: [
                {
                    model: models.Usuario,
                    as: 'productor',
                    attributes: ['nombre', 'apellidos', 'numero_identificacion', 'correo_electronico', 'telefono']
                },
                {
                    association: 'predio' // Trae los terrenos amarrados
                },
                {
                    association: 'autorizacionEspecie' // 🌟 NUEVO: Trae las especies vinculadas a la solicitud
                }
            ],
            order: [['fecha_solicitud', 'DESC']]
        });

        // 2. Extraer todos los IDs únicos para hacer una sola consulta a los catálogos
        const allVeredaIds: string[] = [];
        const allEspecieIds: string[] = [];

        solicitudes.forEach((sol: any) => {
            if (sol.predio) {
                sol.predio.forEach((p: any) => {
                    if (p.id_vereda) allVeredaIds.push(p.id_vereda);
                });
            }
            if (sol.autorizacionEspecie) {
                sol.autorizacionEspecie.forEach((e: any) => {
                    if (e.id_especie_vegetal) allEspecieIds.push(e.id_especie_vegetal);
                });
            }
        });
        
        const uniqueVeredaIds = [...new Set(allVeredaIds)];
        const uniqueEspecieIds = [...new Set(allEspecieIds)];

        // 3. Consultar Catálogos en paralelo
        const [veredasCatalogo, especiesCatalogo] = await Promise.all([
            catalogmodels.Vereda.findAll({
                where: { id_vereda: uniqueVeredaIds },
                include: [
                    {
                        model: catalogmodels.Municipio,
                        as: 'municipio',
                        include: [{ model: catalogmodels.Departamento, as: 'departamento' }]
                    }
                ]
            }),
            catalogmodels.EspecieVegetal.findAll({
                where: { id_especie_vegetal: uniqueEspecieIds }
            })
        ]);

        // Mapeamos los datos en mapas para búsqueda ultra rápida
        const geoMap = new Map<string, any>(veredasCatalogo.map((v: any) => [String(v.id_vereda), v]));
        const especiesMap = new Map<string, string>(especiesCatalogo.map((e: any) => [String(e.id_especie_vegetal), e.nombre_comun]));

        // 4. Inyectar nombres reales geográficos y vegetales
        const solicitudesEnriquecidas = solicitudes.map((sol: any) => {
            const solJson = sol.toJSON();
            
            if (solJson.predio) {
                solJson.predio = solJson.predio.map((p: any) => {
                    const infoGeo = geoMap.get(String(p.id_vereda));
                    return {
                        ...p,
                        vereda: infoGeo?.nombre || 'N/D',
                        municipio: infoGeo?.municipio?.nombre || 'N/D',
                        departamento: infoGeo?.municipio?.departamento?.nombre || 'N/D'
                    };
                });
            }
            
            // 🌟 NUEVO: Mapeo de especies
            if (solJson.autorizacionEspecie) {
                solJson.especies_nombres = solJson.autorizacionEspecie.map((e: any) => 
                    especiesMap.get(String(e.id_especie_vegetal)) || 'Especie N/D'
                );
            } else {
                solJson.especies_nombres = [];
            }
            
            return solJson;
        });

        // Retornamos la respuesta al frontend
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

        // Regla de negocio: Validar parámetros obligatorios, se debe asignar un asistente técnico para aprobar
        if (!id_asistente_asignado) {
            res.status(400).json({ message: 'Criterio ICA rechazado: Es obligatorio asignar un asistente técnico calificado para aprobar el lugar.' });
            return;
        }

        const lugar = await models.LugarProduccion.findByPk(id);
        if (!lugar) {
            res.status(404).json({ message: 'El lugar de producción solicitado no existe.' });
            return;
        }

        // Actualización física del estado del trámite
        await lugar.update({
            estado: 'APROBADO',
            numero_registro_ica: numero_registro_ica_oficial,
            id_asistente_asignado: id_asistente_asignado,
            fecha_aprobacion: new Date(),
            id_admin_aprobador: req.usuario?.id // Auditoría de quién aprobó
        });

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

        res.json({ message: 'La solicitud ha sido rechazada formalmente con las observaciones adjuntas.' });
    } catch (error) {
        console.error('❌ Error al rechazar lugar de producción:', error);
        res.status(500).json({ message: 'Error interno al procesar el rechazo de la solicitud.' });
    }
};