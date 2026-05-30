import { CalendarCheck, FileText, MapPin, User, X } from "lucide-react";
import { useEffect, useState } from "react";
import { fincaService } from "../../services/finca.service";

type ScheduleInspectionModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  solicitud: any | null; // Tiparemos esto bien en la vista
};

function ScheduleInspectionModal({
  isOpen,
  onClose,
  onSuccess,
  solicitud,
}: ScheduleInspectionModalProps) {
  const [fechaConfirmada, setFechaConfirmada] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen && solicitud) {
      // Sugerir la misma fecha que propuso el productor por defecto
      setFechaConfirmada(
        solicitud.fecha_tentativa
          ? solicitud.fecha_tentativa.split("T")[0]
          : "",
      );
      setError("");
    }
  }, [isOpen, solicitud]);

  if (!isOpen || !solicitud) return null;

  const handleSave = async () => {
    if (!fechaConfirmada || loading) return;
    try {
      setLoading(true);
      await fincaService.programarInspeccion(
        solicitud.id_solicitud,
        fechaConfirmada,
      );
      onSuccess();
    } catch (e: any) {
      setError(e.message || "Error al programar la inspección.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/45 px-4 py-6 backdrop-blur-[1px]">
      <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/5">
        <div className="bg-emerald-900 px-5 py-4 text-white flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-emerald-800 ring-1 ring-white/20">
              <CalendarCheck size={22} />
            </div>
            <div>
              <h3 className="text-xl font-bold leading-none">
                Programar Inspección
              </h3>
              <p className="mt-1 text-sm text-emerald-100">
                Confirmar fecha de visita
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-emerald-100 hover:text-white transition"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
              {error}
            </div>
          )}

          {/* Información Contextual */}
          <div className="space-y-4 mb-6">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <h4 className="text-lg font-bold text-slate-800 mb-1">
                {solicitud.lugar_nombre}
              </h4>
              <p className="text-sm text-slate-500 flex items-center gap-1">
                <MapPin size={14} /> {solicitud.lugar_ubicacion}
              </p>
              <p className="text-sm text-slate-500 flex items-center gap-1 mt-1">
                <User size={14} /> Asignado: {solicitud.asistente_nombre}
              </p>
            </div>

            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
              <p className="text-xs uppercase tracking-wide font-bold text-amber-800 mb-1">
                Notas del Productor
              </p>
              <p className="text-sm text-amber-900 flex items-start gap-2">
                <FileText size={16} className="shrink-0 mt-0.5" />
                {solicitud.observaciones || "No hay notas adicionales."}
              </p>
            </div>
          </div>

          {/* Selector de Fecha */}
          <label className="block space-y-1.5 mb-6">
            <span className="text-sm font-semibold text-slate-700">
              Fecha Definitiva de Inspección *
            </span>
            <p className="text-xs text-slate-500">
              Por defecto se muestra la fecha solicitada por el productor (
              {solicitud.fecha_tentativa
                ? solicitud.fecha_tentativa.split("T")[0]
                : "N/D"}
              ). Puedes ajustarla según tu agenda.
            </p>
            <input
              type="date"
              value={fechaConfirmada}
              onChange={(e) => setFechaConfirmada(e.target.value)}
              min={new Date().toISOString().split("T")[0]}
              className="h-11 w-full rounded-xl border border-slate-300 px-3 text-sm outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
            />
          </label>

          <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
            <button
              onClick={onClose}
              disabled={loading}
              className="rounded-xl border px-5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={!fechaConfirmada || loading}
              className="rounded-xl bg-emerald-900 px-6 py-2 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-50"
            >
              {loading ? "Programando..." : "Confirmar Agenda"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ScheduleInspectionModal;
