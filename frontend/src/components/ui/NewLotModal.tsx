// frontend/src/components/ui/NewLotModal.tsx
import { CalendarDays, Leaf, Search, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { fincaService } from '../../services/finca.service';
import type { EspecieUI } from '../../types/finca.types';

// 💡 SOLUCIÓN ERROR: Firma sincronizada con ProductionLotsPage
type NewLotModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  idLugarProduccion?: string; // Necesario para la persistencia en la BD
};

// Extensión para manejar variedades (o dejarlo genérico si el backend no lo exige aún)
type VarietyItem = {
  id: string; // Adaptado a UUID
  nombre: string;
};

const steps = ['Datos Básicos', 'Seleccionar Especie', 'Seleccionar Variedad'];

function NewLotModal({ isOpen, onClose, onSuccess, idLugarProduccion }: NewLotModalProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Estados del Formulario (Paso 1)
  const [numero, setNumero] = useState('');
  const [areaHa, setAreaHa] = useState('');
  const [fechaSiembra, setFechaSiembra] = useState('');
  const [fechaCosecha, setFechaCosecha] = useState('');

  // Estados Catálogos (Paso 2 y 3)
  const [speciesSearch, setSpeciesSearch] = useState('');
  const [speciesList, setSpeciesList] = useState<EspecieUI[]>([]);
  const [selectedSpeciesId, setSelectedSpeciesId] = useState<string | null>(null);
  
  // Mock temporal para variedades hasta que el backend envíe el catálogo completo
  const [varietiesList, setVarietiesList] = useState<VarietyItem[]>([]);
  const [selectedVarietyId, setSelectedVarietyId] = useState<string | null>(null);

  // ─── CARGA DE CATÁLOGOS DESDE EL BACKEND ─────────────────────────────────
  useEffect(() => {
    const fetchCatalogos = async () => {
      if (!isOpen) return;
      try {
        setLoading(true);
        setError('');
        const resEspecies = await fincaService.getEspeciesVegetales();
        setSpeciesList(resEspecies.data.map((e: any) => ({
          id_especie_vegetal: e.id_especie_vegetal,
          nombre_comun: e.nombre_comun,
          nombre_cientifico: e.nombre_especie || 'N/A',
          ciclo_cultivo: e.ciclo_cultivo || 'General',
        })));
        
        // Simulación básica de variedades para no bloquear la interfaz.
        // En un escenario real, harías: const resVar = await fincaService.getVariedades(selectedSpeciesId)
        setVarietiesList([
          { id: 'VAR-001', nombre: 'Variedad Estándar A' },
          { id: 'VAR-002', nombre: 'Variedad Premium B' },
        ]);
      } catch (err: any) {
        setError('Error cargando el catálogo de especies: ' + err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchCatalogos();
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      setStep(1);
      setNumero('');
      setAreaHa('');
      setFechaSiembra('');
      setFechaCosecha('');
      setSpeciesSearch('');
      setSelectedSpeciesId(null);
      setSelectedVarietyId(null);
      setError('');
    }
  }, [isOpen]);

  // ─── FILTRADO ─────────────────────────────────────────────────────────────
  const filteredSpecies = useMemo(() => {
    const q = speciesSearch.trim().toLowerCase();
    if (!q) return speciesList;
    return speciesList.filter((sp) =>
      sp.nombre_comun.toLowerCase().includes(q) ||
      sp.nombre_cientifico.toLowerCase().includes(q)
    );
  }, [speciesSearch, speciesList]);

  const selectedSpecies = useMemo(
    () => speciesList.find((s) => s.id_especie_vegetal === selectedSpeciesId) ?? null,
    [selectedSpeciesId, speciesList]
  );

  // ─── VALIDACIONES DE FLUJO ────────────────────────────────────────────────
  const canContinueStep1 = numero.trim().length >= 3 && Number(areaHa) > 0 && fechaSiembra.trim().length > 0;
  const canContinueStep2 = selectedSpeciesId !== null;
  const canCreate = selectedVarietyId !== null && canContinueStep1 && canContinueStep2;

  const handleSelectSpecies = (id: string) => {
    setSelectedSpeciesId(id);
    setSelectedVarietyId(null);
  };

  const goNext = () => {
    if (step === 1 && !canContinueStep1) return;
    if (step === 2 && !canContinueStep2) return;
    if (step < 3) setStep((prev) => prev + 1);
  };

  const goBack = () => {
    if (step > 1) setStep((prev) => prev - 1);
  };

  // ─── PERSISTENCIA (POST AL BACKEND) ───────────────────────────────────────
  const handleCreate = async () => {
    if (!canCreate || !idLugarProduccion || saving) return;

    try {
      setSaving(true);
      setError('');

      // Construcción del DTO Físico esperado por tu base de datos y backend
      const payload = {
        numero_lote: numero.trim(),
        area_total: Number(areaHa),
        fecha_siembra: fechaSiembra,
        fecha_cosecha: fechaCosecha || null,
        estado: 'Activo',
        cantidad_plantas: 0, // Ajusta si agregas el campo al paso 1
        id_variedad: selectedVarietyId,
        // Como eliminaste el id_lote de la solicitud y lo anclaste, pasamos la FK directa
        id_lugar_produccion: idLugarProduccion 
      };

      // 💡 Asegúrate de tener este método en tu finca.service.ts
      await fincaService.createLote(idLugarProduccion, payload);
      
      onSuccess(); // Dispara la recarga de la tabla en el componente padre
    } catch (e: any) {
      setError(e.message || 'No se pudo registrar el lote. Revisa los datos.');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/45 px-4 py-6 backdrop-blur-[1px]">
      <div className="w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/5">
        <div className="bg-emerald-900 px-5 py-4 text-white">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-emerald-800 ring-1 ring-white/20">
                <Leaf size={22} />
              </div>
              <div>
                <h3 className="text-3xl font-bold leading-none">Nuevo Lote</h3>
                <p className="mt-1 text-sm text-emerald-100">Paso {step} de 3 — {steps[step - 1]}</p>
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

          <div className="mt-4 grid grid-cols-3 gap-2">
            {steps.map((s, idx) => {
              const number = idx + 1;
              const active = number === step;
              const done = number < step;
              return (
                <div key={s} className="flex items-center gap-2">
                  <span className={`grid h-6 w-6 place-items-center rounded-full text-xs font-bold ${
                      active ? 'bg-white text-emerald-900' : done ? 'bg-emerald-400 text-emerald-950' : 'bg-emerald-800 text-emerald-200'
                    }`}
                  >
                    {number}
                  </span>
                  <span className={`text-sm ${active ? 'text-white' : done ? 'text-emerald-100' : 'text-emerald-200/80'}`}>
                    {s}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="px-5 py-5 sm:px-6">
          {error && <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 font-semibold">{error}</div>}
          
          {loading ? (
             <div className="py-10 text-center text-slate-500 animate-pulse">Cargando catálogos del ICA...</div>
          ) : (
            <>
              {step === 1 && (
                <>
                  <h4 className="mb-4 text-2xl font-semibold text-slate-800">Datos Físicos del Lote</h4>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="space-y-1.5">
                      <span className="text-sm font-medium text-slate-700">Identificador / Número *</span>
                      <input
                        type="text"
                        value={numero}
                        onChange={(e) => setNumero(e.target.value)}
                        className="h-11 w-full rounded-xl border border-slate-300 px-3 text-sm outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
                        placeholder="Ej: LOTE-A1"
                      />
                    </label>

                    <label className="space-y-1.5">
                      <span className="text-sm font-medium text-slate-700">Área Exclusiva (ha) *</span>
                      <input
                        type="number"
                        value={areaHa}
                        onChange={(e) => setAreaHa(e.target.value)}
                        min={0}
                        step="0.1"
                        className="h-11 w-full rounded-xl border border-slate-300 px-3 text-sm outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
                        placeholder="Ej: 2.5"
                      />
                    </label>

                    <label className="space-y-1.5">
                      <span className="text-sm font-medium text-slate-700">Fecha de Siembra *</span>
                      <div className="relative">
                        <input
                          type="date"
                          value={fechaSiembra}
                          onChange={(e) => setFechaSiembra(e.target.value)}
                          className="h-11 w-full rounded-xl border border-slate-300 px-3 pr-10 text-sm outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
                        />
                        <CalendarDays size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      </div>
                    </label>

                    <label className="space-y-1.5">
                      <span className="text-sm font-medium text-slate-700">Fecha de Cosecha Estimada</span>
                      <div className="relative">
                        <input
                          type="date"
                          value={fechaCosecha}
                          onChange={(e) => setFechaCosecha(e.target.value)}
                          className="h-11 w-full rounded-xl border border-slate-300 px-3 pr-10 text-sm outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
                        />
                        <CalendarDays size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      </div>
                    </label>
                  </div>
                </>
              )}

              {step === 2 && (
                <>
                  <h4 className="mb-2 text-2xl font-semibold text-slate-800">Catálogo de Especies Vegetales</h4>
                  <p className="mb-4 text-sm text-slate-600">Busca y selecciona la especie cultivada en este lote.</p>

                  <div className="mb-4 flex w-full items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2.5 shadow-sm">
                    <Search size={18} className="text-slate-400" />
                    <input
                      type="text"
                      value={speciesSearch}
                      onChange={(e) => setSpeciesSearch(e.target.value)}
                      placeholder="Buscar por nombre común o científico..."
                      className="w-full bg-transparent text-base text-slate-700 outline-none"
                    />
                  </div>

                  <div className="max-h-[300px] space-y-3 overflow-y-auto pr-1">
                    {filteredSpecies.map((sp) => {
                      const selected = selectedSpeciesId === sp.id_especie_vegetal;
                      return (
                        <button
                          type="button"
                          key={sp.id_especie_vegetal}
                          onClick={() => handleSelectSpecies(sp.id_especie_vegetal)}
                          className={`w-full flex justify-between items-center rounded-xl border px-4 py-3 text-left transition ${
                            selected ? 'border-emerald-300 bg-emerald-50 shadow-sm' : 'border-slate-200 bg-white hover:border-emerald-200'
                          }`}
                        >
                          <div>
                            <p className="text-xl font-bold text-slate-800">{sp.nombre_comun}</p>
                            <p className="text-sm italic text-slate-600">{sp.nombre_cientifico}</p>
                          </div>
                          <span className="inline-flex rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700 uppercase">
                            {sp.ciclo_cultivo}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </>
              )}

              {step === 3 && (
                <>
                  <h4 className="mb-2 text-2xl font-semibold text-slate-800">Especificar Variedad</h4>
                  
                  <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
                    <p className="text-sm text-emerald-900">
                      Especie Padre: <span className="font-bold text-lg">{selectedSpecies?.nombre_comun ?? 'N/A'}</span>
                    </p>
                  </div>

                  <div className="space-y-3">
                    {varietiesList.map((variety) => {
                      const selected = selectedVarietyId === variety.id;
                      return (
                        <button
                          type="button"
                          key={variety.id}
                          onClick={() => setSelectedVarietyId(variety.id)}
                          className={`w-full rounded-xl border px-4 py-3 text-left text-lg font-semibold transition ${
                            selected ? 'border-emerald-300 bg-emerald-50 text-emerald-900 shadow-sm' : 'border-slate-200 bg-white text-slate-800 hover:border-emerald-200'
                          }`}
                        >
                          {variety.nombre}
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </>
          )}

          <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="rounded-xl border border-slate-300 bg-white px-5 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Cancelar
            </button>

            <div className="flex items-center gap-2">
              {step > 1 && (
                <button
                  type="button"
                  onClick={goBack}
                  disabled={saving}
                  className="rounded-xl border border-slate-300 bg-white px-5 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Anterior
                </button>
              )}

              {step < 3 ? (
                <button
                  type="button"
                  onClick={goNext}
                  disabled={loading || (step === 1 && !canContinueStep1) || (step === 2 && !canContinueStep2)}
                  className="rounded-xl bg-emerald-900 px-6 py-2 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:bg-emerald-700/50"
                >
                  Siguiente
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleCreate}
                  disabled={!canCreate || saving}
                  className="rounded-xl bg-emerald-900 px-6 py-2 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:bg-emerald-700/50"
                >
                  {saving ? 'Guardando en BD...' : 'Registrar Lote Fitosanitario'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NewLotModal;