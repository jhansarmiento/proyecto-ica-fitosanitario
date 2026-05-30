// frontend/src/pages/InspectionHistoryPage.tsx
import { useCallback, useMemo, useState, useEffect } from "react";
import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Clock3,
  MapPin,
  Search,
  User,
} from "lucide-react";
import DashboardLayout from "../components/layout/DashboardLayout";
import type { DashboardViewKey } from "../types/dashboard.types";
import SkeletonBlock from "../components/ui/SkeletonBlock";
import type { SessionUser } from "../types/auth.types";
import InspectionDetailsModal from "../components/ui/InspectionDetailsModal";
import { fincaService } from "../services/finca.service";

type InspectionHistoryPageProps = {
  sessionUser?: SessionUser;
  onGoHome?: () => void;
  onGoUsers?: () => void;
  onGoRoles?: () => void;
  onGoAgricultural?: () => void;
  onGoCatalog?: () => void;
  onGoApprovalPlaces?: () => void;
  onGoInspectionsAgenda?: () => void;
  onGoReports?: () => void;
  onLogout?: () => void;
};

// ─── Helpers de estado ───────────────────────────────────────────────────────
const ESTADO_LABEL: Record<string, string> = {
  SOLICITADA: "Solicitada",
  PROGRAMADA: "Programada",
  REALIZADA: "Realizada",
  RECHAZADA: "Rechazada",
  CANCELADA: "Cancelada",
};

const ESTADO_BADGE: Record<string, string> = {
  SOLICITADA: "bg-blue-100 text-blue-700 border-blue-200",
  PROGRAMADA: "bg-amber-100 text-amber-700 border-amber-200",
  REALIZADA: "bg-emerald-100 text-emerald-700 border-emerald-200",
  RECHAZADA: "bg-rose-100 text-rose-700 border-rose-200",
  CANCELADA: "bg-slate-100 text-slate-600 border-slate-200",
};

const ESTADO_DOT: Record<string, string> = {
  SOLICITADA: "bg-blue-500",
  PROGRAMADA: "bg-amber-500",
  REALIZADA: "bg-emerald-500",
  RECHAZADA: "bg-rose-500",
  CANCELADA: "bg-slate-400",
};

function EstadoBadge({ estado }: { estado: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${ESTADO_BADGE[estado] ?? "bg-slate-100 text-slate-600"}`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${ESTADO_DOT[estado] ?? "bg-slate-400"}`}
      />
      {ESTADO_LABEL[estado] ?? estado}
    </span>
  );
}

// ─── Formatters ──────────────────────────────────────────────────────────────
function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("es-CO", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

function TableSkeleton({ cols }: { cols: number }) {
  return (
    <>
      {Array.from({ length: 5 }).map((_, i) => (
        <tr key={i} className="border-b border-slate-100">
          {Array.from({ length: cols }).map((_, j) => (
            <td key={j} className="px-4 py-3">
              <SkeletonBlock className="h-4 w-full" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

const PAGE_SIZE = 8;

export default function InspectionHistoryPage({
  sessionUser,
  onGoHome,
  onGoUsers,
  onGoRoles,
  onGoAgricultural,
  onGoCatalog,
  onGoApprovalPlaces,
  onGoInspectionsAgenda,
  onGoReports,
  onLogout,
}: InspectionHistoryPageProps) {
  const rol = sessionUser?.rol?.toLowerCase() ?? "";
  const isAdminOrTecnico = rol === "administrador" || rol.includes("asistente");

  // ── Data ──────────────────────────────────────────────────────────────────
  const [solicitudes, setSolicitudes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ── UI ────────────────────────────────────────────────────────────────────
  const [search, setSearch] = useState("");
  const [estadoFilter, setEstadoFilter] = useState<string>("Todos");
  const [page, setPage] = useState(1);
  const [selectedSolicitud, setSelectedSolicitud] = useState<any | null>(null);

  // ── Fetch ─────────────────────────────────────────────────────────────────
  const fetchSolicitudes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // 🌟 LLAMADA DIRECTA: No necesitamos pasarle el ID, el Backend lo lee del Token JWT
      const res = await fincaService.getSolicitudesInspeccion();
      
      console.log("✅ Datos recibidos del backend:", res.data);
      
      const arregloDatos = Array.isArray(res.data) ? res.data : (res as any).data?.data ?? [];
      setSolicitudes(arregloDatos);
    } catch (err) {
      console.error("❌ Error en la petición:", err);
      setError(err instanceof Error ? err.message : 'Error al cargar las solicitudes.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSolicitudes();
  }, [fetchSolicitudes]);
  // ── Filtros ───────────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return solicitudes.filter((s) => {
      const lugar = s.lugar_nombre ?? "";
      const asistente = s.asistente_nombre ?? "";

      const bySearch = q
        ? lugar.toLowerCase().includes(q) || asistente.toLowerCase().includes(q)
        : true;
      const byEstado =
        estadoFilter === "Todos" ? true : s.estado === estadoFilter;

      return bySearch && byEstado;
    });
  }, [solicitudes, search, estadoFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = useMemo(
    () => filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [filtered, page],
  );

  // ── KPIs ──────────────────────────────────────────────────────────────────
  const kpis = useMemo(
    () => ({
      total: solicitudes.length,
      solicitadas: solicitudes.filter((s) => s.estado === "SOLICITADA").length,
      programadas: solicitudes.filter((s) => s.estado === "PROGRAMADA").length,
      realizadas: solicitudes.filter((s) => s.estado === "REALIZADA").length,
    }),
    [solicitudes],
  );

  const handleNavigate = (view: DashboardViewKey) => {
    if (view === "home") onGoHome?.();
    if (view === "users") onGoUsers?.();
    if (view === "roles") onGoRoles?.();
    if (view === "agricultural") onGoAgricultural?.();
    if (view === "catalog") onGoCatalog?.();
    if (view === "approval-places") onGoApprovalPlaces?.();
    if (view === "inspections-agenda") onGoInspectionsAgenda?.();
    if (view === "reports") onGoReports?.();
  };

  return (
    <DashboardLayout
      title="Historial de Inspecciones"
      subtitle="Consulta y gestiona todo el ciclo de vida de las inspecciones fitosanitarias"
      sessionUser={sessionUser}
      activeView="inspections-history"
      onNavigate={handleNavigate}
      onLogout={onLogout}
    >
      <section className="space-y-6">
        {/* KPIs */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm flex justify-between">
            <div>
              <p className="text-xs font-semibold uppercase text-slate-500">
                Total Solicitudes
              </p>
              <p className="mt-1 text-3xl font-bold">{kpis.total}</p>
            </div>
            <div className="rounded-xl p-2 bg-slate-100 text-slate-600 h-fit">
              <ClipboardList size={22} />
            </div>
          </article>
          <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm flex justify-between">
            <div>
              <p className="text-xs font-semibold uppercase text-slate-500">
                Solicitadas
              </p>
              <p className="mt-1 text-3xl font-bold">{kpis.solicitadas}</p>
            </div>
            <div className="rounded-xl p-2 bg-blue-100 text-blue-600 h-fit">
              <Clock3 size={22} />
            </div>
          </article>
          <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm flex justify-between">
            <div>
              <p className="text-xs font-semibold uppercase text-slate-500">
                Programadas
              </p>
              <p className="mt-1 text-3xl font-bold">{kpis.programadas}</p>
            </div>
            <div className="rounded-xl p-2 bg-amber-100 text-amber-600 h-fit">
              <CalendarDays size={22} />
            </div>
          </article>
          <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm flex justify-between">
            <div>
              <p className="text-xs font-semibold uppercase text-slate-500">
                Realizadas
              </p>
              <p className="mt-1 text-3xl font-bold">{kpis.realizadas}</p>
            </div>
            <div className="rounded-xl p-2 bg-emerald-100 text-emerald-600 h-fit">
              <CheckCircle2 size={22} />
            </div>
          </article>
        </div>

        {/* Barra de herramientas */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                placeholder="Buscar lugar o técnico..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="h-9 w-64 rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm focus:border-emerald-400 focus:outline-none"
              />
            </div>
            <select
              value={estadoFilter}
              onChange={(e) => {
                setEstadoFilter(e.target.value);
                setPage(1);
              }}
              className="h-9 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 focus:border-emerald-400 focus:outline-none"
            >
              <option value="Todos">Todos los estados</option>
              <option value="SOLICITADA">Solicitadas</option>
              <option value="PROGRAMADA">Programadas</option>
              <option value="REALIZADA">Realizadas</option>
              <option value="RECHAZADA">Rechazadas</option>
            </select>
          </div>
        </div>

        {/* Tabla */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <th className="px-4 py-3">Fecha Solicitud</th>
                  <th className="px-4 py-3">Lugar Producción</th>
                  <th className="px-4 py-3">Asistente Asignado</th>
                  <th className="px-4 py-3">Fecha Inspección</th>
                  <th className="px-4 py-3">Estado</th>
                  <th className="px-4 py-3 text-center">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <TableSkeleton cols={6} />
                ) : error ? (
                  // 🌟 LEEMOS EL ERROR: Renderizado elegante del cuadro de alerta si la petición falla
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center">
                      <div className="flex flex-col items-center gap-2 text-rose-600">
                        <AlertCircle size={36} />
                        <p className="font-bold">
                          Error al cargar el historial
                        </p>
                        <p className="text-xs text-slate-500">{error}</p>
                        <button
                          type="button"
                          onClick={fetchSolicitudes}
                          className="mt-2 px-4 py-1.5 bg-emerald-800 text-white rounded-xl text-xs font-bold hover:bg-emerald-900 transition"
                        >
                          Reintentar
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : paged.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-12 text-center text-slate-400 italic"
                    >
                      No se registraron trámites fitosanitarios con los
                      criterios seleccionados.
                    </td>
                  </tr>
                ) : (
                  paged.map((s) => (
                    <tr
                      key={s.id_solicitud}
                      className="hover:bg-slate-50 transition-colors"
                    >
                      <td className="px-4 py-3 font-medium text-slate-700">
                        {formatDate(s.fecha_creacion)}
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-bold text-slate-800">
                          {s.lugar_nombre}
                        </p>
                        <p className="text-[11px] text-slate-500 flex items-center gap-1">
                          <MapPin size={10} /> {s.lugar_ubicacion}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-slate-700 flex items-center gap-1.5">
                          <User size={13} className="text-emerald-600" />
                          {s.asistente_nombre}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {s.fecha_programada ? (
                          <span className="font-semibold">
                            {formatDate(s.fecha_programada)}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">
                            Tentativa: {formatDate(s.fecha_tentativa)}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <EstadoBadge estado={s.estado} />
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => setSelectedSolicitud(s)}
                          className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700 transition"
                        >
                          Ver Detalles
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Paginación */}
          {!loading && filtered.length > PAGE_SIZE && (
            <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3">
              <p className="text-xs text-slate-500">
                Mostrando {(page - 1) * PAGE_SIZE + 1}–
                {Math.min(page * PAGE_SIZE, filtered.length)} de{" "}
                {filtered.length}
              </p>
              <div className="flex items-center gap-1">
                <button
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 bg-white text-slate-600 disabled:opacity-40"
                >
                  <ChevronLeft size={15} />
                </button>
                <button
                  disabled={page === totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 bg-white text-slate-600 disabled:opacity-40"
                >
                  <ChevronRight size={15} />
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Modal Inteligente Reciclado */}
      <InspectionDetailsModal
        isOpen={!!selectedSolicitud}
        solicitud={selectedSolicitud}
        esTecnico={isAdminOrTecnico}
        onClose={() => setSelectedSolicitud(null)}
        onSuccess={() => {
          setSelectedSolicitud(null);
          fetchSolicitudes();
        }}
      />
    </DashboardLayout>
  );
}
