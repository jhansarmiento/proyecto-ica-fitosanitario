import KpiCard from '../components/ui/KpiCard';
import PanelCard from '../components/ui/PanelCard';
import DashboardLayout from '../components/layout/DashboardLayout';
import type { SessionUser } from '../App';

type HomePageProps = {
  sessionUser?: SessionUser;
  onGoUsers?: () => void;
  onGoRoles?: () => void;
  onGoAgricultural?: () => void;
  onGoApprovalPlaces?: () => void;
  onGoInspectionsAgenda?: () => void;
  onGoInspectionsHistory?: () => void;
  onLogout?: () => void;
};

function HomePage({
  sessionUser,
  onGoUsers,
  onGoRoles,
  onGoAgricultural,
  onGoApprovalPlaces,
  onGoInspectionsAgenda,
  onGoInspectionsHistory,
  onLogout,
}: HomePageProps) {
  return (
    <DashboardLayout
      title="Inicio"
      sessionUser={sessionUser}
      activeView="home"
      onNavigate={(view) => {
        if (view === 'home') return;
        if (view === 'users') onGoUsers?.();
        if (view === 'roles') onGoRoles?.();
        if (view === 'agricultural') onGoAgricultural?.();
        if (view === 'approval-places') onGoApprovalPlaces?.();
        if (view === 'inspections-agenda') onGoInspectionsAgenda?.();
        if (view === 'inspections-history') onGoInspectionsHistory?.();
      }}
      onLogout={onLogout}
    >
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">Dashboard</h2>
          <p className="text-sm text-slate-600">Resumen de actividades y métricas clave del sistema</p>
        </div>
        <select className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100">
          <option>Escoge Lugar Produccion</option>
        </select>
      </div>

      <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-4">
        <KpiCard title="Total Inspecciones" value="1522" subtitle="Comparado al mes anterior" accent="red" trend="+12%" />
        <KpiCard title="Lotes Activos" value="54" subtitle="En 23 lugares de producción" accent="green" trend="+3%" />
        <KpiCard title="Técnicos Activos" value="34" subtitle="8 en campo hoy" accent="blue" trend="+5%" />
        <KpiCard title="Alertas Activas" value="3" subtitle="Requieren atención inmediata" accent="orange" trend="-2%" />
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-2">
        <PanelCard title="Actividad Reciente">
          <div className="space-y-3">
            {['Inspección #245 completada', 'Nuevo lote registrado en Antioquia', 'Reporte semanal generado'].map((item) => (
              <div
                key={item}
                className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 transition hover:border-emerald-200 hover:bg-emerald-50/40"
              >
                <span className="mt-1 h-2 w-2 rounded-full bg-emerald-500" />
                <div>
                  <p className="text-sm font-semibold text-slate-800">{item}</p>
                  <p className="text-xs text-slate-500">Hace unos minutos</p>
                </div>
              </div>
            ))}
          </div>
        </PanelCard>

        <PanelCard title="Próximas Inspecciones">
          <div className="space-y-3">
            {[
              { lote: 'Lote-AGRO-01', estado: 'Programada', color: 'bg-blue-100 text-blue-700' },
              { lote: 'Lote-VALLE-12', estado: 'Pendiente', color: 'bg-amber-100 text-amber-700' },
              { lote: 'Lote-CAF-88', estado: 'Urgente', color: 'bg-rose-100 text-rose-700' },
            ].map((row) => (
              <div
                key={row.lote}
                className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-3 transition hover:shadow-sm"
              >
                <div>
                  <p className="text-sm font-bold text-slate-800">{row.lote}</p>
                  <p className="text-xs text-slate-500">Técnico asignado: Carlos R.</p>
                </div>
                <span className={`rounded-full px-2 py-1 text-xs font-bold ${row.color}`}>{row.estado}</span>
              </div>
            ))}
          </div>
        </PanelCard>
      </div>
    </DashboardLayout>
  );
}

export default HomePage;
