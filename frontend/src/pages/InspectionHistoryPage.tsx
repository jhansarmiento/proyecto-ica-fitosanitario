import { useMemo, useState } from 'react';
import {
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  ClipboardList,
  Filter,
  Search,
  ShieldCheck,
  X,
  XCircle,
} from 'lucide-react';
import DashboardLayout, { type DashboardViewKey } from '../components/layout/DashboardLayout';
import type { SessionUser } from '../App';

type InspectionResult = 'Aprobado' | 'Con Hallazgos' | 'Rechazado';
type InspectionRecordType = 'Ejecutada' | 'Solicitada';

type InspectionHistoryItem = {
  idInspeccion: string;
  fechaEjecucion: string;
  predio: string;
  cultivo: string;
  resultado: InspectionResult;
  tipo: InspectionRecordType;
};

type InspectionHistoryPageProps = {
  sessionUser?: SessionUser;
  onGoHome?: () => void;
  onGoUsers?: () => void;
  onGoRoles?: () => void;
  onGoAgricultural?: () => void;
  onGoApprovalPlaces?: () => void;
  onGoInspectionsAgenda?: () => void;
  onLogout?: () => void;
};

type RequestStep = 1 | 2;

type RequestFormState = {
  lugarProduccion: string;
  fechaProgramada: string;
  horaProgramada: string;
  tecnico: string;
  observaciones: string;
  confirmar: boolean;
};

const historySeed: InspectionHistoryItem[] = [
  {
    idInspeccion: 'INS-2026-0012',
    fechaEjecucion: '2026-05-16 09:20',
    predio: 'Finca Los Naranjos',
    cultivo: 'Cítricos',
    resultado: 'Aprobado',
    tipo: 'Ejecutada',
  },
  {
    idInspeccion: 'INS-2026-0011',
    fechaEjecucion: '2026-05-15 14:10',
    predio: 'Predio Palmas del Sol',
    cultivo: 'Palma',
    resultado: 'Con Hallazgos',
    tipo: 'Ejecutada',
  },
  {
    idInspeccion: 'INS-2026-0010',
    fechaEjecucion: '2026-05-14 08:55',
    predio: 'Hacienda El Cedro',
    cultivo: 'Cacao',
    resultado: 'Rechazado',
    tipo: 'Ejecutada',
  },
  {
    idInspeccion: 'INS-2026-0009',
    fechaEjecucion: '2026-05-13 11:40',
    predio: 'Finca Bella Vista',
    cultivo: 'Banano',
    resultado: 'Aprobado',
    tipo: 'Ejecutada',
  },
  {
    idInspeccion: 'INS-2026-0008',
    fechaEjecucion: '2026-05-12 16:00',
    predio: 'Parcela San Jorge',
    cultivo: 'Arroz',
    resultado: 'Con Hallazgos',
    tipo: 'Ejecutada',
  },
  {
    idInspeccion: 'INS-2026-0007',
    fechaEjecucion: '2026-05-11 10:30',
    predio: 'Predio El Molino',
    cultivo: 'Café',
    resultado: 'Aprobado',
    tipo: 'Ejecutada',
  },
];

const resultClasses: Record<InspectionResult, string> = {
  Aprobado: 'bg-emerald-100 text-emerald-700',
  'Con Hallazgos': 'bg-amber-100 text-amber-700',
  Rechazado: 'bg-rose-100 text-rose-700',
};

const initialRequestForm: RequestFormState = {
  lugarProduccion: '',
  fechaProgramada: '',
  horaProgramada: '',
  tecnico: '',
  observaciones: '',
  confirmar: false,
};

function buildInspectionId(currentSize: number) {
  const nextNumber = currentSize + 1;
  return `INS-2026-${String(nextNumber).padStart(4, '0')}`;
}

export default function InspectionHistoryPage({
  sessionUser,
  onGoHome,
  onGoUsers,
  onGoRoles,
  onGoAgricultural,
  onGoApprovalPlaces,
  onGoInspectionsAgenda,
  onLogout,
}: InspectionHistoryPageProps) {
  const [rows, setRows] = useState<InspectionHistoryItem[]>(historySeed);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [resultFilter, setResultFilter] = useState<'Todos' | InspectionResult>('Todos');
  const [dateFilter, setDateFilter] = useState('');
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [requestStep, setRequestStep] = useState<RequestStep>(1);
  const [requestForm, setRequestForm] = useState<RequestFormState>(initialRequestForm);
  const [requestFeedback, setRequestFeedback] = useState<string | null>(null);

  const pageSize = 6;

  const filteredRows = useMemo(() => {
    const query = search.toLowerCase().trim();

    return rows.filter((row) => {
      const bySearch = query
        ? row.idInspeccion.toLowerCase().includes(query) ||
          row.predio.toLowerCase().includes(query) ||
          row.cultivo.toLowerCase().includes(query)
        : true;

      const byResult = resultFilter === 'Todos' ? true : row.resultado === resultFilter;
      const byDate = dateFilter ? row.fechaEjecucion.startsWith(dateFilter) : true;

      return bySearch && byResult && byDate;
    });
  }, [rows, search, resultFilter, dateFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize));

  const pagedRows = useMemo(() => {
    return filteredRows.slice((page - 1) * pageSize, page * pageSize);
  }, [filteredRows, page]);

  const kpis = useMemo(() => {
    const total = rows.length;
    const aprobadas = rows.filter((r) => r.resultado === 'Aprobado').length;
    const conHallazgos = rows.filter((r) => r.resultado === 'Con Hallazgos').length;
    const rechazadas = rows.filter((r) => r.resultado === 'Rechazado').length;
    return { total, aprobadas, conHallazgos, rechazadas };
  }, [rows]);

  const resetRequestModal = () => {
    setRequestStep(1);
    setRequestForm(initialRequestForm);
    setRequestFeedback(null);
  };

  const openRequestModal = () => {
    resetRequestModal();
    setIsRequestModalOpen(true);
  };

  const closeRequestModal = () => {
    setIsRequestModalOpen(false);
    resetRequestModal();
  };

  const handleNavigate = (view: DashboardViewKey) => {
    if (view === 'home') onGoHome?.();
    if (view === 'users') onGoUsers?.();
    if (view === 'roles') onGoRoles?.();
    if (view === 'agricultural') onGoAgricultural?.();
    if (view === 'approval-places') onGoApprovalPlaces?.();
    if (view === 'inspections-agenda') onGoInspectionsAgenda?.();
  };

  const canGoToStep2 =
    requestForm.lugarProduccion.trim() &&
    requestForm.fechaProgramada &&
    requestForm.horaProgramada &&
    requestForm.tecnico.trim();

  const submitRequest = () => {
    if (!requestForm.confirmar) return;

    const newRecord: InspectionHistoryItem = {
      idInspeccion: buildInspectionId(rows.length),
      fechaEjecucion: `${requestForm.fechaProgramada} ${requestForm.horaProgramada}`,
      predio: requestForm.lugarProduccion,
      cultivo: 'Por definir',
      resultado: 'Con Hallazgos',
      tipo: 'Solicitada',
    };

    setRows((prev) => [newRecord, ...prev]);
    setPage(1);
    setRequestFeedback('Solicitud creada exitosamente. Se agregó al historial para seguimiento.');
    setTimeout(() => {
      closeRequestModal();
    }, 1000);
  };

  return (
    <DashboardLayout
      title="Historial de Inspecciones"
      subtitle="Consulta inspecciones ejecutadas y realiza nuevas solicitudes"
      sessionUser={sessionUser}
      activeView="inspections-history"
      onNavigate={handleNavigate}
      onLogout={onLogout}
    >
      <section className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Total Registros</p>
                <p className="mt-1 text-3xl font-bold text-slate-900">{kpis.total}</p>
              </div>
              <ClipboardList className="text-emerald-700" size={24} />
            </div>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Aprobadas</p>
                <p className="mt-1 text-3xl font-bold text-slate-900">{kpis.aprobadas}</p>
              </div>
              <CheckCircle2 className="text-emerald-600" size={24} />
            </div>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Con Hallazgos</p>
                <p className="mt-1 text-3xl font-bold text-slate-900">{kpis.conHallazgos}</p>
              </div>
              <ShieldCheck className="text-amber-600" size={24} />
            </div>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Rechazadas</p>
                <p className="mt-1 text-3xl font-bold text-slate-900">{kpis.rechazadas}</p>
              </div>
              <XCircle className="text-rose-600" size={24} />
            </div>
          </article>
        </div>

        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-4 border-b border-slate-100 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
            <h2 className="text-lg font-bold text-slate-900">Histórico de inspecciones</h2>
            <button
              type="button"
              onClick={openRequestModal}
              className="inline-flex items-center justify-center rounded-xl bg-emerald-800 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-900"
            >
              Solicitar Inspección
            </button>
          </div>

          <div className="grid gap-3 border-b border-slate-100 px-4 py-4 md:grid-cols-4">
            <div className="relative md:col-span-2">
              <Search className="pointer-events-none absolute left-3 top-2.5 text-slate-400" size={18} />
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Buscar por ID, predio o cultivo..."
                className="w-full rounded-xl border border-slate-300 py-2 pl-10 pr-3 text-sm outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
              />
            </div>

            <select
              value={resultFilter}
              onChange={(e) => {
                setResultFilter(e.target.value as 'Todos' | InspectionResult);
                setPage(1);
              }}
              className="rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
            >
              <option value="Todos">Resultado: Todos</option>
              <option value="Aprobado">Aprobado</option>
              <option value="Con Hallazgos">Con Hallazgos</option>
              <option value="Rechazado">Rechazado</option>
            </select>

            <input
              type="date"
              value={dateFilter}
              onChange={(e) => {
                setDateFilter(e.target.value);
                setPage(1);
              }}
              className="rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
            />
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-left text-slate-600">
                <tr>
                  <th className="px-4 py-3 font-semibold">ID Inspección</th>
                  <th className="px-4 py-3 font-semibold">Fecha de Ejecución</th>
                  <th className="px-4 py-3 font-semibold">Finca / Predio</th>
                  <th className="px-4 py-3 font-semibold">Cultivo</th>
                  <th className="px-4 py-3 font-semibold">Resultado</th>
                  <th className="px-4 py-3 font-semibold">Tipo</th>
                </tr>
              </thead>
              <tbody>
                {pagedRows.map((row) => (
                  <tr key={row.idInspeccion} className="border-t border-slate-100 transition hover:bg-slate-50/60">
                    <td className="px-4 py-3 font-semibold text-slate-800">{row.idInspeccion}</td>
                    <td className="px-4 py-3 text-slate-600">{row.fechaEjecucion}</td>
                    <td className="px-4 py-3 text-slate-700">{row.predio}</td>
                    <td className="px-4 py-3 text-slate-700">{row.cultivo}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${resultClasses[row.resultado]}`}>
                        {row.resultado}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                          row.tipo === 'Solicitada' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {row.tipo}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {pagedRows.length === 0 ? (
              <div className="p-8 text-center">
                <Filter className="mx-auto text-slate-400" size={20} />
                <p className="mt-2 text-sm font-semibold text-slate-700">No hay resultados con los filtros actuales.</p>
              </div>
            ) : null}
          </div>

          <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3">
            <p className="text-xs text-slate-500">
              Mostrando {filteredRows.length === 0 ? 0 : (page - 1) * pageSize + 1} -{' '}
              {Math.min(page * pageSize, filteredRows.length)} de {filteredRows.length}
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                className="rounded-lg border border-slate-300 p-1.5 text-slate-600 disabled:opacity-50"
                disabled={page === 1}
              >
                <ChevronLeft size={16} />
              </button>
              <span className="text-sm font-semibold text-slate-700">
                {page}/{totalPages}
              </span>
              <button
                type="button"
                onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                className="rounded-lg border border-slate-300 p-1.5 text-slate-600 disabled:opacity-50"
                disabled={page === totalPages}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </section>
      </section>

      {isRequestModalOpen ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 p-4">
          <div className="w-full max-w-3xl rounded-2xl bg-white shadow-2xl">
            <div className="flex items-start justify-between rounded-t-2xl bg-emerald-900 px-5 py-4 text-white">
              <div>
                <h3 className="text-2xl font-bold">Nueva Solicitud</h3>
                <p className="text-sm text-emerald-100">Paso {requestStep} de 2</p>
              </div>
              <button type="button" onClick={closeRequestModal} className="rounded-lg p-1 hover:bg-white/10">
                <X size={22} />
              </button>
            </div>

            <div className="px-5 pt-4">
              <div className="flex items-center gap-3 text-xs font-semibold">
                <span
                  className={`inline-flex h-6 w-6 items-center justify-center rounded-full ${
                    requestStep >= 1 ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  1
                </span>
                <span className={requestStep >= 1 ? 'text-emerald-700' : 'text-slate-500'}>Programación</span>
                <span className="h-px flex-1 bg-slate-200" />
                <span
                  className={`inline-flex h-6 w-6 items-center justify-center rounded-full ${
                    requestStep >= 2 ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  2
                </span>
                <span className={requestStep >= 2 ? 'text-emerald-700' : 'text-slate-500'}>Confirmación</span>
              </div>
            </div>

            <div className="space-y-4 px-5 py-5">
              {requestStep === 1 ? (
                <>
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-slate-700">Lugar de Producción</label>
                    <input
                      type="text"
                      value={requestForm.lugarProduccion}
                      onChange={(e) => setRequestForm((prev) => ({ ...prev, lugarProduccion: e.target.value }))}
                      placeholder="Ej: Finca Los Naranjos"
                      className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
                    />
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-sm font-semibold text-slate-700">Fecha Programada</label>
                      <div className="relative">
                        <CalendarDays className="pointer-events-none absolute left-3 top-2.5 text-slate-400" size={18} />
                        <input
                          type="date"
                          value={requestForm.fechaProgramada}
                          onChange={(e) => setRequestForm((prev) => ({ ...prev, fechaProgramada: e.target.value }))}
                          className="w-full rounded-xl border border-slate-300 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="mb-1 block text-sm font-semibold text-slate-700">Hora Programada</label>
                      <div className="relative">
                        <Clock3 className="pointer-events-none absolute left-3 top-2.5 text-slate-400" size={18} />
                        <input
                          type="time"
                          value={requestForm.horaProgramada}
                          onChange={(e) => setRequestForm((prev) => ({ ...prev, horaProgramada: e.target.value }))}
                          className="w-full rounded-xl border border-slate-300 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-semibold text-slate-700">Técnico Inspector</label>
                    <input
                      type="text"
                      value={requestForm.tecnico}
                      onChange={(e) => setRequestForm((prev) => ({ ...prev, tecnico: e.target.value }))}
                      placeholder="Ej: Julio Barrera"
                      className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3">
                    <p className="text-sm font-semibold text-emerald-800">Solicitud lista para confirmar</p>
                    <p className="text-sm text-emerald-700">Verifica la información antes de enviarla.</p>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                      <p className="text-xs uppercase text-slate-500">Lugar de Producción</p>
                      <p className="text-sm font-semibold text-slate-800">{requestForm.lugarProduccion}</p>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                      <p className="text-xs uppercase text-slate-500">Técnico</p>
                      <p className="text-sm font-semibold text-slate-800">{requestForm.tecnico}</p>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                      <p className="text-xs uppercase text-slate-500">Fecha</p>
                      <p className="text-sm font-semibold text-slate-800">{requestForm.fechaProgramada}</p>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                      <p className="text-xs uppercase text-slate-500">Hora</p>
                      <p className="text-sm font-semibold text-slate-800">{requestForm.horaProgramada}</p>
                    </div>
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-semibold text-slate-700">Observaciones adicionales</label>
                    <textarea
                      value={requestForm.observaciones}
                      onChange={(e) => setRequestForm((prev) => ({ ...prev, observaciones: e.target.value }))}
                      rows={3}
                      placeholder="Observaciones para la inspección"
                      className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
                    />
                  </div>

                  <label className="inline-flex items-center gap-2 text-sm text-slate-700">
                    <input
                      type="checkbox"
                      checked={requestForm.confirmar}
                      onChange={(e) => setRequestForm((prev) => ({ ...prev, confirmar: e.target.checked }))}
                    />
                    Confirmo que los datos son correctos y autorizo la solicitud
                  </label>
                </>
              )}

              {requestFeedback ? (
                <p className="rounded-lg bg-emerald-100 px-3 py-2 text-sm font-semibold text-emerald-800">{requestFeedback}</p>
              ) : null}
            </div>

            <div className="flex items-center justify-between border-t border-slate-100 px-5 py-4">
              <button
                type="button"
                onClick={closeRequestModal}
                className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Cancelar
              </button>

              <div className="flex items-center gap-2">
                {requestStep === 2 ? (
                  <button
                    type="button"
                    onClick={() => setRequestStep(1)}
                    className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    Anterior
                  </button>
                ) : null}

                {requestStep === 1 ? (
                  <button
                    type="button"
                    onClick={() => setRequestStep(2)}
                    disabled={!canGoToStep2}
                    className="rounded-xl bg-emerald-800 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-900 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Siguiente
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={submitRequest}
                    disabled={!requestForm.confirmar}
                    className="rounded-xl bg-emerald-800 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-900 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Enviar Solicitud
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </DashboardLayout>
  );
}
