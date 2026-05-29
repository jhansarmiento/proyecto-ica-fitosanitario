import { Search, Sprout, Warehouse, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

type ProductionSiteEditable = {
  id_lugar_produccion: string | number;
  nombre_lugar_produccion: string;
  municipio: string;
  departamento: string;
  predios_asociados: number;
  especies_autorizadas: number;
  lotes_activos: number;
  area_total: string;
  numero_registro_ica: string;
  estado: 'Activo' | 'Pendiente' | 'Rechazado';
};

type EditProductionPlaceModalProps = {
  isOpen: boolean;
  site: ProductionSiteEditable | null;
  onClose: () => void;
  onSave: (updated: ProductionSiteEditable) => void;
};

type Predio = {
  id_predio: number;
  nombre_predio: string;
  codigo: string;
  municipio: string;
  departamento: string;
  area_total: number;
};

type Species = {
  id: number;
  commonName: string;
  scientificName: string;
  category: string;
};

const prediosMock: Predio[] = [
  { id_predio: 1, nombre_predio: 'Finca Santa Rosa', codigo: 'PRD-003', municipio: 'Acevedo', departamento: 'Huila', area_total: 28 },
  { id_predio: 2, nombre_predio: 'Lote El Mirador', codigo: 'PRD-017', municipio: 'Pitalito', departamento: 'Huila', area_total: 13 },
  { id_predio: 3, nombre_predio: 'Hacienda La Esperanza', codigo: 'PRD-022', municipio: 'Garzón', departamento: 'Huila', area_total: 41 },
  { id_predio: 4, nombre_predio: 'Parcela Campo Verde', codigo: 'PRD-031', municipio: 'La Plata', departamento: 'Huila', area_total: 18 },
];

const speciesMock: Species[] = [
  { id: 1, commonName: 'Pepino', scientificName: 'Cucumis sativus', category: 'Hortalizas' },
  { id: 2, commonName: 'Calabaza', scientificName: 'Cucurbita maxima', category: 'Hortalizas' },
  { id: 3, commonName: 'Papa', scientificName: 'Solanum tuberosum', category: 'Tubérculos' },
  { id: 4, commonName: 'Fresa', scientificName: 'Fragaria × ananassa', category: 'Frutas' },
  { id: 5, commonName: 'Aguacate', scientificName: 'Persea americana', category: 'Frutas' },
  { id: 6, commonName: 'Tomate', scientificName: 'Solanum lycopersicum', category: 'Hortalizas' },
];

const steps = ['Selección de predios', 'Especies', 'Datos'];

function parseArea(area: string) {
  const parsed = Number(area.replace('ha', '').trim());
  return Number.isFinite(parsed) ? parsed : 0;
}

function EditProductionPlaceModal({ isOpen, site, onClose, onSave }: EditProductionPlaceModalProps) {
  const [step, setStep] = useState(1);

  const [predioSearch, setPredioSearch] = useState('');
  const [speciesSearch, setSpeciesSearch] = useState('');
  const [selectedPredios, setSelectedPredios] = useState<number[]>([]);
  const [selectedSpecies, setSelectedSpecies] = useState<number[]>([]);

  const [nombreLugar, setNombreLugar] = useState('');
  const [registroIca, setRegistroIca] = useState('');

  useEffect(() => {
    if (!isOpen || !site) return;

    setStep(1);
    setPredioSearch('');
    setSpeciesSearch('');
    setNombreLugar(site.nombre_lugar_produccion);
    setRegistroIca(site.numero_registro_ica);

    setSelectedPredios(prediosMock.slice(0, Math.max(site.predios_asociados, 1)).map((p) => p.id_predio));
    setSelectedSpecies(speciesMock.slice(0, Math.max(site.especies_autorizadas, 1)).map((s) => s.id));
  }, [isOpen, site]);

  const filteredPredios = useMemo(() => {
    const q = predioSearch.trim().toLowerCase();
    if (!q) return prediosMock;
    return prediosMock.filter((p) => {
      return (
        p.nombre_predio.toLowerCase().includes(q) ||
        p.codigo.toLowerCase().includes(q) ||
        p.municipio.toLowerCase().includes(q) ||
        p.departamento.toLowerCase().includes(q)
      );
    });
  }, [predioSearch]);

  const filteredSpecies = useMemo(() => {
    const q = speciesSearch.trim().toLowerCase();
    if (!q) return speciesMock;
    return speciesMock.filter((s) => {
      return (
        s.commonName.toLowerCase().includes(q) ||
        s.scientificName.toLowerCase().includes(q) ||
        s.category.toLowerCase().includes(q)
      );
    });
  }, [speciesSearch]);

  const areaConsolidada = useMemo(() => {
    return prediosMock
      .filter((p) => selectedPredios.includes(p.id_predio))
      .reduce((acc, p) => acc + p.area_total, 0);
  }, [selectedPredios]);

  const selectedSpeciesData = useMemo(
    () => speciesMock.filter((s) => selectedSpecies.includes(s.id)),
    [selectedSpecies],
  );

  if (!isOpen || !site) return null;

  const togglePredio = (id: number) => {
    setSelectedPredios((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const toggleSpecies = (id: number) => {
    setSelectedSpecies((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const canNextFromStep1 = selectedPredios.length > 0;
  const canNextFromStep2 = selectedSpecies.length > 0;
  const canSave = nombreLugar.trim().length > 0 && registroIca.trim().length > 0;

  const goNext = () => {
    if (step === 1 && !canNextFromStep1) return;
    if (step === 2 && !canNextFromStep2) return;
    if (step < 3) setStep((prev) => prev + 1);
  };

  const goBack = () => {
    if (step > 1) setStep((prev) => prev - 1);
  };

  const handleSave = () => {
    if (!canSave) return;

    const areaFinal = areaConsolidada > 0 ? areaConsolidada : parseArea(site.area_total);

    onSave({
      ...site,
      nombre_lugar_produccion: nombreLugar.trim(),
      municipio: prediosMock.find((p) => selectedPredios.includes(p.id_predio))?.municipio ?? site.municipio,
      departamento: prediosMock.find((p) => selectedPredios.includes(p.id_predio))?.departamento ?? site.departamento,
      predios_asociados: selectedPredios.length,
      especies_autorizadas: selectedSpecies.length,
      area_total: `${areaFinal.toFixed(1)} ha`,
      numero_registro_ica: registroIca.trim(),
      estado: site.estado,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/45 px-4 py-6 backdrop-blur-[1px]">
      <div className="w-full max-w-5xl overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/5">
        <div className="bg-emerald-900 px-5 py-4 text-white">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-emerald-800 ring-1 ring-white/20">
                <Warehouse size={22} />
              </div>
              <div>
                <h3 className="text-3xl font-bold leading-none">
                  {step === 1 ? 'Selección de predios' : step === 2 ? 'Selección de especies' : 'Datos'}
                </h3>
                <p className="mt-1 text-sm text-emerald-100">Paso {step} de 3 — Editar Lugar de Producción</p>
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
              <p className="mb-4 text-sm text-slate-600">
                Ajuste los predios que conforman este lugar de producción. El área total se recalcula automáticamente.
              </p>

              <div className="mb-4 flex w-full items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2.5 shadow-sm transition focus-within:border-emerald-400 focus-within:ring-4 focus-within:ring-emerald-100">
                <Search size={18} className="text-slate-400" />
                <input
                  type="text"
                  value={predioSearch}
                  onChange={(e) => setPredioSearch(e.target.value)}
                  placeholder="Buscar predios disponibles"
                  className="w-full bg-transparent text-base text-slate-700 placeholder:text-slate-400 outline-none"
                />
              </div>

              <div className="max-h-65 space-y-3 overflow-y-auto pr-1">
                {filteredPredios.map((predio) => {
                  const checked = selectedPredios.includes(predio.id_predio);

                  return (
                    <label
                      key={predio.id_predio}
                      className={`flex cursor-pointer items-center justify-between rounded-xl border px-4 py-3 transition ${
                        checked ? 'border-emerald-300 bg-emerald-50 shadow-sm' : 'border-slate-200 bg-white hover:border-emerald-200'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => togglePredio(predio.id_predio)}
                          className="mt-1 h-5 w-5 rounded border-slate-300 text-emerald-700 focus:ring-emerald-400"
                        />
                        <div>
                          <p className="text-base font-semibold text-slate-800">{predio.nombre_predio}</p>
                          <p className="text-sm text-slate-500">
                            {predio.codigo} · {predio.municipio}, {predio.departamento}
                          </p>
                        </div>
                      </div>
                      <p className="text-lg font-bold text-slate-700">{predio.area_total} ha</p>
                    </label>
                  );
                })}
              </div>

              <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
                <p className="text-sm text-emerald-900">
                  <span className="font-semibold">{selectedPredios.length}</span> predio(s) seleccionado(s) · Área consolidada:{' '}
                  <span className="text-lg font-bold">{areaConsolidada.toFixed(1)} ha</span>
                </p>
              </div>
            </>
          ) : null}

          {step === 2 ? (
            <div className="grid gap-4 lg:grid-cols-[1fr_290px]">
              <div>
                <h4 className="mb-2 text-2xl font-semibold text-slate-800">Seleccionar Especies Vegetales</h4>
                <p className="mb-4 text-sm text-slate-600">Ajusta las especies autorizadas para este lugar de producción.</p>

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

                <div className="max-h-80 space-y-3 overflow-y-auto pr-1">
                  {filteredSpecies.map((sp) => {
                    const checked = selectedSpecies.includes(sp.id);

                    return (
                      <label
                        key={sp.id}
                        className={`flex cursor-pointer items-center justify-between rounded-xl border px-4 py-3 transition ${
                          checked ? 'border-emerald-300 bg-emerald-50 shadow-sm' : 'border-slate-200 bg-white hover:border-emerald-200'
                        }`}
                      >
                        <div>
                          <p className="text-2xl font-semibold text-slate-800">{sp.commonName}</p>
                          <p className="text-sm italic text-slate-600">{sp.scientificName}</p>
                          <span className="mt-1 inline-flex rounded-full border border-slate-200 bg-white px-2 py-0.5 text-xs font-semibold text-slate-700">
                            {sp.category}
                          </span>
                        </div>
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleSpecies(sp.id)}
                          className="h-5 w-5 rounded border-slate-300 text-emerald-700 focus:ring-emerald-400"
                        />
                      </label>
                    );
                  })}
                </div>
              </div>

              <aside className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <h5 className="text-xl font-bold text-slate-900">Resumen de Configuración</h5>
                <div className="mt-4 space-y-4">
                  <div>
                    <p className="text-slate-500">Especies seleccionadas:</p>
                    <p className="text-3xl font-extrabold text-slate-900">{selectedSpecies.length}</p>
                  </div>
                  <div>
                    <p className="text-slate-500">Área disponible:</p>
                    <p className="text-3xl font-extrabold text-slate-900">{areaConsolidada.toFixed(1)} ha</p>
                  </div>

                  <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-emerald-800">Seleccionadas</p>
                    <div className="max-h-24 space-y-1 overflow-y-auto pr-1">
                      {selectedSpeciesData.length ? (
                        selectedSpeciesData.map((s) => (
                          <p key={s.id} className="flex items-center gap-2 text-sm text-emerald-900">
                            <Sprout size={14} />
                            {s.commonName}
                          </p>
                        ))
                      ) : (
                        <p className="text-sm text-emerald-800/80">Sin especies seleccionadas</p>
                      )}
                    </div>
                  </div>
                </div>
              </aside>
            </div>
          ) : null}

          {step === 3 ? (
            <>
              <h4 className="mb-4 text-2xl font-semibold text-slate-800">Datos del Lugar de Producción</h4>

              <div className="mb-4 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3">
                <p className="text-sm font-medium text-blue-800">Área consolidada (solo lectura)</p>
                <p className="text-4xl font-extrabold text-blue-700">
                  {(areaConsolidada > 0 ? areaConsolidada : parseArea(site.area_total)).toFixed(1)} ha
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-1.5">
                  <span className="text-sm font-medium text-slate-700">Nombre</span>
                  <input
                    type="text"
                    value={nombreLugar}
                    onChange={(e) => setNombreLugar(e.target.value)}
                    className="h-11 w-full rounded-xl border border-slate-300 px-3 text-sm outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
                    placeholder="Ej: Lugar Productivo Norte"
                  />
                </label>

                <label className="space-y-1.5">
                  <span className="text-sm font-medium text-slate-700">Número Registro ICA</span>
                  <input
                    type="text"
                    value={registroIca}
                    onChange={(e) => setRegistroIca(e.target.value)}
                    className="h-11 w-full rounded-xl border border-slate-300 px-3 text-sm outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
                    placeholder="Ej: ICA-2026-0781"
                  />
                </label>

              </div>

              <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-sm text-slate-600">
                  Predios seleccionados: <span className="font-bold text-slate-800">{selectedPredios.length}</span> ·
                  Especies seleccionadas: <span className="font-bold text-slate-800">{selectedSpecies.length}</span>
                </p>
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
                  disabled={(step === 1 && !canNextFromStep1) || (step === 2 && !canNextFromStep2)}
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

export default EditProductionPlaceModal;
