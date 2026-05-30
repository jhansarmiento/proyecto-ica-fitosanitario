// frontend/src/pages/ProductionPlaceDetailPage.tsx
import { useState, useEffect } from "react";
import { ArrowLeft, MapPin, Warehouse } from "lucide-react";
import DashboardLayout from "../components/layout/DashboardLayout";
import { fincaService } from "../services/finca.service";
import type { ProductionSite } from "./AgriculturalManagementPage";
import type { SessionUser } from "../types/auth.types";
import RequestInspectionModal from "../components/ui/RequestInspectionModal";

type ProductionPlaceDetailPageProps = {
  sessionUser?: SessionUser;
  site: ProductionSite | null;
  onBackToAgricultural?: () => void;
  onGoLots?: () => void;
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

const ProductionPlaceDetailPage = ({
  sessionUser,
  site,
  onBackToAgricultural,
  onGoLots,
  onGoHome,
  onGoUsers,
  onGoRoles,
  onGoApprovalPlaces,
  onGoCatalog,
  onGoInspectionsAgenda,
  onGoInspectionsHistory,
  onGoReports,
  onLogout,
}: ProductionPlaceDetailPageProps) => {
  const [activeTab, setActiveTab] = useState<"resumen" | "lotes">("resumen");
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [totalLotes, setTotalLotes] = useState(site?.lotes_activos ?? 0);

  // Consultamos el número real de lotes al cargar la vista
  useEffect(() => {
    if (site?.id_lugar_produccion) {
      fincaService.getLotesPorLugar(site.id_lugar_produccion)
        .then(res => setTotalLotes(res.data.length))
        .catch(() => setTotalLotes(0));
    }
  }, [site?.id_lugar_produccion]);

  // Validamos si el usuario actual es un Productor
  const esProductor = sessionUser?.rol?.toLowerCase() === "productor";

  const handleSolicitarInspeccion = () => {
    setIsRequestModalOpen(true);
  };

  return (
    <DashboardLayout
      title="Gestión Agrícola"
      sessionUser={sessionUser}
      activeView="agricultural"
      onNavigate={(view) => {
        if (view === "home") onGoHome?.();
        if (view === "users") onGoUsers?.();
        if (view === "roles") onGoRoles?.();
        if (view === "approval-places") onGoApprovalPlaces?.();
        if (view === "agricultural") onBackToAgricultural?.();
        if (view === "catalog") onGoCatalog?.();
        if (view === "inspections-agenda") onGoInspectionsAgenda?.();
        if (view === "inspections-history") onGoInspectionsHistory?.();
        if (view === "reports") onGoReports?.();
      }}
      onLogout={onLogout}
    >
      <section className="flex-1 p-1 sm:p-2">
        {/* MENSAJE DE ÉXITO */}
        {successMsg && (
          <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 font-semibold flex justify-between items-center">
            {successMsg}
            <button
              onClick={() => setSuccessMsg("")}
              className="text-emerald-500 hover:text-emerald-700 size={16}"
            >
              {" "}
              X
            </button>
          </div>
        )}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm text-slate-500">
              <button
                type="button"
                onClick={onBackToAgricultural}
                className="inline-flex items-center gap-1 rounded-lg px-2 py-1 transition hover:bg-slate-100"
              >
                <ArrowLeft size={14} />
                Lugares de Producción
              </button>
              <span>/</span>
              <span className="font-semibold text-slate-700">
                {site?.nombre_lugar_produccion ?? "Detalle"}
              </span>
            </div>
            <h2 className="text-[3rem] font-extrabold leading-none tracking-tight text-slate-900">
              {site?.nombre_lugar_produccion ?? "Zona Productiva"}
            </h2>
          </div>

          {/* 🌟 BOTONES PERFECTAMENTE ALINEADOS A LA DERECHA */}
          <div className="flex items-center gap-2">
            {esProductor && (
              <button
                type="button"
                onClick={handleSolicitarInspeccion}
                className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 active:scale-95"
              >
                Solicitar Inspección Fitosanitaria
              </button>
            )}
            <button
              type="button"
              className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Editar
            </button>
          </div>
        </div>

        <div className="mb-5 inline-flex rounded-2xl border border-slate-200 bg-white p-1">
          <button
            type="button"
            onClick={() => setActiveTab("resumen")}
            className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${activeTab === "resumen" ? "bg-emerald-900 text-white" : "text-slate-600 hover:bg-slate-100"}`}
          >
            Resumen
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab("lotes");
              onGoLots?.();
            }}
            className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${activeTab === "lotes" ? "bg-emerald-900 text-white" : "text-slate-600 hover:bg-slate-100"}`}
          >
            Lotes ({totalLotes})
          </button>
        </div>

        <div className="grid gap-5 xl:grid-cols-[1fr_420px]">
          <div className="space-y-5">
            <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="mb-4 text-2xl font-bold text-slate-900">
                Información General
              </h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-500">
                    Número de registro ICA
                  </p>
                  <p className="mt-1 font-semibold text-slate-800 font-mono text-sm">
                    {site?.numero_registro_ica ?? "N/D"}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-500">
                    Estado
                  </p>
                  <span
                    className={`mt-1 inline-flex rounded-full px-3 py-1 text-sm font-semibold ${
                      site?.estado === "Activo"
                        ? "bg-emerald-100 text-emerald-700"
                        : site?.estado === "Rechazado"
                          ? "bg-rose-100 text-rose-700"
                          : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {site?.estado ?? "Activo"}
                  </span>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-500">
                    Fecha de creación
                  </p>
                  <p className="mt-1 text-base font-semibold text-slate-800">
                    {site?.fecha_creacion ?? "N/D"}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-500">
                    Ubicación Geográfica
                  </p>
                  <p className="mt-1 text-base font-semibold text-slate-800">
                    {site ? `${site.municipio}, ${site.departamento}` : "N/D"}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-500">
                    Área Consolidada
                  </p>
                  <p className="mt-1 text-base font-semibold text-slate-800">
                    {site?.area_total ?? "0 ha"}
                  </p>
                </div>
                {/* 🌟 CAMBIO: Asistente Asignado en lugar de Productor */}
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-500">
                    Asistente Técnico Asignado
                  </p>
                  <p className="mt-1 text-base font-semibold text-slate-800">
                    {site?.asistente_asignado ?? "Pendiente"}
                  </p>
                </div>
              </div>
            </article>

            <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="mb-4 text-2xl font-bold text-slate-900">
                Predios Asociados ({site?.predios_asociados ?? 0})
              </h3>
              <div className="space-y-3">
                {/* 🌟 LISTA DE PREDIOS REALES CONECTADOS A LA BD */}
                {site?.predios?.map((predio) => (
                  <div
                    key={predio.id_predio}
                    className="rounded-xl border border-slate-200 bg-slate-50 p-4 transition hover:border-emerald-200 hover:bg-emerald-50/30"
                  >
                    <div className="mb-2 flex items-start justify-between gap-3">
                      <div className="flex items-start gap-2">
                        <div className="mt-1 rounded-lg bg-blue-50 p-1.5 text-blue-600">
                          <Warehouse size={16} />
                        </div>
                        <div>
                          <p className="text-base font-bold text-slate-800">
                            {predio.nombre}
                          </p>
                          <p className="text-xs text-slate-500 font-mono">
                            Código: {predio.codigo}
                          </p>
                        </div>
                      </div>
                      <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                        Vinculado
                      </span>
                    </div>
                    <div className="grid gap-2 text-sm text-slate-700 sm:grid-cols-3">
                      <p>
                        <span className="text-slate-500">Vereda:</span>{" "}
                        {predio.vereda}
                      </p>
                      <p>
                        <span className="text-slate-500">Municipio:</span>{" "}
                        {predio.municipio}
                      </p>
                      <p>
                        <span className="text-slate-500">Área:</span>{" "}
                        <span className="font-semibold">{predio.area} ha</span>
                      </p>
                    </div>
                  </div>
                ))}

                {site?.predios?.length === 0 && (
                  <p className="text-sm text-slate-500 text-center py-4">
                    No hay predios vinculados a este registro.
                  </p>
                )}
              </div>
            </article>
          </div>

          <aside className="space-y-5">
            <div className="rounded-2xl bg-linear-to-r from-emerald-700 to-emerald-600 p-5 text-white shadow-md">
              <p className="text-sm text-emerald-100">Total Lotes</p>
              <p className="mt-1 text-4xl font-extrabold">
                {totalLotes}
              </p>
              {/* 🌟 SE ELIMINÓ EL TEXTO DE 'ÚLTIMA ACTUALIZACIÓN' */}
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h4 className="mb-4 text-4xl font-bold text-slate-900">
                Resumen
              </h4>
              <div className="space-y-3 text-lg">
                <div className="flex items-center justify-between">
                  <p className="text-slate-600">Predios</p>
                  <p className="font-bold text-slate-900">
                    {site?.predios_asociados ?? 0}
                  </p>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-slate-600">Lotes Activos</p>
                  <p className="font-bold text-slate-900">
                    {totalLotes}
                  </p>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-slate-600">Especies</p>
                  <p className="font-bold text-slate-900">
                    {site?.especies_autorizadas ?? 0}
                  </p>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-slate-600">Área Total</p>
                  <p className="font-bold text-slate-900">
                    {site?.area_total ?? "0 ha"}
                  </p>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-slate-600">Ubicación</p>
                  <p className="flex items-center gap-1 font-bold text-slate-900">
                    <MapPin size={14} />
                    {site?.municipio ?? "N/D"}
                  </p>
                </div>
              </div>
            </div>
          </aside>
        </div>
        <RequestInspectionModal
          isOpen={isRequestModalOpen}
          site={site}
          onClose={() => setIsRequestModalOpen(false)}
          onSuccess={() => {
            setIsRequestModalOpen(false);
            setSuccessMsg(
              "¡Solicitud enviada al ICA con éxito! El asistente técnico será notificado.",
            );
          }}
        />
      </section>
    </DashboardLayout>
  );
};

export default ProductionPlaceDetailPage;
