import type {
  CatalogPlague,
  CatalogSpecies,
  CatalogVariety,
  ProducerPlaceItem,
  ProductionApprovalItem,
} from '../types/dashboard.types';

export const approvalRequestsSeed: ProductionApprovalItem[] = [
  {
    id: 'apr-001',
    nombreLugarProduccion: 'Lugar Productivo Norte',
    productor: 'Carlos Ramírez',
    fechaSolicitud: '2026-01-10',
    estado: 'Pendiente',
    municipio: 'Rionegro',
    areaTotal: 24.5,
    numeroICA: 'ICA-2026-1001',
    observaciones: '',
    especies: ['Aguacate', 'Tomate'],
    variedades: ['Hass', 'Chonto'],
    lotes: ['LT-01', 'LT-02', 'LT-03'],
  },
  {
    id: 'apr-002',
    nombreLugarProduccion: 'Finca El Mirador',
    productor: 'Laura Sánchez',
    fechaSolicitud: '2026-01-08',
    estado: 'Aprobado',
    municipio: 'La Ceja',
    areaTotal: 18.2,
    numeroICA: 'ICA-2026-0962',
    observaciones: 'Documentación completa y validada.',
    especies: ['Fresa'],
    variedades: ['Albión'],
    lotes: ['LT-21', 'LT-22'],
  },
  {
    id: 'apr-003',
    nombreLugarProduccion: 'Hacienda Campo Verde',
    productor: 'Andrés Pérez',
    fechaSolicitud: '2026-01-06',
    estado: 'Rechazado',
    municipio: 'Marinilla',
    areaTotal: 31.7,
    numeroICA: 'ICA-2026-0914',
    observaciones: 'Falta evidencia fotográfica de lotes y trazabilidad.',
    especies: ['Papa'],
    variedades: ['Parda Pastusa'],
    lotes: ['LT-31', 'LT-32', 'LT-33', 'LT-34'],
  },
];

export const producerPlacesSeed: ProducerPlaceItem[] = [
  {
    id: 'prod-001',
    nombreLugarProduccion: 'Lugar Productivo Norte',
    estado: 'En revisión',
    fechaSolicitud: '2026-01-10',
    numeroICA: 'ICA-2026-1001',
    observacionesAdministrador: 'En validación documental por asistente técnico.',
    timeline: [
      { etapa: 'Solicitud enviada', fecha: '2026-01-10', completado: true },
      { etapa: 'Revisión técnica', fecha: '2026-01-12', completado: true },
      { etapa: 'Decisión ICA', fecha: 'Pendiente', completado: false },
    ],
  },
  {
    id: 'prod-002',
    nombreLugarProduccion: 'Finca El Roble',
    estado: 'Rechazado',
    fechaSolicitud: '2026-01-05',
    numeroICA: 'ICA-2026-0871',
    observacionesAdministrador: 'Actualizar número de registro y adjuntar certificación.',
    timeline: [
      { etapa: 'Solicitud enviada', fecha: '2026-01-05', completado: true },
      { etapa: 'Revisión técnica', fecha: '2026-01-07', completado: true },
      { etapa: 'Decisión ICA', fecha: '2026-01-08', completado: true },
    ],
  },
  {
    id: 'prod-003',
    nombreLugarProduccion: 'Predio Santa Rita',
    estado: 'Aprobado',
    fechaSolicitud: '2026-01-02',
    numeroICA: 'ICA-2026-0802',
    observacionesAdministrador: 'Cumple con requisitos fitosanitarios vigentes.',
    timeline: [
      { etapa: 'Solicitud enviada', fecha: '2026-01-02', completado: true },
      { etapa: 'Revisión técnica', fecha: '2026-01-03', completado: true },
      { etapa: 'Decisión ICA', fecha: '2026-01-04', completado: true },
    ],
  },
];

export const catalogSpeciesSeed: CatalogSpecies[] = [
  {
    id: 'esp-001',
    nombreEspecie: 'Persea americana',
    nombreComun: 'Aguacate',
    cicloCultivo: 'Perenne',
    imagenUrl: 'https://images.unsplash.com/photo-1519162808019-7de1683fa2ad?auto=format&fit=crop&w=1200&q=60',
  },
  {
    id: 'esp-002',
    nombreEspecie: 'Solanum lycopersicum',
    nombreComun: 'Tomate',
    cicloCultivo: 'Semestral',
    imagenUrl: 'https://images.unsplash.com/photo-1546094096-0df4bcaaa337?auto=format&fit=crop&w=1200&q=60',
  },
  {
    id: 'esp-003',
    nombreEspecie: 'Fragaria x ananassa',
    nombreComun: 'Fresa',
    cicloCultivo: 'Anual',
    imagenUrl: 'https://images.unsplash.com/photo-1543158181-e6f9f6712055?auto=format&fit=crop&w=1200&q=60',
  },
];

export const catalogVarietiesSeed: CatalogVariety[] = [
  { id: 'var-001', nombreVariedad: 'Hass', especieAsociada: 'Aguacate' },
  { id: 'var-002', nombreVariedad: 'Lorena', especieAsociada: 'Aguacate' },
  { id: 'var-003', nombreVariedad: 'Chonto', especieAsociada: 'Tomate' },
  { id: 'var-004', nombreVariedad: 'Cherry', especieAsociada: 'Tomate' },
  { id: 'var-005', nombreVariedad: 'Albión', especieAsociada: 'Fresa' },
];

export const catalogPlaguesSeed: CatalogPlague[] = [
  {
    id: 'plg-001',
    nombrePlaga: 'Trips',
    especiesAfectadas: ['Tomate', 'Fresa'],
    imagenUrl: 'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?auto=format&fit=crop&w=1200&q=60',
  },
  {
    id: 'plg-002',
    nombrePlaga: 'Mosca blanca',
    especiesAfectadas: ['Tomate', 'Aguacate'],
    imagenUrl: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=1200&q=60',
  },
  {
    id: 'plg-003',
    nombrePlaga: 'Ácaro rojo',
    especiesAfectadas: ['Fresa'],
    imagenUrl: 'https://images.unsplash.com/photo-1472145246862-b24cf25c4a36?auto=format&fit=crop&w=1200&q=60',
  },
];
