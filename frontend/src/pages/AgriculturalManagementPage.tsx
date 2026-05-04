import { useEffect, useMemo, useState } from 'react';
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
  Eye,
  Pencil,
} from 'lucide-react';
import SidebarItem from '../components/ui/SidebarItem';
import NewProductionPlaceModal from '../components/ui/NewProductionPlaceModal';
import EditProductionPlaceModal from '../components/ui/EditProductionPlaceModal';
import { api } from '../services/api';

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
  ownerName: string;
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
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [sites, setSites] = useState<ProductionSite[]>([]);
  const [selectedSite, setSelectedSite] = useState<ProductionSite | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadSites = async () => {
    try {
      setLoading(true);
      setError('');
      const [lugaresRes, prediosRes, lotesRes] = await Promise.all([
        api.getLugaresProduccion(),
        api.getPredios(),
        api.getLotes(),
      ]);

      const prediosByLugar = new Map<string, number>();
      for (const p of prediosRes.data) {
        if (!p.idLugarProduccion) continue;
        prediosByLugar.set(p.idLugarProduccion, (prediosByLugar.get(p.idLugarProduccion) || 0) + 1);
      }

      const lotesByLugar = new Map<string, number>();
      for (const l of lotesRes.data) {
        const predio = prediosRes.data.find((p) => p.id === l.idPredio);
        if (!predio?.idLugarProduccion) continue;
        lotesByLugar.set(predio.idLugarProduccion, (lotesByLugar.get(predio.idLugarProduccion) || 0) + 1);
      }

      const mapped: ProductionSite[] = lugaresRes.data.map((l) => ({
        id: Number(l.id),
        name: l.nombreLugarProduccion,
        municipality: 'N/A',
        department: 'N/A',
        associatedPredios: prediosByLugar.get(l.id) || 0,
        authorizedSpecies: 0,
        activeLots: lotesByLugar.get(l.id) || 0,
        area: 'N/D',
        ica: l.numeroRegistroICA,
        ownerName: l.productor ? `${l.productor.nombre} ${l.productor.apellidos}` : 'Sin productor',
        status: l.estado === 'Activo' ? 'Activo' : 'Pendiente',
      }));

      setSites(mapped);
    } catch (e: any) {
      setError(e.message || 'No se pudieron cargar los lugares de producción');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSites();
  }, []);

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
  }, [search, sites]);

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

            {error ? (
              <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm text-rose-700">
                {error}
              </div>
            ) : null}

            {loading ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-sm">
                Cargando lugares de producción...
              </div>
            ) : (
              <div className="grid gap-4 xl:grid-cols-3 2xl:grid-cols-4 lg:grid-cols-2">
                {filteredSites.map((site) => (
                <article
                  key={site.id}
                  className="rounded-2xl border border-emerald-200 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-md"
                >
                  <div className="mb-4 flex items-start justify-between gap-3">
                    <div className="grid h-11 w-11 place-items-center rounded-xl bg-emerald-100 text-emerald-700">
                      <FileText size={20} />
                    </div>
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                        site.status === 'Activo'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {site.status}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold tracking-tight text-slate-900">{site.name}</h3>

                  <div className="mt-2.5 space-y-1.5 text-slate-700">
                    <p className="flex items-center gap-2 text-base font-medium">
                      <MapPin size={15} className="text-slate-500" />
                      {site.municipality}, {site.department}
                    </p>
                    <p className="flex items-center gap-2 text-base">
                      <Database size={16} className="text-slate-500" />
                      {site.associatedPredios} predios asociados
                    </p>
                    <p className="flex items-center gap-2 text-base">
                      <Leaf size={16} className="text-slate-500" />
                      {site.authorizedSpecies} especies autorizadas
                    </p>
                    <p className="flex items-center gap-2 text-base">
                      <Layers3 size={16} className="text-slate-500" />
                      {site.activeLots} lotes activos
                    </p>
                  </div>

                  <div className="mt-4 space-y-1.5 border-t border-slate-200 pt-2.5">
                    <div className="flex items-center justify-between text-base">
                      <span className="text-slate-500">Área total:</span>
                      <span className="font-bold text-emerald-600">{site.area}</span>
                    </div>
                    <div className="flex items-center justify-between text-base">
                      <span className="text-slate-500">Registro ICA:</span>
                      <span className="font-bold text-slate-800">{site.ica}</span>
                    </div>
                  </div>

                  <div className="mt-3.5 grid grid-cols-[1fr_auto] items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onOpenProductionDetail?.(site)}
                      className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl bg-emerald-900 px-3.5 text-sm font-semibold text-white transition hover:bg-emerald-800"
                    >
                      <Eye size={16} />
                      Ver detalle
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedSite(site);
                        setIsEditOpen(true);
                      }}
                      className="grid h-10 w-10 place-items-center rounded-xl border border-slate-300 bg-white text-slate-600 transition hover:border-emerald-300 hover:text-emerald-700"
                      aria-label={`Editar ${site.name}`}
                      title="Editar"
                    >
                      <Pencil size={16} />
                    </button>
                  </div>
                </article>
                ))}
              </div>
            )}

            {!loading && filteredSites.length === 0 ? (
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

      <EditProductionPlaceModal
        isOpen={isEditOpen}
        site={selectedSite}
        onClose={() => {
          setIsEditOpen(false);
          setSelectedSite(null);
        }}
        onSave={(updated) => {
          setSites((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
          setIsEditOpen(false);
          setSelectedSite(null);
        }}
      />
    </main>
  );
}

export default AgriculturalManagementPage;
