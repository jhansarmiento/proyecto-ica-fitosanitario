/**
 * @fileoverview View Model para sitios de producción (lugares de producción).
 *
 * Este módulo transforma datos de entidades de base de datos (LugarProduccion, Predio, Lote)
 * en una estructura de vista optimizada (ProductionSiteVM) para ser consumida por componentes
 * de UI y páginas del frontend.
 *
 * **Propósito:**
 * - Normalizar y agregar datos de múltiples entidades en una sola estructura de vista
 * - Calcular métricas derivadas (área total, conteos de predios/lotes/especies)
 * - Proporcionar un contrato de datos consistente para la capa de presentación
 *
 * **Flujo:**
 * 1. Se reciben datos de múltiples fuentes (lugar, predios, lotes, especies)
 * 2. Se procesan y agregan (suma de áreas, conteos)
 * 3. Se retorna una estructura única y plana para la UI
 *
 * @author Sistema de Gestión Fitosanitaria
 */

import type { LugarProduccion } from '../lugar-produccion.model';
import type { Predio } from '../predio.model';
import type { Lote } from '../lote.model';

/**
 * Estructura de vista para un sitio de producción.
 *
 * Representa la información consolidada de un lugar de producción con todos sus predios,
 * lotes y especies autorizadas, optimizada para presentación en UI.
 *
 * @typedef {Object} ProductionSiteVM
 * @property {string} id - Identificador único del lugar de producción
 * @property {string} nombreLugarProduccion - Nombre descriptivo del lugar (ej: "Finca Los Andes")
 * @property {string} numeroRegistroIca - Número de registro ICA oficial del sitio
 * @property {string} estado - Estado actual del lugar ('Activo' | 'Inactivo' | 'Suspendido')
 * @property {string} municipio - Municipio donde se ubica el lugar (derivado del primer predio)
 * @property {string} departamento - Departamento donde se ubica el lugar (derivado del primer predio)
 * @property {number} prediosAsociados - Cantidad total de predios vinculados al lugar
 * @property {number} especiesAutorizadas - Cantidad de especies vegetales autorizadas
 * @property {number} lotesActivos - Cantidad total de lotes productivos activos
 * @property {number} areaTotal - Suma del área total de todos los predios (hectáreas)
 */
export type ProductionSiteVM = {
  id: string;
  nombreLugarProduccion: string;
  numeroRegistroIca: string;
  estado: LugarProduccion['estado'];
  municipio: string;
  departamento: string;
  prediosAsociados: number;
  especiesAutorizadas: number;
  lotesActivos: number;
  areaTotal: number;
};

/**
 * Datos de entrada requeridos para construir un ProductionSiteVM.
 *
 * @typedef {Object} BuildProductionSiteVMInput
 * @property {LugarProduccion} lugar - Entidad del lugar de producción desde la base de datos
 * @property {Predio[]} predios - Array de predios asociados al lugar
 * @property {Lote[]} lotes - Array de lotes productivos del lugar
 * @property {number} especiesAutorizadas - Conteo de especies autorizadas para el lugar
 */
type BuildProductionSiteVMInput = {
  lugar: LugarProduccion;
  predios: Predio[];
  lotes: Lote[];
  especiesAutorizadas: number;
};

/**
 * Construye un objeto ProductionSiteVM a partir de datos de múltiples entidades.
 *
 * **Lógica de transformación:**
 * - Extrae datos base del lugar de producción (id, nombre, registro ICA, estado)
 * - Obtiene ubicación (municipio, departamento) del primer predio asociado
 * - Calcula área total sumando el área de todos los predios
 * - Cuenta predios y lotes activos
 * - Incluye cantidad de especies autorizadas
 *
 * **Casos especiales:**
 * - Si no hay predios: municipio y departamento se establecen en 'N/A'
 * - El área total es 0 si no hay predios con área definida
 *
 * @param {BuildProductionSiteVMInput} input - Datos de entrada para la construcción
 * @returns {ProductionSiteVM} Objeto de vista optimizado para presentación en UI
 *
 * @example
 * const vm = buildProductionSiteVM({
 *   lugar: lugarData,
 *   predios: [predio1, predio2],
 *   lotes: [lote1, lote2, lote3],
 *   especiesAutorizadas: 5
 * });
 * // vm.prediosAsociados === 2
 * // vm.lotesActivos === 3
 * // vm.especiesAutorizadas === 5
 * // vm.areaTotal === suma de predio1.areaTotal + predio2.areaTotal
 */
export function buildProductionSiteVM(input: BuildProductionSiteVMInput): ProductionSiteVM {
  const { lugar, predios, lotes, especiesAutorizadas } = input;

  // Calcula el área total sumando la propiedad areaTotal de cada predio
  const areaTotal = predios.reduce((acc, predio) => acc + predio.areaTotal, 0);

  return {
    id: lugar.id,
    nombreLugarProduccion: lugar.nombreLugarProduccion,
    numeroRegistroIca: lugar.numeroRegistroIca,
    estado: lugar.estado,
    municipio: predios[0]?.municipio ?? 'N/A', // Usa ubicación del primer predio
    departamento: predios[0]?.departamento ?? 'N/A', // Usa ubicación del primer predio
    prediosAsociados: predios.length,
    especiesAutorizadas,
    lotesActivos: lotes.length,
    areaTotal,
  };
}
