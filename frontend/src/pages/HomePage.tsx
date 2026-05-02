import SidebarItem from '../components/ui/SidebarItem';
import KpiCard from '../components/ui/KpiCard';
import PanelCard from '../components/ui/PanelCard';
import {Home,Users,FileText,Layers,Folder,ShieldCheck,BarChart3,Bell,} from "lucide-react";

function HomePage() {
  return (
    <main className="min-h-screen bg-slate-100 text-slate-900">
      <div className="grid min-h-screen grid-cols-1 xl:grid-cols-[280px_1fr]">
        <aside className="relative flex flex-col overflow-hidden bg-gradient-to-b from-emerald-950 via-emerald-900 to-emerald-950 p-4 text-white">
          <div className="pointer-events-none absolute -right-16 top-10 h-48 w-48 rounded-full bg-emerald-400/10 blur-3xl" />
          <div className="mb-5 flex items-center gap-3 border-b border-white/10 pb-4">
            <div className="h-12 w-12 rounded-xl bg-white/95 shadow-md" />
            <div>
              <p className="text-2xl font-bold leading-none">FitoGestor</p>
              <p className="mt-1 text-sm text-emerald-100/90">Sistema Fitosanitario</p>
            </div>
          </div>

<         nav className="flex flex-1 flex-col gap-1.5">
            <SidebarItem label="Inicio" active icon={<Home size={20} />} />
            <SidebarItem label="Gestion de Usuarios" hasChevron icon={<Users size={20} />} />
            <SidebarItem label="Gestion de Catalogos" hasChevron icon={<FileText size={20} />} />
            <SidebarItem label="Gestion Agricola" icon={<Layers size={20} />} />
            <SidebarItem label="Mis Solicitudes" icon={<Folder size={20} />} />
            <SidebarItem label="Inspecciones" hasChevron icon={<ShieldCheck size={20} />} />
            <SidebarItem label="Reportes" icon={<BarChart3 size={20} />} />
          </nav>
          <button
            type="button"
            className="mt-4 flex items-center gap-2 rounded-xl border border-red-300/30 bg-red-500/10 px-3 py-3 text-base font-bold text-red-300 transition hover:bg-red-500/20"
          >
            <span>↪</span>
            Cerrar Sesion
          </button>
        </aside>

        <div className="flex flex-col">
          <header className="sticky top-0 z-10 flex min-h-[86px] flex-wrap items-center justify-between gap-4 border-b border-emerald-800/40 bg-emerald-900/95 px-5 py-3 text-white backdrop-blur sm:px-8">
            <div>
              <h1 className="text-3xl font-bold leading-none">Inicio</h1>
              <p className="mt-1 text-sm text-emerald-100">Sistema de Inspección Fitosanitaria</p>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden rounded-xl border border-emerald-700 bg-emerald-800/70 px-3 py-2 md:block">
                <input
                  type="text"
                  placeholder="Buscar..."
                  className="w-44 bg-transparent text-sm text-emerald-50 placeholder:text-emerald-200/70 outline-none"
                />
              </div>
              <button className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-900/40 text-emerald-300 transition-all duration-300 hover:bg-emerald-700/80 hover:text-white"><Bell size={18} />
              </button>
              <div className="text-right">
                <p className="text-base font-bold leading-none">Pepito Perez</p>
                <p className="text-xs text-emerald-200">Administrador</p>
              </div>
              <div className="grid h-10 w-10 place-items-center rounded-full bg-emerald-700 text-sm font-bold">PP</div>
            </div>
          </header>

          <section className="flex-1 p-4 sm:p-6">
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
                  {['Inspección #245 completada', 'Nuevo lote registrado en Antioquia', 'Reporte semanal generado'].map(
                    (item) => (
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
                    ),
                  )}
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
          </section>
        </div>
      </div>
    </main>
  );
}

export default HomePage;
