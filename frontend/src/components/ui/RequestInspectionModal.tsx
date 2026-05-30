// frontend/src/components/ui/RequestInspectionModal.tsx
import { CalendarSearch, CalendarDays, FileText, X } from "lucide-react";
import { useEffect, useState } from "react";
import { fincaService } from "../../services/finca.service";
import type { ProductionSite } from "../../pages/AgriculturalManagementPage";

type RequestInspectionModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  site: ProductionSite | null;
};

function RequestInspectionModal({
  isOpen,
  onClose,
  onSuccess,
  site,
}: RequestInspectionModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [fechaTentativa, setFechaTentativa] = useState("");
  const [observaciones, setObservaciones] = useState("");

  // Limpiar el estado cada vez que se abre/cierra
  useEffect(() => {
    if (!isOpen) {
      setFechaTentativa("");
      setObservaciones("");
      setError("");
    }
  }, [isOpen]);

  if (!isOpen || !site) return null;

  // Validación: Solo se puede enviar si hay fecha
  const canSubmit = fechaTentativa.trim().length > 0;

  const handleSubmit = async () => {
    if (!canSubmit || loading) return;

    try {
      setLoading(true);
      setError("");

      const payload = {
        fecha_tentativa_productor: fechaTentativa,
        observaciones: observaciones.trim(),
      };

      await fincaService.createSolicitudInspeccion(
        site.id_lugar_produccion,
        payload,
      );
      onSuccess();
    } catch (e: any) {
      setError(e.message || "No se pudo enviar la solicitud de inspección.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/45 px-4 py-6 backdrop-blur-[1px]">
      <div className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/5">
        {/* Cabecera del Modal */}
        <div className="bg-emerald-900 px-5 py-4 text-white flex justify-between items-start gap-4">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-emerald-800 ring-1 ring-white/20">
              <CalendarSearch size={22} />
            </div>
            <div>
              <h3 className="text-2xl font-bold leading-none">
                Solicitar Inspección
              </h3>
              <p className="mt-1 text-sm text-emerald-100">
                Agendar visita técnica oficial del ICA
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-9 w-9 place-items-center rounded-lg text-emerald-100 transition hover:bg-white/10 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        <div className="px-5 py-5 sm:px-6">
          {error && (
            <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 font-semibold">
              {error}
            </div>
          )}

          {/* Bloque de Información de Lectura (Estilo Tarjeta Resumen) */}
          <div className="mb-6 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <h4 className="text-sm uppercase tracking-wide font-bold text-slate-500 mb-3 border-b border-slate-200 pb-2">
              Resumen del Lugar de Producción
            </h4>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <p className="text-xs text-slate-500">Nombre del Lugar</p>
                <p className="font-semibold text-slate-800">
                  {site.nombre_lugar_produccion}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Lotes a Inspeccionar</p>
                <p className="font-semibold text-slate-800">
                  {site.lotes_activos} Lotes Activos
                </p>
              </div>
              <div className="sm:col-span-2">
                <p className="text-xs text-slate-500">
                  Asistente Técnico Asignado
                </p>
                <p className="font-semibold text-emerald-700">
                  {site.asistente_asignado}
                </p>
              </div>
            </div>
          </div>

          {/* Formulario de Solicitud */}
          <div className="grid gap-4 sm:grid-cols-1">
            <label className="space-y-1.5">
              <span className="text-sm font-semibold text-slate-700">
                Fecha Propuesta por el Productor *
              </span>
              <p className="text-xs text-slate-500 mb-1">
                El asistente técnico confirmará o ajustará esta fecha según
                disponibilidad.
              </p>
              <div className="relative">
                <input
                  type="date"
                  value={fechaTentativa}
                  // Prevenir selección de fechas en el pasado
                  min={new Date().toISOString().split("T")[0]}
                  onChange={(e) => setFechaTentativa(e.target.value)}
                  className="h-11 w-full rounded-xl border border-slate-300 px-3 pr-10 text-sm outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
                />
                <CalendarDays
                  size={16}
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
              </div>
            </label>

            <label className="space-y-1.5">
              <span className="text-sm font-semibold text-slate-700">
                Observaciones o Notas Adicionales
              </span>
              <div className="relative">
                <textarea
                  rows={3}
                  value={observaciones}
                  onChange={(e) => setObservaciones(e.target.value)}
                  placeholder="Ej: La entrada a la finca está en reparación, por favor avisar antes de llegar..."
                  className="w-full rounded-xl border border-slate-300 p-3 text-sm outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100 resize-none"
                />
                <FileText
                  size={16}
                  className="absolute right-3 top-3 text-slate-400"
                />
              </div>
            </label>
          </div>

          <div className="mt-6 flex items-center justify-end gap-3 border-t border-slate-100 pt-5">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-xl border border-slate-300 bg-white px-5 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Cancelar
            </button>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={!canSubmit || loading}
              className="rounded-xl bg-emerald-900 px-6 py-2 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:opacity-50"
            >
              {loading
                ? "Enviando solicitud..."
                : "Radicar Solicitud de Inspección"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RequestInspectionModal;
