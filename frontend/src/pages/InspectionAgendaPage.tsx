import { useMemo, useState } from 'react';
import { CalendarDays, Clock3, Filter, MapPin, Search, Sprout } from 'lucide-react';
import DashboardLayout, { type DashboardViewKey } from '../components/layout/DashboardLayout';
import type { SessionUser } from '../App';

type InspectionStatus = 'Pendiente' | 'En Progreso' | 'Ejecutada';

type InspectionAgendaItem = {
  id: string;
  predioNombre: string;
  codigoDaneIca: string;
  fechaProgramada: string;
  horaProgramada: string;
  ubicacion: string;
  cantidadLotes: number;
  estado: InspectionStatus;
};

type InspectionAgendaPageProps = {
  sessionUser?: SessionUser;
  onGoHome?: () => void;
  onGoUsers?: () => void;
  onGoRoles?: () => void;
  onGoAgricultural?: () => void;
  onGoApprovalPlaces?: () => void;
  onGoInspectionHistory?: () => void;
  onStartInspectionProcess?: () => void;
  onLogout?: () => void;
};

const agendaSeed: InspectionAgendaItem[] = [
  {
    id: 'AG-001',
    predioNombre: 'Zona Productiva Norte',
    codigoDaneIca: 'ICA-68001-2391',
    fechaProgramada: '2026-05-20',
    horaProgramada: '08:30',
    ubicacion: 'Girón, Santander',
    cantidadLotes: 3,
    estado: 'Pendiente',
  },
  {
    id: 'AG-002',
    predioNombre: 'Finca El Porvenir',
    codigoDaneIca: 'ICA-68077-1022',
    fechaProgramada: '2026-05-20',
    horaProgramada: '10:00',
    ubicacion: 'Bucaramanga',
    cantidadLotes: 6,
    estado: 'En Progreso',
  },
  {
    id: 'AG-003',
    predioNombre: 'Hacienda La Aurora',
    codigoDaneIca: 'ICA-68167-8821',
    fechaProgramada: '2026-05-21',
    horaProgramada: '07:45',
    ubicacion: 'Piedecuesta',
    cantidadLotes: 4,
    estado: 'Pendiente',
  },
  {
    id: 'AG-004',
    predioNombre: 'Lote Altos del Río',
    codigoDaneIca: 'ICA-68001-7712',
    fechaProgramada: '2026-05-19',
    horaProgramada: '15:20',
    ubicacion: 'Floridablanca',
    cantidadLotes: 2,
    estado: 'Ejecutada',
  },
];

const statusClasses: Record<InspectionStatus, string> = {
  Pendiente: 'bg-amber-100 text-amber-700',
  'En Progreso': 'bg-blue-100 text-blue-700',
  Ejecutada: 'bg-emerald-100 text-emerald-700',
};

export default function InspectionAgendaPage({
  sessionUser,
  onGoHome,
  onGoUsers,
  onGoRoles,
  onGoAgricultural,
  onGoApprovalPlaces,
  onGoInspectionHistory,
  onStartInspectionProcess,
  onLogout,
}: InspectionAgendaPageProps) {
  const [statusFilter, setStatusFilter] = useState<'Todos' | InspectionStatus>('Todos');
  const [dateFilter, setDateFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');

  const filteredAgenda = useMemo(() => {
    return agendaSeed.filter((item) => {
      const byStatus = statusFilter === 'Todos' ? true : item.estado === statusFilter;
      const byDate = dateFilter ? item.fechaProgramada === dateFilter : true;
      const query = locationFilter.toLowerCase().trim();
      const byLocation = query
        ? item.ubicacion.toLowerCase().includes(query) || item.predioNombre.toLowerCase().includes(query)
        : true;
      return byStatus && byDate && byLocation;
    });
  }, [statusFilter, dateFilter, locationFilter]);

  const handleNavigate = (view: DashboardViewKey) => {
    if (view === 'home') onGoHome?.();
    if (view === 'users') onGoUsers?.();
    if (view === 'roles') onGoRoles?.();
    if (view === 'agricultural') onGoAgricultural?.();
    if (view === 'approval-places') onGoApprovalPlaces?.();
    if (view === 'inspections-history') onGoInspectionHistory?.();
  };

  return (
    <DashboardLayout
      title="Agenda de Inspecciones Fitosanitarias"
      subtitle="Visualiza y gestiona rápidamente inspecciones programadas"
      sessionUser={sessionUser}
      activeView="inspections-agenda"
      onNavigate={handleNavigate}
      onLogout={onLogout}
    >
      <section className="space-y-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="grid gap-3 md:grid-cols-4">
            <div className="relative md:col-span-2">
              <Search className="pointer-events-none absolute left-3 top-2.5 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Buscar lugar de producción..."
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                className="w-full rounded-xl border border-slate-300 py-2 pl-10 pr-3 text-sm outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'Todos' | InspectionStatus)}
              className="rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
            >
              <option value="Todos">Estado: Todos</option>
              <option value="Pendiente">Pendiente</option>
              <option value="En Progreso">En Progreso</option>
              <option value="Ejecutada">Ejecutada</option>
            </select>

            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
            />
          </div>
        </div>

        <section className="space-y-3">
          {filteredAgenda.map((item) => (
            <article key={item.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusClasses[item.estado]}`}>{item.estado}</span>
                  <h3 className="mt-2 text-xl font-bold text-slate-900">{item.predioNombre}</h3>
                  <p className="text-sm text-slate-500">Código DANE/ICA: {item.codigoDaneIca}</p>
                </div>

                <button
                  type="button"
                  onClick={onStartInspectionProcess}
                  className="inline-flex items-center justify-center rounded-xl bg-emerald-800 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-900"
                >
                  Iniciar Inspección
                </button>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <div className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2">
                  <CalendarDays size={16} className="text-blue-700" />
                  <div>
                    <p className="text-[11px] uppercase text-slate-500">Fecha</p>
                    <p className="text-sm font-semibold text-slate-800">{item.fechaProgramada}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2">
                  <Clock3 size={16} className="text-amber-700" />
                  <div>
                    <p className="text-[11px] uppercase text-slate-500">Hora</p>
                    <p className="text-sm font-semibold text-slate-800">{item.horaProgramada}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2">
                  <MapPin size={16} className="text-rose-700" />
                  <div>
                    <p className="text-[11px] uppercase text-slate-500">Ubicación</p>
                    <p className="text-sm font-semibold text-slate-800">{item.ubicacion}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2">
                  <Sprout size={16} className="text-emerald-700" />
                  <div>
                    <p className="text-[11px] uppercase text-slate-500">Cantidad lotes</p>
                    <p className="text-sm font-semibold text-slate-800">{item.cantidadLotes} Lotes</p>
                  </div>
                </div>
              </div>
            </article>
          ))}

          {filteredAgenda.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
              <Filter className="mx-auto text-slate-400" size={22} />
              <p className="mt-2 text-sm font-semibold text-slate-700">No hay inspecciones con los filtros actuales.</p>
            </div>
          ) : null}
        </section>

      </section>
    </DashboardLayout>
  );
}
