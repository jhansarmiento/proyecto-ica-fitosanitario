// frontend/src/components/ui/NewProductionPlaceModal.tsx
import { Search, Warehouse, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { fincaService } from "../../services/finca.service";
import type { PredioUI, EspecieUI } from "../../types/finca.types";

type NewProductionPlaceModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
};

const steps = ["Selección de predios", "Especies", "Datos"];

function NewProductionPlaceModal({
  isOpen,
  onClose,
  onSuccess,
}: NewProductionPlaceModalProps) {
  const [step, setStep] = useState(1);
  const [loadingData, setLoadingData] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [saving, setSaving] = useState(false);

  // Estados de búsquedas y selecciones
  const [predioSearch, setPredioSearch] = useState("");
  const [speciesSearch, setSpeciesSearch] = useState("");
  const [selectedPredios, setSelectedPredios] = useState<string[]>([]);
  const [selectedSpecies, setSelectedSpecies] = useState<string[]>([]);

  // Datos maestros de las fincas y plantas
  const [predios, setPredios] = useState<PredioUI[]>([]);
  const [species, setSpecies] = useState<EspecieUI[]>([]);

  // Estados limpios del formulario final (Sin selectores de usuario)
  const [nombreLugar, setNombreLugar] = useState("");
  const [registroIca, setRegistroIca] = useState("");
  const [capacidadProduccion, setCapacidadProduccion] = useState("");

  // Carga de datos optimizada: Eliminados usuarios y roles innecesarios
  useEffect(() => {
    const loadMasterData = async () => {
      if (!isOpen) return;

      try {
        setLoadingData(true);
        setLoadError("");

        const [prediosRes, especiesRes] = await Promise.all([
          fincaService.getPredios(),
          fincaService.getEspeciesVegetales(),
        ]);

        const mappedPredios: PredioUI[] = prediosRes.data.map((p: any) => ({
          id: p.id_predio,
          nombre: p.nombre_predio || "Predio sin nombre",
          codigo: p.numero_predial || "N/D",
          vereda: p.vereda || "N/D",
          municipio: p.municipio || "N/D",
          departamento: p.departamento || "N/D",
          area_total: Number(p.area_total || 0),
        }));
        setPredios(mappedPredios);

        const mappedSpecies: EspecieUI[] = especiesRes.data.map((e: any) => ({
          id_especie_vegetal: e.id_especie_vegetal,
          nombre_comun: e.nombre_comun,
          nombre_cientifico: e.nombre_especie,
          ciclo_cultivo: e.ciclo_cultivo,
        }));
        setSpecies(mappedSpecies);
      } catch (e: any) {
        setLoadError(
          e.message || "Error al conectar con los servicios fitosanitarios",
        );
      } finally {
        setLoadingData(false);
      }
    };

    loadMasterData();
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      setStep(1);
      setPredioSearch("");
      setSpeciesSearch("");
      setSelectedPredios([]);
      setSelectedSpecies([]);
      setNombreLugar("");
      setRegistroIca("");
      setCapacidadProduccion("");
      setLoadError("");
      setSaving(false);
    }
  }, [isOpen]);

  const filteredPredios = useMemo(() => {
    const q = predioSearch.trim().toLowerCase();
    if (!q) return predios;
    return predios.filter(
      (p) =>
        p.nombre.toLowerCase().includes(q) ||
        p.codigo.toLowerCase().includes(q),
    );
  }, [predioSearch, predios]);

  const filteredSpecies = useMemo(() => {
    const q = speciesSearch.trim().toLowerCase();
    if (!q) return species;
    return species.filter(
      (s) =>
        s.nombre_comun.toLowerCase().includes(q) ||
        s.nombre_cientifico.toLowerCase().includes(q),
    );
  }, [speciesSearch, species]);

  const areaConsolidada = useMemo(() => {
    return predios
      .filter((p) => selectedPredios.includes(p.id))
      .reduce((acc, p) => acc + p.area_total, 0);
  }, [selectedPredios, predios]);

  const selectedSpeciesData = useMemo(
    () => species.filter((s) => selectedSpecies.includes(s.id_especie_vegetal)),
    [selectedSpecies, species],
  );

  if (!isOpen) return null;

  const togglePredio = (id: string) => {
    setSelectedPredios((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const toggleSpecies = (id: string) => {
    setSelectedSpecies((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const canNextFromStep1 = selectedPredios.length > 0;
  const canNextFromStep2 = selectedSpecies.length > 0;

  // Validación corregida: Ya no exige idUsuarioProductor en el cliente
  const canCreate =
    nombreLugar.trim().length > 0 &&
    capacidadProduccion.trim().length > 0;

  const goNext = () => {
    if (step === 1 && !canNextFromStep1) return;
    if (step === 2 && !canNextFromStep2) return;
    if (step < 3) setStep((prev) => prev + 1);
  };

  const goBack = () => {
    if (step > 1) setStep((prev) => prev - 1);
  };

  const handleCreate = async () => {
    if (!canCreate || saving) return;
    try {
      setSaving(true);
      setLoadError("");

      const payload = {
        nombre_lugar_produccion: nombreLugar.trim(),
        numero_registro_ica: registroIca.trim(),
        predios_ids: selectedPredios,
        especies: selectedSpecies.map((id) => ({
          id_especie_vegetal: id,
          capacidad_produccion: parseFloat(capacidadProduccion) || 0,
        })),
      };

      // Llamado corregido apuntando al nombre exacto del servicio
      await fincaService.createLugarProduccion(payload);
      onSuccess?.();
      onClose();
    } catch (error: any) {
      setLoadError(
        error.message || "No se pudo procesar el registro del lugar.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/45 px-4 py-6 backdrop-blur-[1px]">
      <div className="w-full max-w-5xl overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/5">
        {/* Cabecera */}
        <div className="bg-emerald-900 px-5 py-4 text-white">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-emerald-800 ring-1 ring-white/20">
                <Warehouse size={22} />
              </div>
              <div>
                <h3 className="text-3xl font-bold leading-none">
                  {step === 1
                    ? "Selección de predios"
                    : step === 2
                      ? "Selección de especies"
                      : "Datos"}
                </h3>
                <p className="mt-1 text-sm text-emerald-100">
                  Paso {step} de 3 — Crear Lugar de Producción
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

          {/* Stepper descriptivo */}
          <div className="mt-4 grid grid-cols-3 gap-2">
            {steps.map((s, idx) => {
              const number = idx + 1;
              return (
                <div key={s} className="flex items-center gap-2">
                  <span
                    className={`grid h-6 w-6 place-items-center rounded-full text-xs font-bold ${number === step ? "bg-white text-emerald-900" : number < step ? "bg-emerald-400 text-emerald-950" : "bg-emerald-800 text-emerald-200"}`}
                  >
                    {number}
                  </span>
                  <span
                    className={`text-sm ${number === step ? "text-white" : number < step ? "text-emerald-100" : "text-emerald-200/80"}`}
                  >
                    {s}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Cuerpo del Formulario */}
        <div className="px-5 py-5 sm:px-6">
          {loadError && (
            <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm text-rose-700">
              {loadError}
            </div>
          )}
          {loadingData && (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600 animate-pulse">
              Estableciendo conexión con los catálogos y predios precargados...
            </div>
          )}

          {/* PASO 1: Selección de terrenos */}
          {!loadingData && step === 1 && (
            <>
              <p className="mb-4 text-sm text-slate-600">
                Seleccione los predios que conformarán este lugar de producción.
                El área total se calculará automáticamente.
              </p>
              <div className="mb-4 flex w-full items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2.5 shadow-sm">
                <Search size={18} className="text-slate-400" />
                <input
                  type="text"
                  value={predioSearch}
                  onChange={(e) => setPredioSearch(e.target.value)}
                  placeholder="Buscar predios disponibles"
                  className="w-full bg-transparent text-base text-slate-700 outline-none"
                />
              </div>

              <div className="max-h-[260px] space-y-3 overflow-y-auto pr-1">
                {filteredPredios.map((predio) => {
                  const checked = selectedPredios.includes(predio.id);
                  return (
                    <label
                      key={predio.id}
                      className={`flex cursor-pointer items-center justify-between rounded-xl border px-4 py-3 transition ${checked ? "border-emerald-300 bg-emerald-50 shadow-sm" : "border-slate-200 bg-white hover:border-emerald-200"}`}
                    >
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => togglePredio(predio.id)}
                          className="mt-1 h-5 w-5 rounded border-slate-300 text-emerald-700"
                        />
                        <div>
                          <p className="text-base font-semibold text-slate-800">
                            {predio.nombre}
                          </p>
                          <p className="text-sm text-slate-500">
                            {predio.codigo} · Vda. {predio.vereda},{" "}
                            {predio.municipio} ({predio.departamento})
                          </p>
                        </div>
                      </div>
                      <p className="text-lg font-bold text-slate-700">
                        {predio.area_total} ha
                      </p>
                    </label>
                  );
                })}
              </div>

              <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
                <span className="font-semibold">{selectedPredios.length}</span>{" "}
                predio(s) seleccionado(s) · Área consolidada{" "}
                <span className="text-lg font-bold">
                  {areaConsolidada.toFixed(1)} ha
                </span>
              </div>
            </>
          )}

          {/* PASO 2: Selección de cultivos lógicos */}
          {!loadingData && step === 2 && (
            <div className="grid gap-4 lg:grid-cols-[1fr_290px]">
              <div>
                <h4 className="mb-2 text-2xl font-semibold text-slate-800">
                  Seleccionar Especies Vegetales
                </h4>
                <div className="mb-4 flex w-full items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2.5 shadow-sm">
                  <Search size={18} className="text-slate-400" />
                  <input
                    type="text"
                    value={speciesSearch}
                    onChange={(e) => setSpeciesSearch(e.target.value)}
                    placeholder="Buscar especies..."
                    className="w-full bg-transparent text-base text-slate-700 outline-none"
                  />
                </div>

                <div className="max-h-[320px] space-y-3 overflow-y-auto pr-1">
                  {filteredSpecies.map((sp) => {
                    const checked = selectedSpecies.includes(
                      sp.id_especie_vegetal,
                    );
                    return (
                      <label
                        key={sp.id_especie_vegetal}
                        className={`flex cursor-pointer items-center justify-between rounded-xl border px-4 py-3 transition ${checked ? "border-emerald-300 bg-emerald-50 shadow-sm" : "border-slate-200 bg-white hover:border-emerald-200"}`}
                      >
                        <div>
                          <p className="text-2xl font-semibold text-slate-800">
                            {sp.nombre_comun}
                          </p>
                          <p className="text-sm italic text-slate-600">
                            {sp.nombre_cientifico}
                          </p>
                        </div>
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleSpecies(sp.id_especie_vegetal)}
                          className="h-5 w-5 rounded border-slate-300 text-emerald-700"
                        />
                      </label>
                    );
                  })}
                </div>
              </div>

              <aside className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <h5 className="text-xl font-bold text-slate-900">Resumen</h5>
                <div className="mt-4 space-y-4">
                  <div>
                    <p className="text-slate-500">Especies seleccionadas:</p>
                    <p className="text-3xl font-extrabold text-slate-900">
                      {selectedSpecies.length}
                    </p>
                  </div>
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 max-h-40 overflow-y-auto">
                    {selectedSpeciesData.map((s) => (
                      <p
                        key={s.id_especie_vegetal}
                        className="text-sm text-emerald-900 font-medium"
                      >
                        ✦ {s.nombre_comun}
                      </p>
                    ))}
                  </div>
                </div>
              </aside>
            </div>
          )}

          {/* PASO 3: Identificación del Lugar */}
          {!loadingData && step === 3 && (
            <>
              <h4 className="mb-4 text-2xl font-semibold text-slate-800">
                Datos del Lugar de Producción
              </h4>
              <div className="mb-4 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3">
                <p className="text-sm font-medium text-blue-800">
                  Área consolidada (solo lectura)
                </p>
                <p className="text-4xl font-extrabold text-blue-700">
                  {areaConsolidada.toFixed(1)} ha
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-1.5">
                  <span className="text-sm font-medium text-slate-700">
                    Nombre
                  </span>
                  <input
                    type="text"
                    value={nombreLugar}
                    onChange={(e) => setNombreLugar(e.target.value)}
                    className="h-11 w-full rounded-xl border border-slate-300 px-3 text-sm outline-none"
                    placeholder="Ej: Lugar Productivo Norte"
                  />
                </label>

                <label className="space-y-1.5 sm:col-span-2">
                  <span className="text-sm font-medium text-slate-700">
                    Capacidad de Producción Estimada por Especie (Tons)
                  </span>
                  <input
                    type="number"
                    value={capacidadProduccion}
                    onChange={(e) => setCapacidadProduccion(e.target.value)}
                    className="h-11 w-full rounded-xl border border-slate-300 px-3 text-sm outline-none"
                    placeholder="Ej: 50"
                  />
                </label>
              </div>
            </>
          )}

          {/* Navegación inferior */}
          <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-300 bg-white px-5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancelar
            </button>
            <div className="flex items-center gap-2">
              {step > 1 && (
                <button
                  type="button"
                  onClick={goBack}
                  className="rounded-xl border border-slate-300 bg-white px-5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Anterior
                </button>
              )}
              {step < 3 ? (
                <button
                  type="button"
                  onClick={goNext}
                  disabled={
                    loadingData ||
                    (step === 1 && !canNextFromStep1) ||
                    (step === 2 && !canNextFromStep2)
                  }
                  className="rounded-xl bg-emerald-900 px-6 py-2 text-sm font-semibold text-white hover:bg-emerald-800 disabled:bg-slate-200 disabled:text-slate-400"
                >
                  Siguiente
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleCreate}
                  disabled={loadingData || !canCreate || saving}
                  className="rounded-xl bg-emerald-900 px-6 py-2 text-sm font-semibold text-white hover:bg-emerald-800 disabled:bg-slate-200"
                >
                  {saving ? "Creando..." : "Crear lugar de producción"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NewProductionPlaceModal;
