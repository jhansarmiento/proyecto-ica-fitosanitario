// predios, lugares de produccion y lotes

// ── PREDIOS ──
export type PredioDTO = {
  id: string;
  numeroPredial: string;
  numeroRegistroICA: string;
  nombrePredio: string;
  direccion: string;
  areaTotal: number;
  idVereda: string;
  idLugarProduccion: string | null;
  idPropietario: string;
  lugarProduccion?: { id: string; nombreLugarProduccion: string } | null;
};

// ── LUGARES DE PRODUCCION ──
export type LugarProduccionDTO = {
  id: string;
  nombreLugarProduccion: string;
  numeroRegistroICA: string;
  estado: string;
  idUsuarioProductor: string;
  productor?: {
    id: string;
    nombre: string;
    apellidos: string;
    ingresoUsuario: string;
  } | null;
  solicitudRegistroLugar?: {
    asistenteAsignado?: {
      id: string;
      nombre: string;
      apellidos: string;
      correoElectronico: string;
      telefono: string;
    } | null;
  } | null;
};

export type LoteDTO = {
  id: string;
  numeroLote: string;
  areaTotal: number;
  fechaSiembra: string;
  fechaCosecha: string;
  idVariedad: string;
  idPredio: string;
  predio?: { id: string; nombrePredio: string; numeroPredial: string } | null;
};
