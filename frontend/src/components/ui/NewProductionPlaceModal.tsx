import { Search, Sprout, Warehouse, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { api } from '../../services/api';

type NewProductionPlaceModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (payload: {
    nombreLugarProduccion: string;
    numeroRegistroICA: string;
    idUsuarioProductor: string;
  }) => Promise<void> | void;
};

type Predio = {
  id: string;
  nombre: string;
  codigo: string;
  municipio: string;
  departamento: string;
  areaHa: number;
};

type Species = {
  id: string;
  commonName: string;
  scientificName: string;
  category: string;
};

type ProducerOption = {
  id: string;
  label: string;
};

const steps = ['Selección de predios', 'Especies', 'Datos'];

function NewProductionPlaceModal({ isOpen, onClose, onCreate }: NewProductionPlaceModalProps) {
  const [step, setStep] = useState(1);
  const [loadingData, setLoadingData] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [saving, setSaving] = useState(false);

  const [predioSearch, setPredioSearch] = useState('');
  const [speciesSearch, setSpeciesSearch] = useState('');
  const [selectedPredios, setSelectedPredios] = useState<string[]>([]);
  const [selectedSpecies, setSelectedSpecies] = useState<string[]>([]);

  const [predios, setPredios] = useState<Predio[]>([]);
  const [species, setSpecies] = useState<Species[]>([]);
  const [producerOptions, setProducerOptions] = useState<ProducerOption[]>([]);

  const [nombreLugar, setNombreLugar] = useState('');
  const [registroIca, setRegistroIca] = useState('');
  const [capacidadProduccion, setCapacidadProduccion] = useState('');
  const [idUsuarioProductor, setIdUsuarioProductor] = useState('');

  useEffect(() => {
    const loadData = async () => {
      if (!isOpen) return;

      try {
        setLoadingData(true);
        setLoadError('');

        const [prediosRes, lotesRes, usuariosRes, rolesRes] = await Promise.all([
          api.getPredios(),
          api.getLotes(),
          api.getUsuarios(),
          api.getRoles(),
        ]);

        const mappedPredios: Predio[] = prediosRes.data.map((p) => ({
          id: p.id,
          nombre: p.nombrePredio || 'Predio sin nombre',
          codigo: p.numeroPredial || 'N/D',
          municipio: 'N/D',
          departamento: 'N/D',
          areaHa: Number(p.areaTotal || 0),
        }));
        setPredios(mappedPredios);

        const roleNameById = new Map(rolesRes.data.map((r) => [r.id, r.nombreRol.toLowerCase()]));
        const productores = usuariosRes.data
          .filter((u) => {
            const roleName = (u.idRol && roleNameById.get(u.idRol)) || u.Rol?.nombreRol?.toLowerCase() || '';
            return roleName.includes('productor');
          })
          .map((u) => ({
            id: u.id,
            label: `${u.nombre} ${u.apellidos} (${u.numeroIdentificacion})`,
          }));
        setProducerOptions(productores);

        const derivedSpeciesMap = new Map<string, Species>();
        for (const l of lotesRes.data) {
          const key = l.idVariedad || l.numeroLote || l.id;
          if (!key) continue;
          if (!derivedSpeciesMap.has(key)) {
            derivedSpeciesMap.set(key, {
              id: key,
              commonName: l.numeroLote ? `Variedad / Lote ${l.numeroLote}` : 'Especie registrada',
              scientificName: `Variedad ${l.idVariedad || 'N/D'}`,
              category: 'Derivada de lotes',
            });
          }
        }

        const derived = Array.from(derivedSpeciesMap.values());
        const fallbackSpecies: Species[] = [
          { id: 'fallback-1', commonName: 'Especie General 1', scientificName: 'N/D', category: 'General' },
          { id: 'fallback-2', commonName: 'Especie General 2', scientificName: 'N/D', category: 'General' },
        ];

        setSpecies(derived.length ? derived : fallbackSpecies);
      } catch (e: any) {
        setLoadError(e.message || 'No se pudieron cargar predios/especies/productores');
      } finally {
        setLoadingData(false);
      }
    };

    loadData();
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      setStep(1);
      setPredioSearch('');
      setSpeciesSearch('');
      setSelectedPredios([]);
      setSelectedSpecies([]);
      setNombreLugar('');
      setRegistroIca('');
      setCapacidadProduccion('');
      setIdUsuarioProductor('');
      setLoadError('');
      setSaving(false);
    }
  }, [isOpen]);

  const filteredPredios = useMemo(() => {
    const q = predioSearch.trim().toLowerCase();
    if (!q) return predios;
    return predios.filter((p) => {
      return (
        p.nombre.toLowerCase().includes(q) ||
        p.codigo.toLowerCase().includes(q) ||
        p.municipio.toLowerCase().includes(q) ||
        p.departamento.toLowerCase().includes(q)
      );
    });
  }, [predioSearch, predios]);

  const filteredSpecies = useMemo(() => {
    const q = speciesSearch.trim().toLowerCase();
    if (!q) return species;
    return species.filter((s) => {
      return (
        s.commonName.toLowerCase().includes(q) ||
        s.scientificName.toLowerCase().includes(q) ||
        s.category.toLowerCase().includes(q)
      );
    });
  }, [speciesSearch, species]);

  const areaConsolidada = useMemo(() => {
    return predios
      .filter((p) => selectedPredios.includes(p.id))
      .reduce((acc, p) => acc + p.areaHa, 0);
  }, [selectedPredios, predios]);

  const selectedSpeciesData = useMemo(
    () => species.filter((s) => selectedSpecies.includes(s.id)),
    [selectedSpecies, species],
  );

  if (!isOpen) return null;

  const togglePredio = (id: string) => {
    setSelectedPredios((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const toggleSpecies = (id: string) => {
    setSelectedSpecies((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const canNextFromStep1 = selectedPredios.length > 0;
  const canNextFromStep2 = selectedSpecies.length > 0;
  const canCreate =
    nombreLugar.trim().length > 0 &&
    registroIca.trim().length > 0 &&
    capacidadProduccion.trim().length > 0 &&
    idUsuarioProductor.trim().length > 0;

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
      await onCreate({
        nombreLugarProduccion: nombreLugar.trim(),
        numeroRegistroICA: registroIca.trim(),
        idUsuarioProductor: idUsuarioProductor.trim(),
      });
      onClose();
    } finally {
      setSaving(false);
    }
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
                <p className="mt-1 text-sm text-emerald-100">Paso {step} de 3 — Crear Lugar de Producción</p>
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
                  <span
                    className={`text-sm ${
                      active ? 'text-white' : done ? 'text-emerald-100' : 'text-emerald-200/80'
                    }`}
                  >
                    {s}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="px-5 py-5 sm:px-6">
          {loadError ? (
            <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm text-rose-700">
              {loadError}
            </div>
          ) : null}

          {loadingData ? (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
              Cargando datos de predios, especies y productores...
            </div>
          ) : null}

          {!loadingData && step === 1 ? (
            <>
              <p className="mb-4 text-sm text-slate-600">
                Seleccione los predios que conformarán este lugar de producción. El área total se calculará automáticamente.
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

              <div className="max-h-[260px] space-y-3 overflow-y-auto pr-1">
                {filteredPredios.map((predio) => {
                  const checked = selectedPredios.includes(predio.id);

                  return (
                    <label
                      key={predio.id}
                      className={`flex cursor-pointer items-center justify-between rounded-xl border px-4 py-3 transition ${
                        checked
                          ? 'border-emerald-300 bg-emerald-50 shadow-sm'
                          : 'border-slate-200 bg-white hover:border-emerald-200'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => togglePredio(predio.id)}
                          className="mt-1 h-5 w-5 rounded border-slate-300 text-emerald-700 focus:ring-emerald-400"
                        />
                        <div>
                          <p className="text-base font-semibold text-slate-800">{predio.nombre}</p>
                          <p className="text-sm text-slate-500">
                            {predio.codigo} · {predio.municipio}, {predio.departamento}
                          </p>
                        </div>
                      </div>
                      <p className="text-lg font-bold text-slate-700">{predio.areaHa} ha</p>
                    </label>
                  );
                })}
              </div>

              <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
                <p className="text-sm text-emerald-900">
                  <span className="font-semibold">{selectedPredios.length}</span> predio(s) seleccionado(s) · Área consolidada{' '}
                  <span className="text-lg font-bold">{areaConsolidada.toFixed(1)} ha</span>
                </p>
              </div>
            </>
          ) : null}

          {!loadingData && step === 2 ? (
            <div className="grid gap-4 lg:grid-cols-[1fr_290px]">
              <div>
                <h4 className="mb-2 text-2xl font-semibold text-slate-800">Seleccionar Especies Vegetales</h4>
                <p className="mb-4 text-sm text-slate-600">
                  Configura las especies que estarán autorizadas para este lugar de producción.
                </p>

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

                <div className="max-h-[320px] space-y-3 overflow-y-auto pr-1">
                  {filteredSpecies.map((sp) => {
                    const checked = selectedSpecies.includes(sp.id);

                    return (
                      <label
                        key={sp.id}
                        className={`flex cursor-pointer items-center justify-between rounded-xl border px-4 py-3 transition ${
                          checked
                            ? 'border-emerald-300 bg-emerald-50 shadow-sm'
                            : 'border-slate-200 bg-white hover:border-emerald-200'
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
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-emerald-800">
                      Seleccionadas
                    </p>
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

          {!loadingData && step === 3 ? (
            <>
              <h4 className="mb-4 text-2xl font-semibold text-slate-800">Datos del Lugar de Producción</h4>

              <div className="mb-4 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3">
                <p className="text-sm font-medium text-blue-800">Área consolidada (solo lectura)</p>
                <p className="text-4xl font-extrabold text-blue-700">{areaConsolidada.toFixed(1)} ha</p>
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

                <label className="space-y-1.5 sm:col-span-2">
                  <span className="text-sm font-medium text-slate-700">Capacidad Producción</span>
                  <input
                    type="text"
                    value={capacidadProduccion}
                    onChange={(e) => setCapacidadProduccion(e.target.value)}
                    className="h-11 w-full rounded-xl border border-slate-300 px-3 text-sm outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
                    placeholder="Ej: 120 toneladas / ciclo"
                  />
                </label>

                <label className="space-y-1.5 sm:col-span-2">
                  <span className="text-sm font-medium text-slate-700">Productor responsable</span>
                  <select
                    value={idUsuarioProductor}
                    onChange={(e) => setIdUsuarioProductor(e.target.value)}
                    className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
                  >
                    <option value="">Seleccione un productor...</option>
                    {producerOptions.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.label}
                      </option>
                    ))}
                  </select>
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
                  disabled={loadingData || (step === 1 && !canNextFromStep1) || (step === 2 && !canNextFromStep2)}
                  className="rounded-xl bg-emerald-900 px-6 py-2 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-emerald-700/50"
                >
                  Siguiente
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleCreate}
                  disabled={loadingData || !canCreate || saving}
                  className="rounded-xl bg-emerald-900 px-6 py-2 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-emerald-700/50"
                >
                  {saving ? 'Creando...' : 'Crear lugar de producción'}
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
