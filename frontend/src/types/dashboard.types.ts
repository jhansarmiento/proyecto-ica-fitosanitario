// src/types/dashboard.types.ts
import type { ReactNode } from 'react';
import type { SessionUser } from './auth.types';

export type NotificationItem = {
  id: string;
  tipo: 'urgent' | 'info';
  mensaje: string;
  horaRelativa: string;
};

export type DashboardViewKey =
  | 'home'
  | 'users'
  | 'roles'
  | 'agricultural'
  | 'catalog'
  | 'approval-places'
  | 'inspections-agenda'
  | 'inspections-history'
  | 'reports';

  export interface DashboardLayoutProps {
  title: string;
  subtitle?: string;
  sessionUser?: SessionUser;
  activeView: DashboardViewKey;
  breadcrumbs?: string[];
  onNavigate?: (view: DashboardViewKey) => void;
  onLogout?: () => void;
  children: ReactNode;
}

export interface NavigationItem {
  key: DashboardViewKey;
  label: string;
  icon: string; // O el componente de icono que utilicen
  rolesPermitidos: string[];
}

export type RequestStatus = 'Pendiente' | 'En revisión' | 'Aprobado' | 'Rechazado';

export type ProductionApprovalItem = {
  id: string;
  nombreLugarProduccion: string;
  productor: string;
  identificacionProductor: string;
  telefonoProductor: string;
  fechaSolicitud: string;
  estado: Exclude<RequestStatus, 'En revisión'>;
  departamento: string;
  areaTotal: number;
  numeroICA: string;
  observaciones?: string;
  especies: string[];
  variedades?: string[];
  lotes?: string[];

  // Estructura tipada para los predios vinculados
  predios: {
    id: string;
    nombre: string;
    codigo: string;
    vereda: string;
    municipio: string;
    departamento: string;
    area: number;
  }[];
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
