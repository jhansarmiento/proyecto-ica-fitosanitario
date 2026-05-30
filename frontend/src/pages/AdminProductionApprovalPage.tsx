// frontend/src/pages/adminProductionApprovalPage.tsx
import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "../components/layout/DashboardLayout";
import type { DashboardViewKey } from "../types/dashboard.types";
import type { SessionUser } from "../types/auth.types";
import type { ProductionApprovalItem } from "../types/dashboard.types";
import type { UsuarioDTO, RolDTO } from "../types/auth.types";
import { fincaService } from "../services/finca.service";
import { authService } from "../services/auth.service";
import StatusBadge from "../components/ui/StatusBadge";
import Pagination from "../components/ui/Pagination";
import ToastMessage from "../components/ui/ToastMessage";
import EmptyState from "../components/ui/EmptyState";

// Define the type for the backend response
interface BackendSolicitudItem {
  id_lugar_produccion: string;
  nombre_lugar_produccion: string;
  fecha_solicitud: string;
  estado: string;
  numero_registro_ica: string;
  observaciones_administrador?: string;
  productor?: {
    nombre: string;
    apellidos: string;
    numero_identificacion: string;
    correo_electronico: string;
    telefono: string;
  };
  predio?: {
    id_predio: string;
    nombre_predio: string;
    numero_predial: string;
    area_total: number | string;
    vereda?: string;
    municipio?: string;
    departamento?: string;
  }[];
  autorizacionEspecie?: {
    id_especie_vegetal: string;
  }[];
  especies_nombres?: string[];
}

type AdminProductionApprovalPageProps = {
  sessionUser?: SessionUser;
  onGoHome?: () => void;
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

const PAGE_SIZE = 5;

function AdminProductionApprovalPage({
  sessionUser,
  onGoHome,
  onGoUsers,
  onGoRoles,
  onGoAgricultural,
  onGoCatalog,
  onGoApprovalPlaces,
  onGoInspectionsAgenda,
  onGoInspectionsHistory,
  onGoReports,
  onLogout,
}: AdminProductionApprovalPageProps) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "Todos" | "Pendiente" | "Aprobado" | "Rechazado"
  >("Todos");
  const [page, setPage] = useState(1);

  // 💡 ESTADOS REALES: Inicializados vacíos para recibir la data del backend
  const [rows, setRows] = useState<ProductionApprovalItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<ProductionApprovalItem | null>(null);
  const [toast, setToast] = useState<{
    type: "success" | "error" | "info";
    message: string;
  } | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Estados para la asignación de asistentes técnicos
  const [asistentesOptions, setAsistentesOptions] = useState<
    { id: string; label: string }[]
  >([]);
  const [selectedAsistenteId, setSelectedAsistenteId] = useState("");

  // ─── CARGA DE DATOS DESDE EL BACKEND ────────────────────────────────────────
  const cargarSolicitudes = async () => {
    try {
      setLoading(true);
      const respuesta = await fincaService.getSolicitudesPendientesICA();

      // Adaptador de estructura: Convertimos el snake_case relacional al tipo de la UI
      const solicitudesMapeadas: ProductionApprovalItem[] = respuesta.data.map(
        (item: BackendSolicitudItem) => ({
          id: item.id_lugar_produccion,
          nombreLugarProduccion: item.nombre_lugar_produccion,
          productor: item.productor
            ? `${item.productor.nombre} ${item.productor.apellidos}`
            : "Productor Desconocido",
          identificacionProductor:
            item.productor?.numero_identificacion || "N/D",
          telefonoProductor: item.productor?.telefono || "N/D",
          fechaSolicitud: item.fecha_solicitud
            ? item.fecha_solicitud.split("T")[0]
            : "N/D",
          estado:
            item.estado?.toUpperCase() === "PENDIENTE"
              ? "Pendiente"
              : item.estado?.toUpperCase() === "APROBADO"
                ? "Aprobado"
                : "Rechazado",

          // Mapeos geograficos
          municipio: item.predio?.[0]?.municipio || "N/D",
          departamento: item.predio?.[0]?.departamento || "N/D",

          areaTotal: item.predio
            ? item.predio.reduce(
                (acc: number, p: any) => acc + Number(p.area_total || 0),
                0,
              )
            : 0,
          numeroICA: item.numero_registro_ica || "Sin Radicado",
          observaciones: item.observaciones_administrador || "",
          especies: item.especies_nombres || [],
          variedades: [],
          lotes: [],

          // MAPEO REAL DE LA COLECCIÓN DE PREDIOS
          predios:
            item.predio?.map((p) => ({
              id: p.id_predio,
              nombre: p.nombre_predio || "Predio sin nombre",
              codigo: p.numero_predial || "N/D",
              vereda: p.vereda || "N/D",
              municipio: p.municipio || "N/D",
              departamento: p.departamento || "N/D",
              area: Number(p.area_total || 0),
            })) || [],
        }),
      );
      setRows(solicitudesMapeadas);
    } catch (error: any) {
      setToast({
        type: "error",
        message:
          error.message ||
          "No se pudieron cargar las solicitudes del servidor.",
      });
    } finally {
      setLoading(false);
    }
  };

  // Carga los técnicos una sola vez sin saturar el backend
  const cargarAsistentes = async () => {
    try {
      const [usuariosRes, rolesRes] = await Promise.all([
        authService.getUsuarios(),
        authService.getRoles(),
      ]);

      // Mapeamos los roles indexados para una búsqueda rápida
      const mapaRoles = new Map(
        rolesRes.data.map((r: RolDTO) => [r.id_rol, r.nombre_rol.toLowerCase()]),
      );

      // Filtramos los usuarios que cumplan con el rol de asistente técnico
      const tecnicosCalificados = usuariosRes.data
        .filter((u: UsuarioDTO) => {
          const idRolSeguro = u.id_rol || "";
          const nombreRol = mapaRoles.get(idRolSeguro) || "";
          return (
            nombreRol.includes("asistente") || nombreRol.includes("tecnico")
          );
        })
        .map((u: UsuarioDTO) => ({
          id: u.id_usuario,
          label: `${u.nombre} ${u.apellidos} (${u.tarjeta_profesional || "N/D"})`,
        }));

      setAsistentesOptions(tecnicosCalificados);
    } catch (error) {
      console.error(
        "❌ Error al mapear el catálogo de asistentes del ICA:",
        error,
      );
    }
  };

  // dispara ambos flujos en paralelo al cargar la página
  useEffect(() => {
    cargarSolicitudes();
    cargarAsistentes();
  }, []);

  // ─── ACCIONES REALES DE INTERRUPTOR HTTP ─────────────────────────────────────
  const handleApprove = async () => {
    if (!selected) return;

    // Validamos que se haya seleccionado un asistente técnico profesional antes de aprobar
    // Este es un requisito de negocio para garantizar el acompañamiento técnico a los productores.
    if (!selectedAsistenteId) {
      setToast({
        type: "error",
        message:
          "Debe asignar un Asistente Técnico Profesional antes de proceder.",
      });
      return;
    }
    try {
      setIsSaving(true);

      // Enviar la solicitud de aprobación al backend con el número de registro ICA oficial generado y el asistente asignado
      const payloadOficial = {
        numero_registro_ica_oficial: `ICA-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
        id_asistente_asignado: selectedAsistenteId,
      };

      await fincaService.aprobarLugarProduccion(selected.id, payloadOficial);

      setToast({
        type: "success",
        message: `Solicitud aprobada con éxito. Registro Oficial: ${payloadOficial.numero_registro_ica_oficial}`,
      });

      // Limpieza de estados y cierre del Drawer
      setSelected(null);
      cargarSolicitudes(); // Recarga automática de la lista operacional
    } catch (error: any) {
      setToast({
        type: "error",
        message: error.message || "Error al procesar la aprobación.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleReject = async () => {
    if (!selected) return;
    if (!rejectionReason.trim()) {
      setToast({
        type: "error",
        message: "Debes ingresar las observaciones que justifican el rechazo.",
      });
      return;
    }

    try {
      setIsSaving(true);
      await fincaService.rechazarLugarProduccion(selected.id, {
        observaciones: rejectionReason.trim(),
      });

      setToast({
        type: "info",
        message: "La solicitud ha sido rechazada y notificada al productor.",
      });
      setRejectionReason("");
      setSelected(null);
      cargarSolicitudes();
    } catch (error: any) {
      setToast({
        type: "error",
        message: error.message || "Error al procesar el rechazo.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // ─── FILTRADO DE MEMORIA EN CLIENTE ─────────────────────────────────────────
  const filtered = useMemo(() => {
    return rows.filter((r) => {
      const matchesQuery =
        r.nombreLugarProduccion.toLowerCase().includes(query.toLowerCase()) ||
        r.productor.toLowerCase().includes(query.toLowerCase()) ||
        r.departamento.toLowerCase().includes(query.toLowerCase()) ||
        r.numeroICA.toLowerCase().includes(query.toLowerCase());

      const matchesStatus =
        statusFilter === "Todos" ? true : r.estado === statusFilter;
      return matchesQuery && matchesStatus;
    });
  }, [rows, query, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleNavigate = (view: DashboardViewKey) => {
    if (view === "home") onGoHome?.();
    if (view === "users") onGoUsers?.();
    if (view === "roles") onGoRoles?.();
    if (view === "agricultural") onGoAgricultural?.();
    if (view === "catalog") onGoCatalog?.();
    if (view === "approval-places") onGoApprovalPlaces?.();
    if (view === "inspections-agenda") onGoInspectionsAgenda?.();
    if (view === "inspections-history") onGoInspectionsHistory?.();
    if (view === "reports") onGoReports?.();
  };

  return (
    <DashboardLayout
      title="Aprobación de Lugares de Producción"
      subtitle="Gestión de solicitudes para administrador ICA"
      activeView="approval-places"
      sessionUser={sessionUser}
      onNavigate={handleNavigate}
      onLogout={onLogout}
    >
      <div className="space-y-4">
        {toast ? (
          <ToastMessage type={toast.type} message={toast.message} />
        ) : null}

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="grid gap-3 md:grid-cols-3">
            <input
              type="text"
              placeholder="Buscar por lugar, productor, municipio..."
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
              className="rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-400"
            />
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value as any);
                setPage(1);
              }}
              className="rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-400"
            >
              <option value="Todos">Todos los estados</option>
              <option value="Pendiente">Pendientes</option>
              <option value="Aprobado">Aprobados</option>
              <option value="Rechazado">Rechazados</option>
            </select>
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600 flex items-center justify-between">
              <span>Total solicitudes:</span>
              <span className="font-bold text-slate-800">
                {filtered.length}
              </span>
            </div>
          </div>
        </div>

        {/* Estado de Carga */}
        {loading && (
          <div className="p-12 text-center text-sm text-slate-500 animate-pulse bg-white border border-slate-200 rounded-2xl">
            Consultando registros en el sistema fitosanitario...
          </div>
        )}

        {!loading && (
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            {paginated.length === 0 ? (
              <div className="p-6">
                <EmptyState
                  title="No hay solicitudes para mostrar"
                  description="No se registran trámites pendientes en esta sección."
                />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-slate-50 text-left text-slate-600">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Lugar</th>
                      <th className="px-4 py-3 font-semibold">Productor</th>
                      <th className="px-4 py-3 font-semibold">
                        Fecha solicitud
                      </th>
                      <th className="px-4 py-3 font-semibold">Estado</th>
                      <th className="px-4 py-3 font-semibold">Departamento</th>
                      <th className="px-4 py-3 font-semibold">Área total</th>
                      <th className="px-4 py-3 font-semibold">Radicado ICA</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginated.map((row) => (
                      <tr
                        key={row.id}
                        onClick={() => setSelected(row)}
                        className="cursor-pointer border-t border-slate-100 transition hover:bg-emerald-50/40"
                      >
                        <td className="px-4 py-3 font-semibold text-slate-800">
                          {row.nombreLugarProduccion}
                        </td>
                        <td className="px-4 py-3 text-slate-700">
                          {row.productor}
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          {row.fechaSolicitud}
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge status={row.estado} />
                        </td>
                        <td className="px-4 py-3 text-slate-700">
                          {row.departamento}
                        </td>
                        <td className="px-4 py-3 text-slate-700">
                          {row.areaTotal.toFixed(2)} ha
                        </td>
                        <td className="px-4 py-3 text-slate-600 font-mono">
                          {row.numeroICA}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <div className="px-4 pb-4">
              <Pagination
                page={page}
                totalPages={totalPages}
                onPageChange={setPage}
              />
            </div>
          </div>
        )}
      </div>

      {/* Panel lateral de revisión (Drawer) */}
      {selected ? (
        <div className="fixed inset-0 z-50 flex">
          <div
            className="flex-1 bg-black/35 backdrop-blur-[1px]"
            onClick={() => setSelected(null)}
          />
          <div className="h-full w-full max-w-2xl overflow-y-auto border-l border-slate-200 bg-white p-6 shadow-2xl animate-in slide-in-from-right duration-200">
            <div className="mb-4 flex items-start justify-between">
              <div>
                <h3 className="text-xl font-bold text-slate-900">
                  {selected.nombreLugarProduccion}
                </h3>
                <p className="text-sm text-slate-500">
                  Auditoría de datos básicos de la solicitud
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="rounded-xl border border-slate-300 px-4 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
              >
                Cerrar
              </button>
            </div>

            <div className="grid gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              <p>
                <span className="font-semibold text-slate-800">
                  Productor Responsable:
                </span>{" "}
                {selected.productor}
              </p>
              <p>
                <span className="font-semibold text-slate-800">
                  Número de Identificación:
                </span>{" "}
                <span className="bg-white px-1.5 py-0.5 rounded border font-mono text-xs">
                  {selected.identificacionProductor}
                </span>
              </p>
              <p>
                <span className="font-semibold text-slate-800">Teléfono:</span>{" "}
                {selected.telefonoProductor}
              </p>
              <p>
                <span className="font-semibold text-slate-800">
                  Departamento Principal:
                </span>{" "}
                {selected.departamento}
              </p>
              <p>
                <span className="font-semibold text-slate-800">
                  Área Consolidada Terreno:
                </span>{" "}
                {selected.areaTotal.toFixed(2)} ha
              </p>
              <p>
                <span className="font-semibold text-slate-800">
                  Código Radicado Provisional:
                </span>{" "}
                <span className="font-mono bg-white px-1.5 py-0.5 rounded border">
                  {selected.numeroICA}
                </span>
              </p>
              <p>
                <span className="font-semibold text-slate-800">
                  Estado del Trámite:
                </span>{" "}
                <StatusBadge status={selected.estado} />
              </p>
              <p>
                <span className="font-semibold text-slate-800">
                  Observaciones Previas:
                </span>{" "}
                {selected.observaciones || "Sin registros previos"}
              </p>
            </div>

            {/* LISTADO DE PREDIOS ASOCIADOS PARA AUDITORÍA ICA */}
            <div className="mt-5 space-y-2">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Terrenos y Predios Vinculados ({selected.predios?.length})
              </h4>
              <div className="grid gap-2 sm:grid-cols-2">
                {selected.predios?.map((predio) => (
                  <div
                    key={predio.id}
                    className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm transition hover:border-slate-300"
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <span className="font-bold text-sm text-slate-800 line-clamp-1">
                        {predio.nombre}
                      </span>
                      <span className="text-xs font-semibold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full shrink-0">
                        {predio.area} ha
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 font-mono mb-1.5">
                      Código: {predio.codigo}
                    </p>
                    <div className="text-xs text-slate-600 bg-slate-50 p-1.5 rounded-lg border border-slate-150">
                      <span className="font-medium text-slate-700">
                        Ubicación:
                      </span>{" "}
                      Vda. {predio.vereda}, {predio.municipio} (
                      {predio.departamento})
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 🌟 NUEVO: LISTADO DE ESPECIES VEGETALES */}
            <div className="mt-5 space-y-2">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Especies Vegetales Autorizadas
              </h4>
              <div className="flex flex-wrap gap-2">
                 {selected.especies && selected.especies.length > 0 ? (
                    selected.especies.map((esp, idx) => (
                       <span key={idx} className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-xs font-bold border border-emerald-200">
                          {esp}
                       </span>
                    ))
                 ) : (
                    <span className="text-sm text-slate-500 italic">No se especificaron especies</span>
                 )}
              </div>
            </div>

            {/* Acciones si la solicitud está pendiente */}
            {selected.estado === "Pendiente" && (
              <>
                <div className="mt-5 space-y-2">
                  <label className="text-sm font-semibold text-slate-700 block">
                    Asignar Asistente Técnico Profesional (Obligatorio para
                    aprobación)
                  </label>
                  <select
                    value={selectedAsistenteId}
                    onChange={(e) => setSelectedAsistenteId(e.target.value)}
                    className="w-full h-11 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100 transition"
                  >
                    <option value="">
                      -- Seleccione un asistente técnico disponible --
                    </option>
                    {asistentesOptions.map((tecnico) => (
                      <option key={tecnico.id} value={tecnico.id}>
                        {tecnico.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mt-4 space-y-2">
                  <label className="text-sm font-semibold text-slate-700">
                    Observaciones de rechazo (Obligatorio en caso de
                    desaprobación)
                  </label>
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    rows={4}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-400 transition"
                    placeholder="Escriba aquí los motivos técnicos de inconformidad..."
                  />
                </div>

                <div className="mt-5 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleApprove}
                    disabled={isSaving}
                    className="rounded-xl bg-emerald-600 px-5 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:bg-slate-200"
                  >
                    {isSaving ? "Procesando..." : "Aprobar Lugar"}
                  </button>
                  <button
                    type="button"
                    onClick={handleReject}
                    disabled={isSaving}
                    className="rounded-xl bg-rose-600 px-5 py-2 text-sm font-semibold text-white hover:bg-rose-700 disabled:bg-slate-200"
                  >
                    {isSaving ? "Procesando..." : "Rechazar Solicitud"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      ) : null}
    </DashboardLayout>
  );
}

export default AdminProductionApprovalPage;
