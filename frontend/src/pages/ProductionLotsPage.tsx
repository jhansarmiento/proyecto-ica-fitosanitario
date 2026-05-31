// frontend/src/pages/ProductionLotsPage.tsx
import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, ArrowLeft, Pencil, Plus, Search, Trash2, X } from 'lucide-react';
import NewLotModal from '../components/ui/NewLotModal';
import EditLotModal from '../components/ui/EditLotModal';
import DashboardLayout from '../components/layout/DashboardLayout';
import { fincaService } from '../services/finca.service';
import type { ProductionSite } from './AgriculturalManagementPage';
import type { SessionUser } from '../types/auth.types';

// Contrato alineado a tu BD
export type LotDetail = {
  id_lote: string;
  numero_lote: string;
  especie: string;
  variedad: string;
  area_total: number;
  fecha_siembra: string;
  fecha_cosecha?: string;
  predio_nombre: string;
};

type ProductionLotsPageProps = {
  sessionUser?: SessionUser;
  site: ProductionSite | null;
  onGoResumen?: () => void;
  onGoHome?: () => void;
  onGoUsers?: () => void;
  onGoRoles?: () => void;
  onGoApprovalPlaces?: () => void;
  onGoCatalog?: () => void;
  onGoInspectionsAgenda?: () => void;
  onGoInspectionsHistory?: () => void;
  onGoReports?: () => void;
  onLogout?: () => void;
};

function ProductionLotsPage({ 
  sessionUser, site, onGoResumen, onGoHome, onGoUsers, onGoRoles, 
  onGoApprovalPlaces, onGoCatalog, onGoInspectionsAgenda, onGoInspectionsHistory, 
  onGoReports, onLogout 
}: ProductionLotsPageProps) {
  
  const [isNewLotOpen, setIsNewLotOpen] = useState(false);
  const [isEditLotOpen, setIsEditLotOpen] = useState(false);
  const [search, setSearch] = useState('');
  
  const [lotes, setLotes] = useState<LotDetail[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedLot, setSelectedLot] = useState<LotDetail | null>(null);
  const [deletingLot, setDeletingLot] = useState<LotDetail | null>(null);
  const [deleting, setDeleting] = useState(false);
  const estadoLugar = String(site?.estado || '').toLowerCase();
  const isLugarBloqueado = estadoLugar === 'pendiente' || estadoLugar === 'rechazado';

  // ─── CARGA DE DATOS REALES ──────────────────────────────────────────────────
  const loadLotes = async () => {
    if (!site?.id_lugar_produccion) return;
    try {
      setLoading(true);
      setError('');
      // Asume que tu backend devuelve los lotes filtrados por el lugar de producción y enriquecidos con los nombres
      const respuesta = await fincaService.getLotesPorLugar(site.id_lugar_produccion);
      
      const mappedLotes: LotDetail[] = respuesta.data.map((l: any) => ({
        id_lote: l.id_lote,
        numero_lote: l.numero_lote,
        especie: l.especie_nombre || 'Desconocida', // El backend debe hacer JOIN con especie y variedad
        variedad: l.variedad_nombre || 'N/A',
        area_total: Number(l.area_total || 0),
        fecha_siembra: l.fecha_siembra ? l.fecha_siembra.split('T')[0] : 'N/D',
        fecha_cosecha: l.fecha_cosecha ? l.fecha_cosecha.split('T')[0] : undefined,
        predio_nombre: l.predio_nombre || 'Predio no definido'
      }));
      
      setLotes(mappedLotes);
    } catch (e: any) {
      setError(e.message || 'No se pudieron cargar los lotes.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLotes();
  }, [site?.id_lugar_produccion]);

  // ─── FILTRADO ─────────────────────────────────────────────────────────────
  const filteredLotes = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return lotes;
    return lotes.filter((lote) => (
      lote.numero_lote.toLowerCase().includes(q) ||
      lote.especie.toLowerCase().includes(q) ||
      lote.variedad.toLowerCase().includes(q)
    ));
  }, [search, lotes]);

  // ─── MANEJADORES DE MODALES ────────────────────────────────────────────────
  const handleEditClick = (lot: LotDetail) => {
    setSelectedLot(lot);
    setIsEditLotOpen(true);
  };

  const handleDeleteClick = (lot: LotDetail) => {
    setError('');
    setDeletingLot(lot);
  };

  const confirmDeleteLot = async () => {
    if (!deletingLot || deleting) return;
    try {
      setDeleting(true);
      setError('');
      await fincaService.deleteLote(deletingLot.id_lote);
      setDeletingLot(null);
      await loadLotes();
    } catch (e: any) {
      setError(e.message || 'Error al eliminar el lote.');
    } finally {
      setDeleting(false);
    }
  };

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
        if (view === 'agricultural') onGoResumen?.();
        if (view === 'catalog') onGoCatalog?.();
        if (view === 'inspections-agenda') onGoInspectionsAgenda?.();
        if (view === 'inspections-history') onGoInspectionsHistory?.();
        if (view === 'reports') onGoReports?.();
      }}
      onLogout={onLogout}
    >
      <section className="flex-1 p-1 sm:p-2">
        {/* Cabecera de Navegación */}
        <div className="mb-3 flex items-center gap-2 text-sm text-slate-500">
          <button type="button" onClick={onGoResumen} className="inline-flex items-center gap-1 hover:text-slate-700">
            <ArrowLeft size={14} />
            Lugares de Producción
          </button>
          <span>/</span>
          <span className="font-semibold text-slate-700">{site?.nombre_lugar_produccion ?? 'Zona Productiva Norte'}</span>
        </div>

        <h2 className="text-[3rem] font-extrabold leading-none tracking-tight text-slate-900">{site?.nombre_lugar_produccion ?? 'Zona Productiva Norte'}</h2>

        {/* Pestañas */}
        <div className="mt-5 inline-flex rounded-2xl border border-slate-200 bg-white p-1">
          <button type="button" onClick={onGoResumen} className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100">
            Resumen
          </button>
          <button type="button" className="rounded-xl bg-emerald-900 px-4 py-2 text-sm font-semibold text-white">
            Lotes ({lotes.length})
          </button>
        </div>

        {/* Búsqueda y Creación */}
        <div className="mb-4 mt-6 flex flex-wrap items-center justify-between gap-3">
          <div className="flex w-full max-w-md items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 shadow-sm transition focus-within:border-emerald-300 focus-within:ring-4 focus-within:ring-emerald-50">
            <Search size={18} className="text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar lotes..."
              className="w-full bg-transparent text-sm text-slate-700 placeholder:text-slate-400 outline-none"
            />
          </div>

          <button
            type="button"
            onClick={() => setIsNewLotOpen(true)}
            disabled={isLugarBloqueado}
            title={isLugarBloqueado ? 'Solo lugares Activos pueden crear lotes' : ''}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            <Plus size={16} />
            Crear Lote
          </button>
        </div>

        {error && <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm text-rose-700">{error}</div>}
        {isLugarBloqueado && (
          <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-800">
            Solo lugares en estado Activo pueden crear lotes.
          </div>
        )}

        {/* Tabla de Lotes */}
        {loading ? (
           <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-sm animate-pulse">
             Cargando lotes registrados...
           </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-slate-50">
                  <tr className="text-left text-xs font-bold uppercase tracking-wide text-slate-600">
                    <th className="px-4 py-3">Número</th>
                    <th className="px-4 py-3">Predio</th>
                    <th className="px-4 py-3">Especie / Variedad</th>
                    <th className="px-4 py-3">Área (ha)</th>
                    <th className="px-4 py-3">Fechas</th>
                    <th className="px-4 py-3 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {filteredLotes.map((lote) => (
                    <tr key={lote.id_lote}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-purple-50 text-purple-600">
                            <Plus size={12} />
                          </span>
                          <span className="text-sm font-bold text-slate-800">{lote.numero_lote}</span>
                        </div>
                      </td>
                      <td className="px-4 py-2.5 text-sm font-medium text-slate-700">{lote.predio_nombre}</td>
                      <td className="px-4 py-2.5 text-sm text-slate-700">
                        {lote.especie} <span className="text-slate-400">· {lote.variedad}</span>
                      </td>
                      <td className="px-4 py-2.5 text-sm font-semibold text-emerald-700">{lote.area_total.toFixed(1)}</td>
                      <td className="px-4 py-2.5 text-sm text-slate-600">
                         S: {lote.fecha_siembra} <br/> 
                         C: {lote.fecha_cosecha ?? '—'}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => handleEditClick(lote)}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
                          >
                            <Pencil size={14} />
                            
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteClick(lote)}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1.5 text-xs font-semibold text-rose-700 transition hover:bg-rose-100"
                          >
                            <Trash2 size={14} />
                            
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredLotes.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-sm text-slate-500">
                        No hay lotes registrados para este lugar de producción.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>

      {deletingLot && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/45 px-4 py-6 backdrop-blur-[1px]">
          <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/5">
            <div className="flex items-center justify-between bg-rose-600 px-5 py-4 text-white">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-rose-500 ring-1 ring-white/30">
                  <AlertTriangle size={20} />
                </div>
                <div>
                  <h3 className="text-xl font-bold leading-none">Eliminar Lote</h3>
                  <p className="mt-1 text-sm text-rose-100">Esta acción no se puede deshacer</p>
                </div>
              </div>
              <button
                onClick={() => setDeletingLot(null)}
                className="text-rose-100 transition hover:text-white"
                disabled={deleting}
              >
                <X size={22} />
              </button>
            </div>

            <div className="px-5 py-5 sm:px-6">
              <p className="text-base text-slate-800">
                ¿Estás seguro de que deseas eliminar el lote{' '}
                <span className="font-bold">"{deletingLot.numero_lote}"</span>?
              </p>
              <p className="mt-2 text-sm text-slate-600">
                Se eliminarán permanentemente sus datos asociados.
              </p>

              <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
                Advertencia: Esta operación es irreversible.
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => setDeletingLot(null)}
                  disabled={deleting}
                  className="rounded-xl border border-slate-300 px-5 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmDeleteLot}
                  disabled={deleting}
                  className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:opacity-50"
                >
                  <Trash2 size={15} />
                  {deleting ? 'Eliminando...' : 'Sí, eliminar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modales: Se les pasa loadLotes a onSuccess para que refresquen la tabla */}
      <NewLotModal 
        isOpen={isNewLotOpen} 
        onClose={() => setIsNewLotOpen(false)} 
        onSuccess={() => { setIsNewLotOpen(false); loadLotes(); }} 
        idLugarProduccion={site?.id_lugar_produccion} // El modal necesita saber a qué lugar anclarlo
        prediosDisponibles={site?.predios || []}
        especiesAutorizadasIds={site?.especies_autorizadas_ids || []}
      />
      
      {/* Omito EditLotModal hasta que pasemos a limpiarlo, pero la firma será parecida */}
      <EditLotModal 
        isOpen={isEditLotOpen} 
        lot={selectedLot as any} 
        onClose={() => setIsEditLotOpen(false)} 
        onSuccess={() => { setIsEditLotOpen(false); loadLotes(); }} 
      />
    </DashboardLayout>
  );
}

export default ProductionLotsPage;