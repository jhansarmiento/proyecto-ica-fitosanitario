import { useMemo, useState } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import type { SessionUser } from '../App';
import { approvalRequestsSeed } from '../data/dashboard.data';
import type { ProductionApprovalItem } from '../types/dashboard.types';
import StatusBadge from '../components/ui/StatusBadge';
import Pagination from '../components/ui/Pagination';
import ToastMessage from '../components/ui/ToastMessage';
import EmptyState from '../components/ui/EmptyState';

type AdminProductionApprovalPageProps = {
  sessionUser?: SessionUser;
  onGoHome?: () => void;
  onGoUsers?: () => void;
  onGoRoles?: () => void;
  onGoAgricultural?: () => void;
  onGoProducerPlaces?: () => void;
  onGoCatalogs?: () => void;
  onLogout?: () => void;
};

const PAGE_SIZE = 5;

function AdminProductionApprovalPage({
  sessionUser,
  onGoHome,
  onGoUsers,
  onGoRoles,
  onGoAgricultural,
  onGoProducerPlaces,
  onGoCatalogs,
  onLogout,
}: AdminProductionApprovalPageProps) {
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'Todos' | 'Pendiente' | 'Aprobado' | 'Rechazado'>('Todos');
  const [page, setPage] = useState(1);
  const [rows, setRows] = useState<ProductionApprovalItem[]>(approvalRequestsSeed);
  const [selected, setSelected] = useState<ProductionApprovalItem | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      const matchesQuery =
        r.nombreLugarProduccion.toLowerCase().includes(query.toLowerCase()) ||
        r.productor.toLowerCase().includes(query.toLowerCase()) ||
        r.municipio.toLowerCase().includes(query.toLowerCase()) ||
        r.numeroICA.toLowerCase().includes(query.toLowerCase());

      const matchesStatus = statusFilter === 'Todos' ? true : r.estado === statusFilter;
      return matchesQuery && matchesStatus;
    });
  }, [rows, query, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleNavigate = (view: 'home' | 'users' | 'roles' | 'agricultural' | 'approval-places' | 'producer-places' | 'catalogs') => {
    if (view === 'home') onGoHome?.();
    if (view === 'users') onGoUsers?.();
    if (view === 'roles') onGoRoles?.();
    if (view === 'agricultural') onGoAgricultural?.();
    if (view === 'producer-places') onGoProducerPlaces?.();
    if (view === 'catalogs') onGoCatalogs?.();
  };

  const handleApprove = async () => {
    if (!selected) return;
    setIsSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 650));

    setRows((prev) => prev.map((r) => (r.id === selected.id ? { ...r, estado: 'Aprobado', observaciones: 'Aprobado por administrador ICA.' } : r)));
    setToast({ type: 'success', message: `Solicitud ${selected.numeroICA} aprobada correctamente.` });
    setSelected((prev) => (prev ? { ...prev, estado: 'Aprobado', observaciones: 'Aprobado por administrador ICA.' } : null));
    setIsSaving(false);
  };

  const handleReject = async () => {
    if (!selected) return;
    if (!rejectionReason.trim()) {
      setToast({ type: 'error', message: 'Debes ingresar observaciones para rechazar la solicitud.' });
      return;
    }

    setIsSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 650));

    setRows((prev) => prev.map((r) => (r.id === selected.id ? { ...r, estado: 'Rechazado', observaciones: rejectionReason } : r)));
    setToast({ type: 'info', message: `Solicitud ${selected.numeroICA} rechazada con observaciones.` });
    setSelected((prev) => (prev ? { ...prev, estado: 'Rechazado', observaciones: rejectionReason } : null));
    setRejectionReason('');
    setIsSaving(false);
  };

  return (
    <DashboardLayout
      title="Aprobación de Lugares de Producción"
      subtitle="Gestión de solicitudes para administrador ICA"
      activeView="approval-places"
      sessionUser={sessionUser}
      breadcrumbs={['Inicio', 'Solicitudes', 'Aprobación de Lugares']}
      onNavigate={handleNavigate}
      onLogout={onLogout}
    >
      <div className="space-y-4">
        {toast ? <ToastMessage type={toast.type} message={toast.message} /> : null}

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="grid gap-3 md:grid-cols-3">
            <input
              type="text"
              placeholder="Buscar por lugar, productor, municipio o número ICA..."
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
              className="rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
            />
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value as 'Todos' | 'Pendiente' | 'Aprobado' | 'Rechazado');
                setPage(1);
              }}
              className="rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
            >
              <option>Todos</option>
              <option>Pendiente</option>
              <option>Aprobado</option>
              <option>Rechazado</option>
            </select>
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
              Total solicitudes: <span className="font-semibold text-slate-800">{filtered.length}</span>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {paginated.length === 0 ? (
            <div className="p-6">
              <EmptyState
                title="No hay solicitudes para mostrar"
                description="Ajusta los filtros o espera nuevas solicitudes de lugares de producción."
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50 text-left text-slate-600">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Lugar</th>
                    <th className="px-4 py-3 font-semibold">Productor</th>
                    <th className="px-4 py-3 font-semibold">Fecha solicitud</th>
                    <th className="px-4 py-3 font-semibold">Estado</th>
                    <th className="px-4 py-3 font-semibold">Municipio</th>
                    <th className="px-4 py-3 font-semibold">Área total</th>
                    <th className="px-4 py-3 font-semibold">Número ICA</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((row) => (
                    <tr
                      key={row.id}
                      onClick={() => setSelected(row)}
                      className="cursor-pointer border-t border-slate-100 transition hover:bg-emerald-50/40"
                    >
                      <td className="px-4 py-3 font-semibold text-slate-800">{row.nombreLugarProduccion}</td>
                      <td className="px-4 py-3 text-slate-700">{row.productor}</td>
                      <td className="px-4 py-3 text-slate-600">{row.fechaSolicitud}</td>
                      <td className="px-4 py-3">
                        <StatusBadge status={row.estado} />
                      </td>
                      <td className="px-4 py-3 text-slate-700">{row.municipio}</td>
                      <td className="px-4 py-3 text-slate-700">{row.areaTotal} ha</td>
                      <td className="px-4 py-3 text-slate-700">{row.numeroICA}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="px-4 pb-4">
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        </div>
      </div>

      {selected ? (
        <div className="fixed inset-0 z-50 flex">
          <div className="flex-1 bg-black/35" onClick={() => setSelected(null)} />
          <div className="h-full w-full max-w-2xl overflow-y-auto border-l border-slate-200 bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-start justify-between">
              <div>
                <h3 className="text-xl font-bold text-slate-900">{selected.nombreLugarProduccion}</h3>
                <p className="text-sm text-slate-500">Detalle de solicitud y acciones administrativas</p>
              </div>
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-700"
              >
                Cerrar
              </button>
            </div>

            <div className="grid gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm">
              <p><span className="font-semibold text-slate-700">Productor:</span> {selected.productor}</p>
              <p><span className="font-semibold text-slate-700">Municipio:</span> {selected.municipio}</p>
              <p><span className="font-semibold text-slate-700">Área total:</span> {selected.areaTotal} ha</p>
              <p><span className="font-semibold text-slate-700">Número ICA:</span> {selected.numeroICA}</p>
              <p><span className="font-semibold text-slate-700">Estado:</span> <StatusBadge status={selected.estado} /></p>
              <p><span className="font-semibold text-slate-700">Especies:</span> {selected.especies.join(', ')}</p>
              <p><span className="font-semibold text-slate-700">Variedades:</span> {selected.variedades.join(', ')}</p>
              <p><span className="font-semibold text-slate-700">Lotes:</span> {selected.lotes.join(', ')}</p>
              <p><span className="font-semibold text-slate-700">Observaciones:</span> {selected.observaciones || 'Sin observaciones'}</p>
            </div>

            <div className="mt-4 space-y-2">
              <label className="text-sm font-semibold text-slate-700">Observaciones de rechazo (obligatorio si rechaza)</label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={4}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
                placeholder="Describe claramente el motivo del rechazo..."
              />
            </div>

            <div className="mt-5 flex items-center gap-2">
              <button
                type="button"
                onClick={handleApprove}
                disabled={isSaving}
                className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
              >
                {isSaving ? 'Procesando...' : 'Aprobar'}
              </button>
              <button
                type="button"
                onClick={handleReject}
                disabled={isSaving}
                className="rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700 disabled:opacity-60"
              >
                {isSaving ? 'Procesando...' : 'Rechazar'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </DashboardLayout>
  );
}

export default AdminProductionApprovalPage;
