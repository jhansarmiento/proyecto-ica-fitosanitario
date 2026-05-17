import { useEffect, useMemo, useState } from 'react';
import { Search, Plus, MapPin, Database, Leaf, Layers3, Eye, Pencil, FileText } from 'lucide-react';
import NewProductionPlaceModal from '../components/ui/NewProductionPlaceModal';
import EditProductionPlaceModal from '../components/ui/EditProductionPlaceModal';
import DashboardLayout from '../components/layout/DashboardLayout';
import { api } from '../services/api';
import type { SessionUser } from '../App';

export type ProductionSite = {
  id: string | number;
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
  sessionUser?: SessionUser;
  onGoHome?: () => void;
  onGoUsers?: () => void;
  onGoRoles?: () => void;
  onGoApprovalPlaces?: () => void;
  onLogout?: () => void;
  onOpenProductionDetail?: (site: ProductionSite) => void;
};

function AgriculturalManagementPage({
  sessionUser,
  onGoHome,
  onGoUsers,
  onGoRoles,
  onGoApprovalPlaces,
  onLogout,
  onOpenProductionDetail,
}: AgriculturalManagementPageProps) {
  const [search, setSearch] = useState('');
  const [isNewProductionOpen, setIsNewProductionOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [sites, setSites] = useState<ProductionSite[]>([]);
  const [selectedSite, setSelectedSite] = useState<ProductionSite | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadSites = async () => {
    try {
      setLoading(true);
      setError('');

      const [lugaresRes, prediosRes, lotesRes, autorizacionesRes] = await Promise.all([
        api.getLugaresProduccion(),
        api.getPredios(),
        api.getLotes(),
        api.getAutorizacionesEspecie(),
      ]);

      const prediosByLugar = new Map<string, number>();
      const areaByLugar = new Map<string, number>();
      for (const p of prediosRes.data) {
        if (!p.idLugarProduccion) continue;
        prediosByLugar.set(p.idLugarProduccion, (prediosByLugar.get(p.idLugarProduccion) || 0) + 1);
        areaByLugar.set(p.idLugarProduccion, (areaByLugar.get(p.idLugarProduccion) || 0) + Number(p.areaTotal || 0));
      }

      const lotesByLugar = new Map<string, number>();
      for (const l of lotesRes.data) {
        const predio = prediosRes.data.find((p) => p.id === l.idPredio);
        if (!predio?.idLugarProduccion) continue;
        lotesByLugar.set(predio.idLugarProduccion, (lotesByLugar.get(predio.idLugarProduccion) || 0) + 1);
      }

      const especiesByLugar = new Map<string, number>();
      for (const a of autorizacionesRes.data) {
        if (!a.idLugarProduccion) continue;
        especiesByLugar.set(a.idLugarProduccion, (especiesByLugar.get(a.idLugarProduccion) || 0) + 1);
      }

      const mapped: ProductionSite[] = lugaresRes.data.map((l) => {
        const areaHa = areaByLugar.get(l.id) || 0;
        return {
          id: l.id,
          name: l.nombreLugarProduccion,
          municipality: 'N/A',
          department: 'N/A',
          associatedPredios: prediosByLugar.get(l.id) || 0,
          authorizedSpecies: especiesByLugar.get(l.id) || 0,
          activeLots: lotesByLugar.get(l.id) || 0,
          area: areaHa > 0 ? `${areaHa.toFixed(1)} ha` : 'N/D',
          ica: l.numeroRegistroICA,
          ownerName: l.productor ? `${l.productor.nombre} ${l.productor.apellidos}` : 'Sin productor',
          status: l.estado === 'Activo' ? 'Activo' : 'Pendiente',
        };
      });

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
    return sites.filter((site) => (
      site.name.toLowerCase().includes(q) ||
      site.municipality.toLowerCase().includes(q) ||
      site.department.toLowerCase().includes(q) ||
      site.ica.toLowerCase().includes(q)
    ));
  }, [search, sites]);

  return (
    <DashboardLayout
      title="Gestión Agrícola"
      sessionUser={sessionUser}
      activeView="agricultural"
      onNavigate={(view) => {
        if (view === 'home') onGoHome?.();
        if (view === 'users') onGoUsers?.();
        if (view === 'roles') onGoRoles?.();
        if (view === 'approval-places') onGoApprovalPlaces?.();
      }}
      onLogout={onLogout}
    >
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">Listado Lugares Producción - Lotes</h2>
          <p className="mt-1 text-base text-slate-600">Administra lugares de producción y lotes de cultivo</p>
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

      {error ? <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm text-rose-700">{error}</div> : null}
      {success ? <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-700">{success}</div> : null}

      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-sm">Cargando lugares de producción...</div>
      ) : (
        <div className="grid gap-4 xl:grid-cols-3 2xl:grid-cols-4 lg:grid-cols-2">
          {filteredSites.map((site) => (
            <article key={site.id} className="rounded-2xl border border-emerald-200 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-md">
              <div className="mb-4 flex items-start justify-between gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-xl bg-emerald-100 text-emerald-700">
                  <FileText size={20} />
                </div>
                <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${site.status === 'Activo' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
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
          <p className="mt-1 text-sm text-slate-500">Ajusta tu búsqueda para encontrar lugares de producción.</p>
        </div>
      ) : null}

      <NewProductionPlaceModal
        isOpen={isNewProductionOpen}
        onClose={() => setIsNewProductionOpen(false)}
        onCreate={async ({ nombreLugarProduccion, numeroRegistroICA, idUsuarioProductor }) => {
          try {
            setError('');
            await api.createLugarProduccion({
              nombreLugarProduccion,
              numeroRegistroICA,
              estado: 'Activo',
              idUsuarioProductor,
            });
            await loadSites();
            setSuccess('Lugar de producción creado correctamente');
            setIsNewProductionOpen(false);
          } catch (e: any) {
            setError(e.message || 'No se pudo crear el lugar de producción');
            throw e;
          }
        }}
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
          setSuccess('Lugar de producción actualizado correctamente');
          setIsEditOpen(false);
          setSelectedSite(null);
        }}
      />
    </DashboardLayout>
  );
}

export default AgriculturalManagementPage;
