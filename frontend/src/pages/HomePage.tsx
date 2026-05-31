import { useEffect, useMemo, useState } from 'react';
import KpiCard from '../components/ui/KpiCard';
import PanelCard from '../components/ui/PanelCard';
import DashboardLayout from '../components/layout/DashboardLayout';
import type { SessionUser } from '../types/auth.types';
import { fincaService } from '../services/finca.service';
import { inspeccionService } from '../services/inspeccion.service';

type HomePageProps = {
  sessionUser?: SessionUser;
  onGoUsers?: () => void;
  onGoRoles?: () => void;
  onGoAgricultural?: () => void;
  onGoCatalog?: () => void;
  onGoApprovalPlaces?: () => void;
  onGoInspectionsAgenda?: () => void;
  onGoInspectionsHistory?: () => void;
  onGoReports?: () => void;
  onLogout?: () => void;
};

type DashboardData = {
  lugaresCount: number;
  solicitudesPendientes: number;
  solicitudesProgramadas: number;
  inspeccionesHistorial: number;
  aprobacionesPendientes: number;
  alertas: number;
  ultimaSync: string | null;
  fuente: 'api' | 'cache' | 'none';
};

const DASHBOARD_CACHE_KEY = 'dashboard-home-cache-v1';

function HomePage({
  sessionUser,
  onGoUsers,
  onGoRoles,
  onGoAgricultural,
  onGoCatalog,
  onGoApprovalPlaces,
  onGoInspectionsAgenda,
  onGoInspectionsHistory,
  onGoReports,
  onLogout,
}: HomePageProps) {
  const rol = (sessionUser?.rol || '').toLowerCase();
  const isAdmin = rol === 'admin' || rol === 'administrador';
  const isProductor = rol === 'productor';
  const isAsistente = rol.includes('asistente') || rol.includes('tecnico');

  const [dashboardData, setDashboardData] = useState<DashboardData>({
    lugaresCount: 0,
    solicitudesPendientes: 0,
    solicitudesProgramadas: 0,
    inspeccionesHistorial: 0,
    aprobacionesPendientes: 0,
    alertas: 0,
    ultimaSync: null,
    fuente: 'none',
  });
  const [actividadReciente, setActividadReciente] = useState<string[]>([]);
  const [tramitesProductor, setTramitesProductor] = useState<Array<{ label: string; status: string }>>([]);
  const [proximasVisitas, setProximasVisitas] = useState<Array<{ lote: string; fecha: string; estado: string }>>([]);

  const rolKey = useMemo(() => {
    if (isAdmin) return 'admin';
    if (isProductor) return 'productor';
    if (isAsistente) return 'asistente';
    return 'otro';
  }, [isAdmin, isProductor, isAsistente]);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const [lugaresRes, solicitudesRes, historialRes, pendientesIcaRes] = await Promise.allSettled([
          fincaService.getLugaresProduccion(),
          fincaService.getSolicitudesInspeccion(),
          inspeccionService.obtenerHistorialInspecciones(),
          fincaService.getSolicitudesPendientesICA(),
        ]);

        const lugares =
          lugaresRes.status === 'fulfilled' && Array.isArray(lugaresRes.value?.data) ? lugaresRes.value.data : [];
        const solicitudes =
          solicitudesRes.status === 'fulfilled' && Array.isArray(solicitudesRes.value?.data)
            ? solicitudesRes.value.data
            : [];
        const historial =
          historialRes.status === 'fulfilled' && Array.isArray(historialRes.value?.data) ? historialRes.value.data : [];
        const pendientesIca =
          pendientesIcaRes.status === 'fulfilled' && Array.isArray(pendientesIcaRes.value?.data)
            ? pendientesIcaRes.value.data
            : [];

        const pendientes = solicitudes.filter((s: any) => String(s.estado || '').toUpperCase() === 'SOLICITADA').length;
        const programadas = solicitudes.filter((s: any) => String(s.estado || '').toUpperCase() === 'PROGRAMADA').length;
        const aprobPend = pendientesIca.filter((p: any) => String(p.estado || '').toUpperCase() === 'PENDIENTE').length;

        const actividad = solicitudes.slice(0, 3).map((s: any) => {
          const lugar = s?.lugar_nombre || s?.nombre_lugar || s?.id_lugar_produccion || 'Solicitud';
          const estado = String(s?.estado || 'SIN ESTADO').toUpperCase();
          return `${lugar} - ${estado}`;
        });

        const tramites = solicitudes.slice(0, 3).map((s: any) => ({
          label: s?.lugar_nombre
            ? `Lugar "${s.lugar_nombre}" en trámite`
            : `Solicitud ${s?.id_solicitud || s?.id || ''}`.trim(),
          status: String(s?.estado || 'Pendiente'),
        }));

        const visitas = solicitudes
          .filter((s: any) => String(s?.estado || '').toUpperCase() === 'PROGRAMADA')
          .slice(0, 3)
          .map((s: any) => ({
            lote: s?.lugar_nombre || s?.lote_nombre || `Solicitud ${s?.id_solicitud || s?.id || ''}`.trim(),
            fecha: s?.fecha_programada
              ? new Date(s.fecha_programada).toLocaleDateString()
              : 'Fecha pendiente',
            estado: 'Programada',
          }));

        const nextData: DashboardData = {
          lugaresCount: lugares.length,
          solicitudesPendientes: pendientes,
          solicitudesProgramadas: programadas,
          inspeccionesHistorial: historial.length,
          aprobacionesPendientes: aprobPend,
          alertas: pendientes + aprobPend,
          ultimaSync: new Date().toISOString(),
          fuente: 'api',
        };

        setDashboardData(nextData);
        setActividadReciente(
          actividad.length
            ? actividad
            : ['Sin actividad reciente registrada', 'Sin cambios recientes', 'Sin novedades operativas'],
        );
        setTramitesProductor(
          tramites.length
            ? tramites
            : [
                { label: 'Sin trámites registrados', status: 'N/A' },
                { label: 'Sin solicitudes recientes', status: 'N/A' },
                { label: 'Sin inspecciones nuevas', status: 'N/A' },
              ],
        );
        setProximasVisitas(
          visitas.length
            ? visitas
            : [
                { lote: 'Sin visitas programadas', fecha: '—', estado: 'Pendiente' },
                { lote: 'Sin visitas programadas', fecha: '—', estado: 'Pendiente' },
                { lote: 'Sin visitas programadas', fecha: '—', estado: 'Pendiente' },
              ],
        );

        localStorage.setItem(
          `${DASHBOARD_CACHE_KEY}:${rolKey}`,
          JSON.stringify({ nextData, actividad, tramites, visitas }),
        );
      } catch {
        const raw = localStorage.getItem(`${DASHBOARD_CACHE_KEY}:${rolKey}`);
        if (raw) {
          try {
            const parsed = JSON.parse(raw) as {
              nextData: DashboardData;
              actividad?: string[];
              tramites?: Array<{ label: string; status: string }>;
              visitas?: Array<{ lote: string; fecha: string; estado: string }>;
            };

            if (parsed?.nextData) {
              setDashboardData({ ...parsed.nextData, fuente: 'cache' });
            }
            setActividadReciente(
              parsed?.actividad?.length
                ? parsed.actividad
                : ['Sin actividad reciente registrada', 'Sin cambios recientes', 'Sin novedades operativas'],
            );
            setTramitesProductor(
              parsed?.tramites?.length
                ? parsed.tramites
                : [
                    { label: 'Sin trámites registrados', status: 'N/A' },
                    { label: 'Sin solicitudes recientes', status: 'N/A' },
                    { label: 'Sin inspecciones nuevas', status: 'N/A' },
                  ],
            );
            setProximasVisitas(
              parsed?.visitas?.length
                ? parsed.visitas
                : [
                    { lote: 'Sin visitas programadas', fecha: '—', estado: 'Pendiente' },
                    { lote: 'Sin visitas programadas', fecha: '—', estado: 'Pendiente' },
                    { lote: 'Sin visitas programadas', fecha: '—', estado: 'Pendiente' },
                  ],
            );
          } catch {
            // no-op
          }
        }
      }
    };

    loadDashboard();
  }, [rolKey]);

  const renderAdminDashboard = () => (
    <>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">Dashboard Administrador</h2>
          <p className="text-sm text-slate-600">Vista global de operación, aprobaciones y gestión del sistema</p>
        </div>
        <button
          onClick={onGoApprovalPlaces}
          className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100"
        >
          Revisar solicitudes pendientes
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-4">
        <KpiCard title="Solicitudes pendientes" value={String(dashboardData.aprobacionesPendientes)} subtitle="Lugares por aprobar" accent="orange" trend="+0%" />
        <KpiCard title="Lugares registrados" value={String(dashboardData.lugaresCount)} subtitle="Total en operación" accent="blue" trend="+0%" />
        <KpiCard title="Inspecciones programadas" value={String(dashboardData.solicitudesProgramadas)} subtitle="Agenda total del sistema" accent="green" trend="+0%" />
        <KpiCard title="Alertas críticas" value={String(dashboardData.alertas)} subtitle="Requieren acción inmediata" accent="red" trend="+0%" />
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-2">
        <PanelCard title="Gestión Administrativa">
          <div className="space-y-3">
            {[
              { label: 'Gestionar usuarios', action: onGoUsers },
              { label: 'Configurar roles', action: onGoRoles },
              { label: 'Aprobar lugares de producción', action: onGoApprovalPlaces },
              { label: 'Consultar reportes', action: onGoReports },
            ].map((item) => (
              <button
                key={item.label}
                onClick={item.action}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-left text-sm font-semibold text-slate-800 transition hover:border-emerald-200 hover:bg-emerald-50"
              >
                {item.label}
              </button>
            ))}
          </div>
        </PanelCard>

        <PanelCard title="Actividad reciente del sistema">
          <div className="space-y-3">
            {actividadReciente.map((item) => (
              <div key={item} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <p className="text-sm font-semibold text-slate-800">{item}</p>
                <p className="text-xs text-slate-500">Hace unos minutos</p>
              </div>
            ))}
          </div>
        </PanelCard>
      </div>
    </>
  );

  const renderProductorDashboard = () => (
    <>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">Mi Panel de Productor</h2>
          <p className="text-sm text-slate-600">Seguimiento de tus lugares, solicitudes e inspecciones</p>
        </div>
        <button
          onClick={onGoAgricultural}
          className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100"
        >
          Ir a Gestión Agrícola
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-4">
        <KpiCard title="Mis lugares de producción" value={String(dashboardData.lugaresCount)} subtitle="Activos y en trámite" accent="green" trend="+0" />
        <KpiCard title="Solicitudes en revisión" value={String(dashboardData.solicitudesPendientes)} subtitle="Pendientes de aprobación ICA" accent="orange" trend="+0" />
        <KpiCard title="Inspecciones programadas" value={String(dashboardData.solicitudesProgramadas)} subtitle="Próximas visitas técnicas" accent="blue" trend="+0" />
        <KpiCard title="Inspecciones en historial" value={String(dashboardData.inspeccionesHistorial)} subtitle="Registros cerrados" accent="red" trend="+0" />
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-2">
        <PanelCard title="Acciones rápidas">
          <div className="space-y-3">
            {[
              { label: 'Gestionar lugares y predios', action: onGoAgricultural },
              { label: 'Ver mis solicitudes e inspecciones', action: onGoInspectionsAgenda },
              { label: 'Ver reportes', action: onGoReports },
            ].map((item) => (
              <button
                key={item.label}
                onClick={item.action}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-left text-sm font-semibold text-slate-800 transition hover:border-emerald-200 hover:bg-emerald-50"
              >
                {item.label}
              </button>
            ))}
          </div>
        </PanelCard>

        <PanelCard title="Estado de mis trámites">
          <div className="space-y-3">
            {tramitesProductor.map((row) => (
              <div key={row.label} className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-3">
                <p className="text-sm font-semibold text-slate-800">{row.label}</p>
                <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-bold text-emerald-700">{row.status}</span>
              </div>
            ))}
          </div>
        </PanelCard>
      </div>
    </>
  );

  const renderAsistenteDashboard = () => (
    <>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">Panel de Asistente Técnico</h2>
          <p className="text-sm text-slate-600">Agenda operativa, inspecciones en curso e historial técnico</p>
        </div>
        <button
          onClick={onGoInspectionsAgenda}
          className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100"
        >
          Abrir agenda de inspecciones
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-4">
        <KpiCard title="Inspecciones en agenda" value={String(dashboardData.solicitudesProgramadas)} subtitle="Asignadas y programadas" accent="blue" trend="+0" />
        <KpiCard title="Pendientes de atención" value={String(dashboardData.solicitudesPendientes)} subtitle="Solicitudes por gestionar" accent="orange" trend="+0" />
        <KpiCard title="Finalizadas" value={String(dashboardData.inspeccionesHistorial)} subtitle="Historial acumulado" accent="green" trend="+0" />
        <KpiCard title="Alertas operativas" value={String(dashboardData.alertas)} subtitle="Requieren seguimiento" accent="red" trend="+0" />
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-2">
        <PanelCard title="Trabajo técnico">
          <div className="space-y-3">
            {[
              { label: 'Agenda de inspecciones', action: onGoInspectionsAgenda },
              { label: 'Historial de inspecciones', action: onGoInspectionsHistory },
              { label: 'Catálogo fitosanitario', action: onGoCatalog },
            ].map((item) => (
              <button
                key={item.label}
                onClick={item.action}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-left text-sm font-semibold text-slate-800 transition hover:border-emerald-200 hover:bg-emerald-50"
              >
                {item.label}
              </button>
            ))}
          </div>
        </PanelCard>

        <PanelCard title="Próximas visitas">
          <div className="space-y-3">
            {proximasVisitas.map((row) => (
              <div key={row.lote} className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-3">
                <div>
                  <p className="text-sm font-bold text-slate-800">{row.lote}</p>
                  <p className="text-xs text-slate-500">Fecha: {row.fecha}</p>
                </div>
                <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-bold text-blue-700">{row.estado}</span>
              </div>
            ))}
          </div>
        </PanelCard>
      </div>
    </>
  );

  const renderFallback = () => (
    <div className="rounded-xl border border-slate-200 bg-white p-6">
      <h2 className="text-xl font-bold text-slate-900">Bienvenido</h2>
      <p className="mt-2 text-sm text-slate-600">
        No se identificó un rol válido para personalizar el dashboard. Contacta al administrador para validar tu perfil.
      </p>
      <button
        onClick={onGoReports}
        className="mt-4 rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
      >
        Ver reportes
      </button>
    </div>
  );

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
        if (view === 'catalog') onGoCatalog?.();
        if (view === 'approval-places') onGoApprovalPlaces?.();
        if (view === 'inspections-agenda') onGoInspectionsAgenda?.();
        if (view === 'inspections-history') onGoInspectionsHistory?.();
        if (view === 'reports') onGoReports?.();
      }}
      onLogout={onLogout}
    >
      {isAdmin
        ? renderAdminDashboard()
        : isProductor
        ? renderProductorDashboard()
        : isAsistente
        ? renderAsistenteDashboard()
        : renderFallback()}
    </DashboardLayout>
  );
}

export default HomePage;
