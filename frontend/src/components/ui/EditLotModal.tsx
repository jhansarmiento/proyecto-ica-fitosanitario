// frontend/src/components/ui/EditLotModal.tsx
import { CalendarDays, Leaf, X } from "lucide-react";
import { useEffect, useState } from "react";
import type { LotDetail } from "../../pages/ProductionLotsPage";
import { fincaService } from "../../services/finca.service";

type EditLotModalProps = {
  isOpen: boolean;
  lot: LotDetail | null;
  onClose: () => void;
  onSuccess: () => void;
};

function EditLotModal({ isOpen, lot, onClose, onSuccess }: EditLotModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Estados Físicos Editables
  const [numero, setNumero] = useState("");
  const [areaHa, setAreaHa] = useState("");
  const [fechaSiembra, setFechaSiembra] = useState("");
  const [fechaCosecha, setFechaCosecha] = useState("");

  // 💡 Nota de Arquitectura: En la industria agrícola real, rara vez se "edita"
  // la especie o variedad de un lote ya sembrado. Si te equivocaste de semilla,
  // el lote se da de baja (Inactivo) y se crea uno nuevo. Por eso, en esta refactorización,
  // bloquearemos esos campos y solo permitiremos editar los datos transaccionales.

  useEffect(() => {
    if (!isOpen || !lot) return;
    setNumero(lot.numero_lote);
    setAreaHa(String(lot.area_total));
    setFechaSiembra(lot.fecha_siembra);
    setFechaCosecha(lot.fecha_cosecha ?? "");
    setError("");
  }, [isOpen, lot]);

  if (!isOpen || !lot) return null;

  const canSave =
    numero.trim().length >= 3 &&
    Number(areaHa) > 0 &&
    fechaSiembra.trim().length > 0;

  const handleSave = async () => {
    if (!canSave || loading) return;
    try {
      setLoading(true);
      setError("");

      const payload = {
        numero_lote: numero.trim(),
        area_total: Number(areaHa),
        fecha_siembra: fechaSiembra,
        fecha_cosecha: fechaCosecha || null,
      };

      await fincaService.updateLote(lot.id_lote, payload);

      onSuccess(); // Cierra el modal y recarga la lista de lotes en el padre
    } catch (e: any) {
      setError(e.message || "Error al actualizar el lote.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    const confirmar = window.confirm(
      "¿Estás seguro de que deseas eliminar este lote? Esta acción no se puede deshacer y borrará permanentemente sus datos.",
    );
    if (confirmar) {
      try {
        setLoading(true);
        await fincaService.deleteLote(lot.id_lote);
        onSuccess(); // Cierra y refresca la tabla
      } catch (error: any) {
        setError(error.message || "Error al eliminar el lote.");
        setLoading(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/45 px-4 py-6 backdrop-blur-[1px]">
      <div className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/5">
        <div className="bg-emerald-900 px-5 py-4 text-white flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-emerald-800 ring-1 ring-white/20">
              <Leaf size={22} />
            </div>
            <div>
              <h3 className="text-2xl font-bold leading-none">Editar Lote</h3>
              <p className="mt-1 text-sm text-emerald-100">
                {lot.predio_nombre}
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

        <div className="px-5 py-5 sm:px-6">
          {error && (
            <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error}
            </div>
          )}

          {/* Bloque de Información Fija */}
          <div className="mb-6 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm text-slate-500 uppercase tracking-wide font-semibold mb-1">
              Cultivo Registrado (No Editable)
            </p>
            <p className="text-lg font-bold text-slate-800">
              {lot.especie}{" "}
              <span className="font-normal text-slate-600">
                — {lot.variedad}
              </span>
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-1.5">
              <span className="text-sm font-medium text-slate-700">
                Número de Lote *
              </span>
              <input
                type="text"
                value={numero}
                onChange={(e) => setNumero(e.target.value)}
                className="h-11 w-full rounded-xl border border-slate-300 px-3 text-sm outline-none transition focus:border-emerald-400"
              />
            </label>

            <label className="space-y-1.5">
              <span className="text-sm font-medium text-slate-700">
                Área Total (ha) *
              </span>
              <input
                type="number"
                value={areaHa}
                onChange={(e) => setAreaHa(e.target.value)}
                min={0}
                step="0.1"
                className="h-11 w-full rounded-xl border border-slate-300 px-3 text-sm outline-none transition focus:border-emerald-400"
              />
            </label>

            <label className="space-y-1.5">
              <span className="text-sm font-medium text-slate-700">
                Fecha de Siembra *
              </span>
              <div className="relative">
                <input
                  type="date"
                  value={fechaSiembra}
                  onChange={(e) => setFechaSiembra(e.target.value)}
                  className="h-11 w-full rounded-xl border border-slate-300 px-3 pr-10 text-sm outline-none transition focus:border-emerald-400"
                />
                <CalendarDays
                  size={16}
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
              </div>
            </label>

            <label className="space-y-1.5">
              <span className="text-sm font-medium text-slate-700">
                Fecha de Cosecha
              </span>
              <div className="relative">
                <input
                  type="date"
                  value={fechaCosecha}
                  onChange={(e) => setFechaCosecha(e.target.value)}
                  className="h-11 w-full rounded-xl border border-slate-300 px-3 pr-10 text-sm outline-none transition focus:border-emerald-400"
                />
                <CalendarDays
                  size={16}
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
              </div>
            </label>
          </div>

          {/* 🌟 Footer con botón de Eliminar a la izquierda */}
          <div className="mt-8 flex justify-between items-center border-t border-slate-100 pt-5">
            <button
              onClick={handleDelete}
              disabled={loading}
              className="text-sm font-bold text-rose-600 hover:text-rose-800 transition disabled:opacity-50"
            >
              Eliminar Lote
            </button>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                disabled={loading}
                className="rounded-xl border px-5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={!canSave || loading}
                className="rounded-xl bg-emerald-900 px-6 py-2 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-50 transition"
              >
                {loading ? "Guardando..." : "Guardar Cambios"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EditLotModal;
