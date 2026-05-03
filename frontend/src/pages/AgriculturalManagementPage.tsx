import { useMemo, useState } from 'react';
import {
  Home,
  Users,
  FileText,
  Layers,
  Folder,
  ShieldCheck,
  BarChart3,
  Bell,
  ChevronDown,
  Search,
  Plus,
  MapPin,
  Database,
  Leaf,
  Layers3,
} from 'lucide-react';
import SidebarItem from '../components/ui/SidebarItem';
import NewProductionPlaceModal from '../components/ui/NewProductionPlaceModal';

const sites: ProductionSite[] = [
  {
    id: 1,
    name: 'Finca Los Arrayanes',
    municipality: 'Chipaque',
    department: 'Cundinamarca',
    associatedPredios: 2,
    authorizedSpecies: 3,
    activeLots: 3,
    area: '37.8 ha',
    ica: 'ICA-2026-0015',
    status: 'Activo',
  },
  {
    id: 2,
    name: 'Hacienda San José',
    municipality: 'Cáqueza',
    department: 'Cundinamarca',
    associatedPredios: 1,
    authorizedSpecies: 2,
    activeLots: 1,
    area: '18.7 ha',
    ica: 'ICA-2026-0032',
    status: 'Activo',
  },
  {
    id: 3,
    name: 'Parcela El Porvenir',
    municipality: 'Fómeque',
    department: 'Cundinamarca',
    associatedPredios: 2,
    authorizedSpecies: 2,
    activeLots: 0,
    area: '38.0 ha',
    ica: 'ICA-2026-0047',
    status: 'Pendiente',
  },
];

export type ProductionSite = {
  id: number;
  name: string;
  municipality: string;
  department: string;
  associatedPredios: number;
  authorizedSpecies: number;
  activeLots: number;
  area: string;
  ica: string;
  status: 'Activo' | 'Pendiente';
};

type AgriculturalManagementPageProps = {
  onGoHome?: () => void;
  onGoUsers?: () => void;
  onGoRoles?: () => void;
  onOpenProductionDetail?: (site: ProductionSite) => void;
};

function AgriculturalManagementPage({
  onGoHome,
  onGoUsers,
  onGoRoles,
  onOpenProductionDetail,
}: AgriculturalManagementPageProps) {
  const [isUsersOpen, setIsUsersOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [isNewProductionOpen, setIsNewProductionOpen] = useState(false);

  const filteredSites = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return sites;
    return sites.filter((site) => {
      return (
        site.name.toLowerCase().includes(q) ||
        site.municipality.toLowerCase().includes(q) ||
        site.department.toLowerCase().includes(q) ||
        site.ica.toLowerCase().includes(q)
      );
    });
  }, [search]);

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

          <nav className="flex flex-1 flex-col gap-1.5">
            <button type="button" onClick={onGoHome} className="w-full">
              <SidebarItem label="Inicio" icon={<Home size={20} />} />
            </button>

            <button
              type="button"
              onClick={() => setIsUsersOpen((prev) => !prev)}
              className="group relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-emerald-50/90 transition-all duration-300 hover:bg-white/10 hover:text-white"
            >
              <Users size={20} className="text-emerald-200" />
              <span className="flex-1 text-[1.02rem] font-semibold tracking-tight">Gestión de Usuarios</span>
              <ChevronDown
                size={16}
                className={`transition-transform duration-300 ${isUsersOpen ? 'rotate-180' : ''}`}
              />
            </button>

            {isUsersOpen ? (
              <div className="ml-3 mt-1 space-y-1">
                <button
                  type="button"
                  onClick={onGoUsers}
                  className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-base font-medium text-emerald-100 transition hover:bg-white/10 hover:text-white"
                >
                  <Users size={18} />
                  Usuarios
                </button>
                <button
                  type="button"
                  onClick={onGoRoles}
                  className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-base font-medium text-emerald-100 transition hover:bg-white/10 hover:text-white"
                >
                  <ShieldCheck size={18} />
                  Roles
                </button>
              </div>
            ) : null}

            {/* <SidebarItem label="Gestión de Catálogos" hasChevron icon={<FileText size={20} />} /> */}
            <SidebarItem label="Gestión Agrícola" active icon={<Layers size={20} />} />
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
          <header className="sticky top-0 z-10 flex min-h-[84px] flex-wrap items-center justify-between gap-3 border-b border-emerald-800/40 bg-emerald-900/95 px-5 py-3 text-white backdrop-blur sm:px-8">
            <div>
              <h1 className="text-3xl font-bold leading-none">Gestión Agrícola</h1>
              <p className="mt-1 text-sm text-emerald-100">Sistema de Inspección Fitosanitaria</p>
            </div>

            <div className="flex items-center gap-3">
              <button className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-900/40 text-emerald-300 transition-all duration-300 hover:bg-emerald-700/80 hover:text-white">
                <Bell size={18} />
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
                <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">Listado Lugares Produccion - Lotes </h2>
                <p className="mt-1 text-base text-slate-600">
                  Administra lugares de producción y lotes de cultivo
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsNewProductionOpen(true)}
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-900 px-6 py-3 text-lg font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-emerald-800 hover:shadow-md"
              >
                <Plus size={20} />
                Crear Lugar de Producción
              </button>
            </div>

            <div className="mb-6 flex w-full max-w-3xl items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-3 shadow-sm transition focus-within:border-emerald-400 focus-within:ring-4 focus-within:ring-emerald-100">
              <Search size={20} className="text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar lugares de producción..."
                className="w-full bg-transparent text-lg text-slate-700 placeholder:text-slate-400 outline-none"
              />
            </div>

            <div className="grid gap-5 xl:grid-cols-3 lg:grid-cols-2">
              {filteredSites.map((site) => (
                <button
                  type="button"
                  key={site.id}
                  onClick={() => onOpenProductionDetail?.(site)}
                  className="rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-md"
                >
                  <div className="mb-4 flex items-start justify-between gap-3">
                    <div className="grid h-12 w-12 place-items-center rounded-xl bg-emerald-100 text-emerald-700">
                      <FileText size={24} />
                    </div>
                    <span
                      className={`rounded-full px-3 py-1 text-sm font-semibold ${
                        site.status === 'Activo'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {site.status}
                    </span>
                  </div>

                  <h3 className="text-4 font-extrabold tracking-tight text-slate-900">{site.name}</h3>

                  <div className="mt-3 space-y-1.5 text-slate-700">
                    <p className="flex items-center gap-2 text-2xl">
                      <MapPin size={16} className="text-slate-500" />
                      {site.municipality}, {site.department}
                    </p>
                    <p className="flex items-center gap-2 text-sm">
                      <Database size={16} className="text-slate-500" />
                      {site.associatedPredios} predios asociados
                    </p>
                    <p className="flex items-center gap-2 text-sm">
                      <Leaf size={16} className="text-slate-500" />
                      {site.authorizedSpecies} especies autorizadas
                    </p>
                    <p className="flex items-center gap-2 text-sm">
                      <Layers3 size={16} className="text-slate-500" />
                      {site.activeLots} lotes activos
                    </p>
                  </div>

                  <div className="mt-5 space-y-2 border-t border-slate-200 pt-3">
                    <div className="flex items-center justify-between text-lg">
                      <span className="text-slate-500">Área total:</span>
                      <span className="font-bold text-emerald-600">{site.area}</span>
                    </div>
                    <div className="flex items-center justify-between text-lg">
                      <span className="text-slate-500">Registro ICA:</span>
                      <span className="font-bold text-slate-800">{site.ica}</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {filteredSites.length === 0 ? (
              <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
                <p className="text-lg font-semibold text-slate-800">No se encontraron resultados</p>
                <p className="mt-1 text-sm text-slate-500">
                  Ajusta tu búsqueda para encontrar lugares de producción.
                </p>
              </div>
            ) : null}
          </section>
        </div>
      </div>

      <NewProductionPlaceModal
        isOpen={isNewProductionOpen}
        onClose={() => setIsNewProductionOpen(false)}
      />
    </main>
  );
}

export default AgriculturalManagementPage;
