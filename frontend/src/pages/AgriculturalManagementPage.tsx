// frontend/src/pages/AgriculturalManagementPage.tsx
import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Plus,
  MapPin,
  Database,
  Leaf,
  Layers3,
  Eye,
  Pencil,
  FileText,
} from "lucide-react";
import NewProductionPlaceModal from "../components/ui/NewProductionPlaceModal";
import EditProductionPlaceModal from "../components/ui/EditProductionPlaceModal";
import DashboardLayout from "../components/layout/DashboardLayout";
import { request } from "../services/apiClient";

import type { ApiEnvelope } from "../types/api.types";
import type { SessionUser } from "../types/auth.types";

// 💡 CONTRATO UNIFICADO:
export type ProductionSite = {
  id_lugar_produccion: string;
  nombre_lugar_produccion: string;
  departamento: string;
  municipio: string;
  predios_asociados: number;
  especies_autorizadas: number;
  lotes_activos: number;
  area_total: string;
  numero_registro_ica: string;
  estado: "Activo" | "Pendiente" | "Rechazado";
  asistente_asignado: string;
  fecha_creacion: string;
  predios: {
    id_predio: string;
    nombre: string;
    codigo: string;
    vereda: string;
    municipio: string;
    departamento: string;
    area: number;
  }[];
  especies_autorizadas_ids: string[];
};

type AgriculturalManagementPageProps = {
  sessionUser?: SessionUser;
  onGoHome?: () => void;
  onGoUsers?: () => void;
  onGoRoles?: () => void;
  onGoCatalog?: () => void;
  onGoApprovalPlaces?: () => void;
  onGoInspectionsAgenda?: () => void;
  onGoInspectionsHistory?: () => void;
  onGoReports?: () => void;
  onLogout?: () => void;
  onOpenProductionDetail?: (site: ProductionSite) => void;
};

function AgriculturalManagementPage({
  sessionUser,
  onGoHome,
  onGoUsers,
  onGoRoles,
  onGoCatalog,
  onGoApprovalPlaces,
  onGoInspectionsAgenda,
  onGoInspectionsHistory,
  onGoReports,
  onLogout,
  onOpenProductionDetail,
}: AgriculturalManagementPageProps) {
  const [search, setSearch] = useState("");
  const [isNewProductionOpen, setIsNewProductionOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [sites, setSites] = useState<ProductionSite[]>([]);
  const [selectedSite, setSelectedSite] = useState<ProductionSite | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ─── CARGA DE DATOS DESDE EL BACKEND ENRIQUECIDO ───────────────────────────
  const loadSites = async () => {
    try {
      setLoading(true);
      setError("");

      const respuesta = await request<ApiEnvelope<any[]>>(
        "/lugares-produccion",
      );

      const mapped: ProductionSite[] = respuesta.data.map((lugar: any) => {
        const primerPredio = lugar.predio?.[0];
        const areaConsolidadaHa = lugar.predio
          ? lugar.predio.reduce(
              (acc: number, p: any) => acc + Number(p.area_total || 0),
              0,
            )
          : 0;

        return {
          id_lugar_produccion: lugar.id_lugar_produccion,
          nombre_lugar_produccion: lugar.nombre_lugar_produccion,
          municipio: primerPredio?.municipio || "N/D",
          departamento: primerPredio?.departamento || "N/D",
          predios_asociados: lugar.predio?.length || 0,
          especies_autorizadas: lugar.autorizacionEspecie?.length || 0,
          lotes_activos: 0,
          area_total:
            areaConsolidadaHa > 0
              ? `${areaConsolidadaHa.toFixed(1)} ha`
              : "0.0 ha",
          numero_registro_ica: lugar.numero_registro_ica || "En trámite",
          estado:
            lugar.estado === "APROBADO"
              ? "Activo"
              : lugar.estado === "RECHAZADO"
                ? "Rechazado"
                : "Pendiente",
          asistente_asignado: lugar.nombre_asistente_real,
          fecha_creacion: lugar.fecha_solicitud
            ? lugar.fecha_solicitud.split("T")[0]
            : "N/D",
          predios:
            lugar.predio?.map((p: any) => ({
              id_predio: p.id_predio,
              nombre: p.nombre_predio || "Sin nombre",
              codigo: p.numero_predial || "N/D",
              vereda: p.vereda || "N/D",
              municipio: p.municipio || "N/D",
              departamento: p.departamento || "N/D",
              area: Number(p.area_total || 0),
            })) || [],
          especies_autorizadas_ids:
            lugar.autorizacionEspecie?.map((e: any) => e.id_especie_vegetal) ||
            [],
        };
      });

      setSites(mapped);
    } catch (e: any) {
      setError(
        e.message ||
          "No se pudieron cargar los lugares de producción desde el servidor.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSites();
  }, []);

  // ─── FILTRADO DE MEMORIA EN CLIENTE ─────────────────────────────────────────
  const filteredSites = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return sites;
    return sites.filter(
      (site) =>
        site.nombre_lugar_produccion.toLowerCase().includes(q) ||
        site.municipio.toLowerCase().includes(q) ||
        site.departamento.toLowerCase().includes(q) ||
        site.numero_registro_ica.toLowerCase().includes(q),
    );
  }, [search, sites]);

  return (
    <DashboardLayout
      title="Gestión Agrícola"
      sessionUser={sessionUser}
      activeView="agricultural"
      onNavigate={(view) => {
        if (view === "home") onGoHome?.();
        if (view === "users") onGoUsers?.();
        if (view === "roles") onGoRoles?.();
        if (view === "catalog") onGoCatalog?.();
        if (view === "approval-places") onGoApprovalPlaces?.();
        if (view === "inspections-agenda") onGoInspectionsAgenda?.();
        if (view === "inspections-history") onGoInspectionsHistory?.();
        if (view === "reports") onGoReports?.();
      }}
      onLogout={onLogout}
    >
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">
            Listado Lugares de Producción
          </h2>
          <p className="mt-1 text-base text-slate-600">
            Administra lugares de producción y lotes de cultivo
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsNewProductionOpen(true)}
          className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 active:scale-95"
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
      {success ? (
        <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-700">
          {success}
        </div>
      ) : null}

      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-sm animate-pulse">
          Consultando registros en la base de datos operacional...
        </div>
      ) : (
        <div className="grid gap-4 xl:grid-cols-3 2xl:grid-cols-4 lg:grid-cols-2">
          {filteredSites.map((site) => (
            <article
              key={site.id_lugar_produccion}
              className="rounded-2xl border border-emerald-200 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-md"
            >
              <div className="mb-4 flex items-start justify-between gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-xl bg-emerald-100 text-emerald-700">
                  <FileText size={20} />
                </div>
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                    site.estado === "Activo"
                      ? "bg-emerald-100 text-emerald-700"
                      : site.estado === "Rechazado"
                        ? "bg-rose-100 text-rose-700"
                        : "bg-amber-100 text-amber-700"
                  }`}
                >
                  {site.estado}
                </span>
              </div>

              <h3 className="text-xl font-bold tracking-tight text-slate-900">
                {site.nombre_lugar_produccion}
              </h3>

              <div className="mt-2.5 space-y-1.5 text-slate-700">
                <p className="flex items-center gap-2 text-base font-medium">
                  <MapPin size={15} className="text-slate-500" />
                  {site.municipio}, {site.departamento}
                </p>
                <p className="flex items-center gap-2 text-base">
                  <Database size={16} className="text-slate-500" />
                  {site.predios_asociados} predios asociados
                </p>
                <p className="flex items-center gap-2 text-base">
                  <Leaf size={16} className="text-slate-500" />
                  {site.especies_autorizadas} especies autorizadas
                </p>
                <p className="flex items-center gap-2 text-base">
                  <Layers3 size={16} className="text-slate-500" />
                  {site.lotes_activos} lotes activos
                </p>
              </div>

              <div className="mt-4 space-y-1.5 border-t border-slate-200 pt-2.5">
                <div className="flex items-center justify-between text-base">
                  <span className="text-slate-500">Área total:</span>
                  <span className="font-bold text-emerald-600">
                    {site.area_total}
                  </span>
                </div>
                <div className="flex items-center justify-between text-base">
                  <span className="text-slate-500">Registro ICA:</span>
                  <span className="font-bold text-slate-800 font-mono text-xs">
                    {site.numero_registro_ica}
                  </span>
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
                  aria-label={`Editar ${site.nombre_lugar_produccion}`}
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
          <p className="text-lg font-semibold text-slate-800">
            No se encontraron resultados
          </p>
          <p className="mt-1 text-sm text-slate-500">
            Ajusta tu búsqueda para encontrar tus lugares de producción.
          </p>
        </div>
      ) : null}

      <NewProductionPlaceModal
        isOpen={isNewProductionOpen}
        onClose={() => setIsNewProductionOpen(false)}
        onSuccess={async () => {
          await loadSites(); // Refresca la lista desde el backend
          setSuccess(
            "Solicitud de lugar de producción creada y enviada a revisión ICA con éxito.",
          );
          setIsNewProductionOpen(false);
        }}
      />

      <EditProductionPlaceModal
        isOpen={isEditOpen}
        // 💡 SOLUCIÓN ERROR 2: Estrechamos el tipo 'string' de estado hacia el literal exigido ('Activo' | 'Pendiente')
        // Si el estado llega a ser 'Rechazado', el operador se asegura de enviarlo como 'Pendiente' para que el modal no explote.
        site={
          selectedSite
            ? {
                ...selectedSite,
                estado:
                  selectedSite.estado === "Rechazado"
                    ? "Pendiente"
                    : selectedSite.estado,
              }
            : null
        }
        onClose={() => {
          setIsEditOpen(false);
          setSelectedSite(null);
        }}
        // 💡 SOLUCIÓN ERROR 3: Mapeamos con tipado estricto la respuesta del modal de vuelta a tu lista
        onSave={(updated) => {
          const mappedUpdated: ProductionSite = {
            ...updated,
            id_lugar_produccion: String(updated.id_lugar_produccion),
            estado: updated.estado === "Activo" ? "Activo" : "Pendiente",
            asistente_asignado:
              updated.asistente_asignado || "Pendiente de asignación",
            fecha_creacion: updated.fecha_creacion || "N/D",
            predios: updated.predios || [],
            especies_autorizadas_ids: selectedSite?.especies_autorizadas_ids || [],
          };

          setSites((prev) =>
            prev.map((s) =>
              s.id_lugar_produccion === mappedUpdated.id_lugar_produccion
                ? mappedUpdated
                : s,
            ),
          );
          setSuccess("Lugar de producción actualizado correctamente.");
          setIsEditOpen(false);
          setSelectedSite(null);
        }}
      />
    </DashboardLayout>
  );
}

export default AgriculturalManagementPage;
