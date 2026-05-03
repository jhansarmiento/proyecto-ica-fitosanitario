import { CalendarDays, Leaf, Search, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

export type EditableLot = {
  id: number;
  code: string;
  especie: string;
  variedad: string;
  areaHa: number;
  fechaSiembra: string;
  fechaCosecha?: string;
};

type EditLotModalProps = {
  isOpen: boolean;
  lot: EditableLot | null;
  onClose: () => void;
  onSave: (payload: EditableLot) => void;
};

type SpeciesItem = {
  id: number;
  nombre: string;
  nombreCientifico: string;
  categoria: string;
};

type VarietyItem = {
  id: number;
  especieId: number;
  nombre: string;
};

const speciesMock: SpeciesItem[] = [
  { id: 1, nombre: 'Pepino', nombreCientifico: 'Cucumis sativus', categoria: 'Hortalizas' },
  { id: 2, nombre: 'Calabaza', nombreCientifico: 'Cucurbita maxima', categoria: 'Hortalizas' },
  { id: 3, nombre: 'Papa', nombreCientifico: 'Solanum tuberosum', categoria: 'Tubérculos' },
  { id: 4, nombre: 'Cítricos', nombreCientifico: 'Citrus spp.', categoria: 'Frutales' },
  { id: 5, nombre: 'Café Arábica', nombreCientifico: 'Coffea arabica', categoria: 'Perennes' },
  { id: 6, nombre: 'Aguacate', nombreCientifico: 'Persea americana', categoria: 'Frutales' },
];

const varietiesMock: VarietyItem[] = [
  { id: 1, especieId: 1, nombre: 'Marketmore 76' },
  { id: 2, especieId: 1, nombre: 'Pepinova' },
  { id: 3, especieId: 2, nombre: 'Butternut' },
  { id: 4, especieId: 2, nombre: 'Castilla' },
  { id: 5, especieId: 3, nombre: 'Criolla Colombia' },
  { id: 6, especieId: 3, nombre: 'Pastusa Suprema' },
  { id: 7, especieId: 4, nombre: 'Naranja Valencia' },
  { id: 8, especieId: 4, nombre: 'Mandarina Arrayana' },
  { id: 9, especieId: 4, nombre: 'Limón Tahití' },
  { id: 10, especieId: 5, nombre: 'Castillo' },
  { id: 11, especieId: 5, nombre: 'Caturra' },
  { id: 12, especieId: 6, nombre: 'Hass' },
  { id: 13, especieId: 6, nombre: 'Lorena' },
];

const steps = ['Datos', 'Seleccionar Especie', 'Seleccionar Variedad'];

function EditLotModal({ isOpen, lot, onClose, onSave }: EditLotModalProps) {
  const [step, setStep] = useState(1);

  const [numero, setNumero] = useState('');
  const [areaHa, setAreaHa] = useState('');
  const [fechaSiembra, setFechaSiembra] = useState('');
  const [fechaCosecha, setFechaCosecha] = useState('');

  const [speciesSearch, setSpeciesSearch] = useState('');
  const [selectedSpeciesId, setSelectedSpeciesId] = useState<number | null>(null);
  const [selectedVarietyId, setSelectedVarietyId] = useState<number | null>(null);

  useEffect(() => {
    if (!isOpen || !lot) return;

    setStep(1);
    setNumero(lot.code);
    setAreaHa(String(lot.areaHa));
    setFechaSiembra(lot.fechaSiembra);
    setFechaCosecha(lot.fechaCosecha ?? '');
    setSpeciesSearch('');

    const species = speciesMock.find((s) => s.nombre.toLowerCase() === lot.especie.toLowerCase()) ?? null;
    setSelectedSpeciesId(species?.id ?? null);

    const variety = varietiesMock.find((v) => v.nombre.toLowerCase() === lot.variedad.toLowerCase()) ?? null;
    setSelectedVarietyId(variety?.id ?? null);
  }, [isOpen, lot]);

  const filteredSpecies = useMemo(() => {
    const q = speciesSearch.trim().toLowerCase();
    if (!q) return speciesMock;
    return speciesMock.filter((sp) => {
      return (
        sp.nombre.toLowerCase().includes(q) ||
        sp.nombreCientifico.toLowerCase().includes(q) ||
        sp.categoria.toLowerCase().includes(q)
      );
    });
  }, [speciesSearch]);

  const selectedSpecies = useMemo(
    () => speciesMock.find((s) => s.id === selectedSpeciesId) ?? null,
    [selectedSpeciesId],
  );

  const availableVarieties = useMemo(() => {
    if (!selectedSpeciesId) return [];
    return varietiesMock.filter((v) => v.especieId === selectedSpeciesId);
  }, [selectedSpeciesId]);

  const selectedVariety = useMemo(
    () => availableVarieties.find((v) => v.id === selectedVarietyId) ?? null,
    [availableVarieties, selectedVarietyId],
  );

  if (!isOpen || !lot) return null;

  const canContinueStep1 =
    numero.trim().length >= 3 &&
    Number(areaHa) > 0 &&
    fechaSiembra.trim().length > 0;

  const canContinueStep2 = selectedSpeciesId !== null;
  const canSave = selectedVarietyId !== null && canContinueStep1 && canContinueStep2;

  const handleSelectSpecies = (id: number) => {
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

  const handleSave = () => {
    if (!canSave || !selectedSpecies || !selectedVariety) return;

    onSave({
      ...lot,
      code: numero.trim(),
      areaHa: Number(areaHa),
      fechaSiembra,
      fechaCosecha: fechaCosecha || undefined,
      especie: selectedSpecies.nombre,
      variedad: selectedVariety.nombre,
    });

    onClose();
  };

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
                <h3 className="text-3xl font-bold leading-none">Editar Lote</h3>
                <p className="mt-1 text-sm text-emerald-100">Paso {step} de 3 — {steps[step - 1]}</p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="grid h-9 w-9 place-items-center rounded-lg text-emerald-100 transition hover:bg-white/10 hover:text-white"
              aria-label="Cerrar modal"
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
                  <span
                    className={`grid h-6 w-6 place-items-center rounded-full text-xs font-bold ${
                      active
                        ? 'bg-white text-emerald-900'
                        : done
                          ? 'bg-emerald-400 text-emerald-950'
                          : 'bg-emerald-800 text-emerald-200'
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
          {step === 1 ? (
            <>
              <h4 className="mb-4 text-2xl font-semibold text-slate-800">Datos del Lote</h4>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-1.5">
                  <span className="text-sm font-medium text-slate-700">Número de Lote *</span>
                  <input
                    type="text"
                    value={numero}
                    onChange={(e) => setNumero(e.target.value)}
                    className="h-11 w-full rounded-xl border border-slate-300 px-3 text-sm outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
                  />
                </label>

                <label className="space-y-1.5">
                  <span className="text-sm font-medium text-slate-700">Área Total (ha) *</span>
                  <input
                    type="number"
                    value={areaHa}
                    onChange={(e) => setAreaHa(e.target.value)}
                    min={0}
                    step="0.1"
                    className="h-11 w-full rounded-xl border border-slate-300 px-3 text-sm outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
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
                  <span className="text-sm font-medium text-slate-700">Fecha de Cosecha (opcional)</span>
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
          ) : null}

          {step === 2 ? (
            <>
              <h4 className="mb-2 text-2xl font-semibold text-slate-800">Seleccionar Especie Vegetal</h4>
              <p className="mb-4 text-sm text-slate-600">Selecciona la especie principal para este lote.</p>

              <div className="mb-4 flex w-full items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2.5 shadow-sm transition focus-within:border-emerald-400 focus-within:ring-4 focus-within:ring-emerald-100">
                <Search size={18} className="text-slate-400" />
                <input
                  type="text"
                  value={speciesSearch}
                  onChange={(e) => setSpeciesSearch(e.target.value)}
                  placeholder="Buscar especies..."
                  className="w-full bg-transparent text-base text-slate-700 placeholder:text-slate-400 outline-none"
                />
              </div>

              <div className="max-h-[300px] space-y-3 overflow-y-auto pr-1">
                {filteredSpecies.map((sp) => {
                  const selected = selectedSpeciesId === sp.id;
                  return (
                    <button
                      type="button"
                      key={sp.id}
                      onClick={() => handleSelectSpecies(sp.id)}
                      className={`w-full rounded-xl border px-4 py-3 text-left transition ${
                        selected
                          ? 'border-emerald-300 bg-emerald-50 shadow-sm'
                          : 'border-slate-200 bg-white hover:border-emerald-200'
                      }`}
                    >
                      <p className="text-xl font-semibold text-slate-800">{sp.nombre}</p>
                      <p className="text-sm italic text-slate-600">{sp.nombreCientifico}</p>
                      <span className="mt-1 inline-flex rounded-full border border-slate-200 bg-white px-2 py-0.5 text-xs font-semibold text-slate-700">
                        {sp.categoria}
                      </span>
                    </button>
                  );
                })}
              </div>
            </>
          ) : null}

          {step === 3 ? (
            <>
              <h4 className="mb-2 text-2xl font-semibold text-slate-800">Seleccionar Variedad</h4>
              <p className="mb-4 text-sm text-slate-600">Elige la variedad de la especie seleccionada.</p>

              <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
                <p className="text-sm text-emerald-900">
                  Especie seleccionada: <span className="font-bold">{selectedSpecies?.nombre ?? 'No seleccionada'}</span>
                </p>
              </div>

              <div className="space-y-3">
                {availableVarieties.map((variety) => {
                  const selected = selectedVarietyId === variety.id;
                  return (
                    <button
                      type="button"
                      key={variety.id}
                      onClick={() => setSelectedVarietyId(variety.id)}
                      className={`w-full rounded-xl border px-4 py-3 text-left text-lg font-semibold transition ${
                        selected
                          ? 'border-emerald-300 bg-emerald-50 text-emerald-900 shadow-sm'
                          : 'border-slate-200 bg-white text-slate-800 hover:border-emerald-200'
                      }`}
                    >
                      {variety.nombre}
                    </button>
                  );
                })}
              </div>
            </>
          ) : null}

          <div className="mt-6 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-300 bg-white px-5 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Cancelar
            </button>

            <div className="flex items-center gap-2">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={goBack}
                  className="rounded-xl border border-slate-300 bg-white px-5 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Anterior
                </button>
              ) : null}

              {step < 3 ? (
                <button
                  type="button"
                  onClick={goNext}
                  disabled={(step === 1 && !canContinueStep1) || (step === 2 && !canContinueStep2)}
                  className="rounded-xl bg-emerald-900 px-6 py-2 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-emerald-700/50"
                >
                  Siguiente
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={!canSave}
                  className="rounded-xl bg-emerald-900 px-6 py-2 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-emerald-700/50"
                >
                  Guardar cambios
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EditLotModal;
