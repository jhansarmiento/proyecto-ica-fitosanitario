// backend/src/controllers/solicitud.controller.ts
import { Request, Response } from 'express';
import catalogModels from '../catalogIndex';
import models from '../index'; 

export const createSolicitudInspeccion = async (req: Request, res: Response): Promise<void> => {
    try {
        const id_lugar_produccion = req.params.id; // Lo sacamos de la URL
        const payload = req.body;

        // 1. Verificamos que el lugar exista
        const lugar = await models.LugarProduccion.findByPk(id_lugar_produccion);
        if (!lugar) {
            res.status(404).json({ message: 'Lugar de producción no encontrado.' });
            return;
        }

        // 2. Insertamos la solicitud
        const nuevaSolicitud = await models.SolicitudInspeccion.create({
            fecha_tentativa_productor: payload.fecha_tentativa_productor,
            observaciones: payload.observaciones || null,
            id_lugar_produccion: id_lugar_produccion,
            estado: 'SOLICITADA' 
        });

        res.status(201).json({ message: 'Solicitud radicada con éxito', data: nuevaSolicitud });
    } catch (error) {
        console.error('❌ Error creando solicitud de inspección:', error);
        res.status(500).json({ message: 'Error interno radicando la solicitud.' });
    }
};

export const getSolicitudes = async (req: any, res: Response): Promise<void> => {
    try {
        const id_usuario = req.usuario.id;
        const rol = req.usuario.rol?.toLowerCase();

        let whereLugar: any = {};
        if (rol === 'productor') {
            whereLugar.id_usuario_productor = id_usuario;
        } else if (rol.includes('asistente')) {
            whereLugar.id_asistente_asignado = id_usuario;
        }

        // 🌟 2. CONSULTA OPERACIONAL (Transaccional pura)
        const solicitudes = await models.SolicitudInspeccion.findAll({
            include: [{
                association: 'lugarProduccion',
                where: whereLugar,
                include: [
                    { association: 'asistenteAsignado', attributes: ['nombre', 'apellidos'] },
                    { association: 'predio' }
                ]
            }],
            order: [['fecha_creacion', 'DESC']]
        });

        // 🌟 3. RECOLECCIÓN DE IDs (Lotes y Geografía)
        const prediosIds = new Set<string>();
        const veredaIds = new Set<string>();

        solicitudes.forEach((s: any) => {
            const predios = s.lugarProduccion?.predio || [];
            predios.forEach((p: any) => {
                prediosIds.add(p.id_predio);
                if (p.id_vereda) veredaIds.add(p.id_vereda);
            });
        });

        // Buscamos los lotes físicos de esos predios
        let lotes: any[] = [];
        if (prediosIds.size > 0) {
            lotes = await models.Lote.findAll({ where: { id_predio: Array.from(prediosIds) }});
        }

        // 🌟 4. CONSULTA AL CATÁLOGO GEOGRÁFICO (Mapeo Completo)
        let geoMap = new Map<string, any>();
        if (veredaIds.size > 0) {
            const veredasCatalogo = await catalogModels.Vereda.findAll({
                where: { id_vereda: Array.from(veredaIds) },
                include: [
                    {
                        model: catalogModels.Municipio,
                        as: 'municipio',
                        include: [{ model: catalogModels.Departamento, as: 'departamento' }]
                    }
                ]
            });
            geoMap = new Map<string, any>(
                veredasCatalogo.map((v: any) => [String(v.id_vereda), v])
            );
        }

        // 🌟 5. CONSULTA AL CATÁLOGO AGRÍCOLA
        const variedadesCat = await catalogModels.VariedadEspecie.findAll();
        const especiesCat = await catalogModels.EspecieVegetal.findAll();

        // 🌟 6. ENSAMBLAJE FINAL (Cruce de datos en memoria)
        const data = solicitudes.map((s: any) => {
            const json = s.toJSON();
            const lugar = json.lugarProduccion;
            const asistente = lugar?.asistenteAsignado;
            
            // --- A. CRUZAR CULTIVOS ---
            const idsPrediosDeEsteLugar = lugar?.predio?.map((p: any) => p.id_predio) || [];
            const lotesDelLugar = lotes.filter((l: any) => idsPrediosDeEsteLugar.includes(l.id_predio));
            
            const idsVariedades = [...new Set(lotesDelLugar.map((l:any) => l.id_variedad_especie).filter(Boolean))];
            const cultivosCultivados = idsVariedades.map(idVar => {
                const variedad = variedadesCat.find((v:any) => String(v.id_variedad_especie) === String(idVar) || String(v.id) === String(idVar));
                const especie = variedad ? especiesCat.find((e:any) => String(e.id_especie_vegetal) === String(variedad.id_especie_vegetal)) : null;
                return `${especie ? especie.nombre_comun : 'Especie'} (${variedad ? variedad.nombre_variedad : 'Variedad'})`;
            }).join(', ');

            // --- B. CRUZAR GEOGRAFÍA ---
            const predioPrincipal = lugar?.predio?.[0];
            let txtMunicipio = 'N/D';
            let txtVereda = 'N/D';

            if (predioPrincipal && predioPrincipal.id_vereda) {
                const infoGeo = geoMap.get(String(predioPrincipal.id_vereda));
                txtVereda = infoGeo?.nombre || predioPrincipal.vereda || 'N/D';
                txtMunicipio = infoGeo?.municipio?.nombre || predioPrincipal.municipio || 'N/D';
            }

            return {
                id_solicitud: json.id_solicitud_inspeccion,
                fecha_creacion: json.fecha_creacion,
                fecha_tentativa: json.fecha_tentativa_productor,
                fecha_programada: json.fecha_programada_tecnico,
                estado: json.estado,
                observaciones: json.observaciones, 
                observaciones_tecnico: json.observaciones_tecnico, 
                
                lugar_nombre: lugar?.nombre_lugar_produccion || 'N/D',
                lugar_ubicacion: `${txtMunicipio} - Vda. ${txtVereda}`, 
                
                asistente_nombre: asistente ? `${asistente.nombre} ${asistente.apellidos}` : 'Pendiente',
                cantidad_lotes: lotesDelLugar.length,
                cultivos: cultivosCultivados || 'Ninguno registrado'
            };
        });

        res.status(200).json({ data });
    } catch (error) {
        console.error('❌ Error listando solicitudes:', error);
        res.status(500).json({ message: 'Error interno al cargar las solicitudes.' });
    }
};

export const gestionarSolicitud = async (req: any, res: Response): Promise<void> => {
    try {
        const id_solicitud = req.params.id;
        const { fecha_programada_tecnico, observaciones_tecnico, estado } = req.body;

        const solicitud = await models.SolicitudInspeccion.findByPk(id_solicitud);
        if (!solicitud) {
            res.status(404).json({ message: 'Solicitud no encontrada.' });
            return;
        }

        // 💡 REGLA DE NEGOCIO: Si rechaza, DEBE dejar comentarios
        if (estado === 'RECHAZADA' && (!observaciones_tecnico || observaciones_tecnico.trim() === '')) {
            res.status(400).json({ message: 'Es obligatorio justificar el rechazo en los comentarios.' });
            return;
        }

        await solicitud.update({
            // Si rechaza, limpiamos la fecha de programación
            fecha_programada_tecnico: estado === 'PROGRAMADA' ? fecha_programada_tecnico : null,
            observaciones_tecnico,
            estado 
        });

        res.status(200).json({ message: `Solicitud ${estado.toLowerCase()} con éxito.`, data: solicitud });
    } catch (error) {
        console.error('❌ Error gestionando solicitud:', error);
        res.status(500).json({ message: 'Error interno al gestionar la inspección.' });
    }
};

export const getDatosInicioInspeccion = async (req: any, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        // 1. Buscamos la solicitud con todos sus datos
        const solicitud = await models.SolicitudInspeccion.findByPk(id, {
            include: [{
                association: 'lugarProduccion',
                include: [
                    { association: 'predio' },
                    { model: models.Usuario, as: 'productor', attributes: ['nombre', 'apellidos', 'telefono'] }
                ]
            }]
        });

        if (!solicitud) {
            res.status(404).json({ message: 'Solicitud no encontrada.' });
            return;
        }

        const lugar = solicitud.lugarProduccion;
        const predioPrincipal = lugar?.predio?.[0] || {};
        const productor = lugar?.productor;

        // 2. Traemos Lotes y Catálogos
        const prediosIds = lugar?.predio?.map((p: any) => p.id_predio) || [];
        const lotesFisicos = prediosIds.length > 0 ? await models.Lote.findAll({ where: { id_predio: prediosIds } }) : [];

        const variedades = models.VariedadEspecie ? await models.VariedadEspecie.findAll() : await catalogModels.VariedadEspecie.findAll().catch(()=>[]);
        const especies = models.EspecieVegetal ? await models.EspecieVegetal.findAll() : await catalogModels.EspecieVegetal.findAll().catch(()=>[]);
        const plagasCat = catalogModels.Plaga ? await catalogModels.Plaga.findAll().catch(()=>[]) : [];

        // 3. MAPEO PARA EL FRONTEND
        const lotes = lotesFisicos.map((l: any) => {
            const varObj = variedades.find((v:any) => String(v.id_variedad_especie) === String(l.id_variedad_especie));
            const espObj = varObj ? especies.find((e:any) => String(e.id_especie_vegetal) === String(varObj.id_especie_vegetal)) : null;

            return {
                id: l.id_lote, 
                numero: l.numero_lote, // 🌟 Pasamos el número de lote
                cultivo: espObj ? espObj.nombre_comun : 'Cultivo',
                nombreCientifico: espObj ? (espObj.nombre_cientifico || 'N/A') : 'N/A',
                id_especie_vegetal: espObj ? espObj.id_especie_vegetal : null, // 🌟 Para filtrar plagas
                // 🌟 Formateamos la fecha quitando la hora
                fechaSiembra: l.fecha_siembra ? new Date(l.fecha_siembra).toISOString().split('T')[0] : 'N/D',
                plantas: l.cantidad_plantas || 0,
                areaHa: l.area_total,
                estado: 'Pendiente',
                imagen: 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&w=600&q=80'
            };
        });

        const plagas = plagasCat.map((p: any) => ({
            id: p.id_plaga || p.id,
            nombre: p.nombre_comun || p.nombre,
            nombreCientifico: p.nombre_cientifico || 'N/A',
            id_especie_vegetal: p.id_especie_vegetal || null, // 🌟 Para que el front sepa a qué planta ataca
            imagen: 'https://images.unsplash.com/photo-1595152772835-219674b2a8a6?auto=format&fit=crop&w=600&q=80'
        }));

        res.status(200).json({
            data: {
                // 🌟 INFORMACIÓN GENERAL REAL
                generalInfo: {
                    registroIca: lugar?.numero_registro_ica || 'En trámite',
                    coordenadas: `${predioPrincipal.latitud || 'N/D'}, ${predioPrincipal.longitud || 'N/D'}`,
                    fechaInspeccion: new Date().toISOString().split('T')[0],
                    vereda: predioPrincipal.vereda || 'N/D',
                    municipio: predioPrincipal.municipio || 'N/D',
                    productorNombre: productor ? `${productor.nombre} ${productor.apellidos}` : 'N/D',
                    productorTelefono: productor?.telefono || 'N/D',
                    nombreLugar: lugar?.nombre_lugar_produccion || 'Lugar de Producción'
                },
                lotes,
                plagas
            }
        });
    } catch (error) {
        console.error('❌ Error al preparar inspección:', error);
        res.status(500).json({ message: 'Error interno al cargar los datos de inspección.' });
    }
};