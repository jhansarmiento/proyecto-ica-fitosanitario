export type RequestStatus = 'Pendiente' | 'En revisión' | 'Aprobado' | 'Rechazado';

export type ProductionApprovalItem = {
  id: string;
  nombreLugarProduccion: string;
  productor: string;
  fechaSolicitud: string;
  estado: Exclude<RequestStatus, 'En revisión'>;
  municipio: string;
  areaTotal: number;
  numeroICA: string;
  observaciones?: string;
  especies: string[];
  variedades: string[];
  lotes: string[];
};

export type ProducerPlaceItem = {
  id: string;
  nombreLugarProduccion: string;
  estado: RequestStatus;
  fechaSolicitud: string;
  numeroICA: string;
  observacionesAdministrador?: string;
  timeline: {
    etapa: string;
    fecha: string;
    completado: boolean;
  }[];
};

export type CatalogSpecies = {
  id: string;
  nombreEspecie: string;
  nombreComun: string;
  cicloCultivo: string;
  imagenUrl: string;
};

export type CatalogVariety = {
  id: string;
  nombreVariedad: string;
  especieAsociada: string;
};

export type CatalogPlague = {
  id: string;
  nombrePlaga: string;
  especiesAfectadas: string[];
  imagenUrl: string;
};
