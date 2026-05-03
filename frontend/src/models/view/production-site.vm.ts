import type { LugarProduccion } from '../lugar-produccion.model';
import type { Predio } from '../predio.model';
import type { Lote } from '../lote.model';

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

type BuildProductionSiteVMInput = {
  lugar: LugarProduccion;
  predios: Predio[];
  lotes: Lote[];
  especiesAutorizadas: number;
};

export function buildProductionSiteVM(input: BuildProductionSiteVMInput): ProductionSiteVM {
  const { lugar, predios, lotes, especiesAutorizadas } = input;

  const areaTotal = predios.reduce((acc, predio) => acc + predio.areaTotal, 0);

  return {
    id: lugar.id,
    nombreLugarProduccion: lugar.nombreLugarProduccion,
    numeroRegistroIca: lugar.numeroRegistroIca,
    estado: lugar.estado,
    municipio: predios[0]?.municipio ?? 'N/A',
    departamento: predios[0]?.departamento ?? 'N/A',
    prediosAsociados: predios.length,
    especiesAutorizadas,
    lotesActivos: lotes.length,
    areaTotal,
  };
}
