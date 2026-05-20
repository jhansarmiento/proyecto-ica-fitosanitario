import { useMemo, useState } from 'react';
import { ArrowLeft, CheckCircle2, ChevronRight, Eye, Minus, Plus } from 'lucide-react';
import DashboardLayout, { type DashboardViewKey } from '../components/layout/DashboardLayout';
import type { SessionUser } from '../App';

type InspectionProcessPageProps = {
  sessionUser?: SessionUser;
  onGoHome?: () => void;
  onGoUsers?: () => void;
  onGoRoles?: () => void;
  onGoAgricultural?: () => void;
  onGoApprovalPlaces?: () => void;
  onGoInspectionsAgenda?: () => void;
  onGoInspectionsHistory?: () => void;
  onLogout?: () => void;
  onBack?: () => void;
  onFinish?: () => void;
};

type ProcessStep = 1 | 2 | 3 | 4;

type LotItem = {
  id: string;
  cultivo: string;
  nombreCientifico: string;
  fechaSiembra: string;
  plantas: number;
  areaHa: number;
  estado: 'Pendiente' | 'Inspeccionado';
};

type PestItem = {
  id: string;
  nombre: string;
  nombreCientifico: string;
};

const initialLots: LotItem[] = [
  {
    id: 'LOT-001',
    cultivo: 'Café Arábica',
    nombreCientifico: 'Coffea arabica',
    fechaSiembra: '2024-02-01',
    plantas: 850,
    areaHa: 15.5,
    estado: 'Pendiente',
  },
  {
    id: 'LOT-002',
    cultivo: 'Aguacate',
    nombreCientifico: 'Persea americana',
    fechaSiembra: '2024-03-15',
    plantas: 320,
    areaHa: 12.4,
    estado: 'Pendiente',
  },
  {
    id: 'LOT-003',
    cultivo: 'Plátano',
    nombreCientifico: 'Musa paradisiaca',
    fechaSiembra: '2024-03-01',
    plantas: 450,
    areaHa: 8.5,
    estado: 'Pendiente',
  },
];

const pests: PestItem[] = [
  { id: 'P-1', nombre: 'Broca del Café', nombreCientifico: 'Hypothenemus hampei' },
  { id: 'P-2', nombre: 'Roya del Café', nombreCientifico: 'Hemileia vastatrix' },
];

function StepDots({ step }: { step: ProcessStep }) {
  return (
    <div className="flex items-center gap-2">
      {[1, 2, 3, 4].map((index) => (
        <span
          key={index}
          className={`h-2.5 w-2.5 rounded-full ${index <= step ? 'bg-emerald-700' : 'bg-slate-300'}`}
        />
      ))}
    </div>
  );
}

export default function InspectionProcessPage({
  sessionUser,
  onGoHome,
  onGoUsers,
  onGoRoles,
  onGoAgricultural,
  onGoApprovalPlaces,
  onGoInspectionsAgenda,
  onGoInspectionsHistory,
  onLogout,
  onBack,
  onFinish,
}: InspectionProcessPageProps) {
  const [step, setStep] = useState<ProcessStep>(1);
  const [lots, setLots] = useState<LotItem[]>(initialLots);
  const [selectedLotId, setSelectedLotId] = useState<string>('LOT-001');
  const [affectedPlants, setAffectedPlants] = useState(0);
  const [pestCounts, setPestCounts] = useState<Record<string, number>>({ 'P-1': 0, 'P-2': 0 });
  const [phenologyState, setPhenologyState] = useState('');
  const [observations, setObservations] = useState('');

  const selectedLot = useMemo(
    () => lots.find((lot) => lot.id === selectedLotId) ?? lots[0],
    [lots, selectedLotId],
  );

  const completedLots = useMemo(
    () => lots.filter((lot) => lot.estado === 'Inspeccionado').length,
    [lots],
  );

  const infestationPercent = selectedLot ? ((affectedPlants / selectedLot.plantas) * 100).toFixed(2) : '0.00';

  const nextStep = () =>
    setStep((prev) => {
      if (prev === 1) return 2;
      if (prev === 2) return 3;
      if (prev === 3) return 4;
      return 4;
    });

  const prevStep = () =>
    setStep((prev) => {
      if (prev === 4) return 3;
      if (prev === 3) return 2;
      if (prev === 2) return 1;
      return 1;
    });

  const markLotInspected = (lotId: string) => {
    setLots((prev) => prev.map((lot) => (lot.id === lotId ? { ...lot, estado: 'Inspeccionado' } : lot)));
    setSelectedLotId(lotId);
    setStep(3);
  };

  const adjustPestCount = (pestId: string, delta: number) => {
    setPestCounts((prev) => ({
      ...prev,
      [pestId]: Math.max(0, (prev[pestId] ?? 0) + delta),
    }));
  };

  const canFinish = affectedPlants > 0 && phenologyState.trim().length > 0;

  const handleNavigate = (view: DashboardViewKey) => {
    if (view === 'home') onGoHome?.();
    if (view === 'users') onGoUsers?.();
    if (view === 'roles') onGoRoles?.();
    if (view === 'agricultural') onGoAgricultural?.();
    if (view === 'approval-places') onGoApprovalPlaces?.();
    if (view === 'inspections-agenda') onGoInspectionsAgenda?.();
    if (view === 'inspections-history') onGoInspectionsHistory?.();
  };

  return (
    <DashboardLayout
      title="Realizar Inspección"
      subtitle="Proceso guiado para ejecutar la inspección fitosanitaria"
      sessionUser={sessionUser}
      activeView="inspections-agenda"
      breadcrumbs={['Inspecciones', 'Zona Productiva Norte', `Paso ${step} de 4`]}
      onNavigate={handleNavigate}
      onLogout={onLogout}
    >
      <section className="mx-auto max-w-6xl space-y-5">
        <article className="rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm sm:px-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2 text-slate-700">
              <ArrowLeft size={18} />
              <span className="text-base font-semibold">Inspecciones</span>
              <ChevronRight size={16} className="text-slate-400" />
              <span className="text-base font-semibold text-emerald-700">Zona Productiva Norte</span>
            </div>
            <StepDots step={step} />
          </div>
        </article>

        {step === 1 ? (
          <section className="space-y-4">
            <article className="rounded-2xl border border-slate-200 bg-white shadow-sm">
              <header className="border-b border-slate-100 px-5 py-4">
                <h2 className="text-2xl font-bold text-slate-900">Información del Lugar</h2>
              </header>
              <div className="grid gap-6 px-5 py-5 sm:grid-cols-2 xl:grid-cols-3">
                <div>
                  <p className="text-sm text-slate-500">Registro ICA</p>
                  <p className="mt-1 text-3xl font-bold text-slate-900">ICA-LP-2024-001</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Coordenadas</p>
                  <p className="mt-1 text-3xl font-bold text-slate-900">6.2476, -75.5658</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Fecha</p>
                  <p className="mt-1 text-3xl font-bold text-slate-900">2026-05-20</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Vereda</p>
                  <p className="mt-1 text-3xl font-bold text-slate-900">La Cabaña</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Municipio</p>
                  <p className="mt-1 text-3xl font-bold text-slate-900">Medellín</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Departamento</p>
                  <p className="mt-1 text-3xl font-bold text-slate-900">Antioquia</p>
                </div>
              </div>
            </article>

            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={onBack}
                className="rounded-xl border border-slate-300 px-4 py-2.5 text-base font-semibold text-slate-700 hover:bg-slate-50"
              >
                Volver
              </button>
              <button
                type="button"
                onClick={nextStep}
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-800 px-5 py-2.5 text-base font-semibold text-white hover:bg-emerald-900"
              >
                Continuar <ChevronRight size={18} />
              </button>
            </div>
          </section>
        ) : null}

        {step === 2 ? (
          <section className="space-y-4">
            <article className="rounded-2xl border border-slate-200 bg-white shadow-sm">
              <header className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                <h2 className="text-2xl font-bold text-slate-900">Lotes a Inspeccionar</h2>
                <p className="text-sm font-semibold text-slate-600">
                  {completedLots} / {lots.length} completados
                </p>
              </header>

              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-slate-50 text-left text-slate-600">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Cultivo</th>
                      <th className="px-4 py-3 font-semibold">Lote</th>
                      <th className="px-4 py-3 font-semibold">Fecha Siembra</th>
                      <th className="px-4 py-3 font-semibold">Plantas</th>
                      <th className="px-4 py-3 font-semibold">Área (ha)</th>
                      <th className="px-4 py-3 font-semibold">Estado</th>
                      <th className="px-4 py-3 font-semibold">Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lots.map((lot) => (
                      <tr key={lot.id} className="border-t border-slate-100">
                        <td className="px-4 py-3">
                          <p className="font-semibold text-slate-900">{lot.cultivo}</p>
                          <p className="text-slate-500">{lot.nombreCientifico}</p>
                        </td>
                        <td className="px-4 py-3 font-semibold">{lot.id}</td>
                        <td className="px-4 py-3">{lot.fechaSiembra}</td>
                        <td className="px-4 py-3 font-semibold">{lot.plantas}</td>
                        <td className="px-4 py-3">{lot.areaHa}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                              lot.estado === 'Inspeccionado' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                            }`}
                          >
                            {lot.estado}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <button
                            type="button"
                            onClick={() => markLotInspected(lot.id)}
                            className="inline-flex items-center gap-2 rounded-xl bg-emerald-800 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-900"
                          >
                            <Eye size={16} /> Inspeccionar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </article>

            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={prevStep}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2.5 text-base font-semibold text-slate-700 hover:bg-slate-50"
              >
                <ArrowLeft size={18} /> Volver
              </button>
              <button
                type="button"
                onClick={nextStep}
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-800 px-5 py-2.5 text-base font-semibold text-white hover:bg-emerald-900"
              >
                Continuar <ChevronRight size={18} />
              </button>
            </div>
          </section>
        ) : null}

        {step === 3 ? (
          <section className="space-y-4">
            <article className="rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">{selectedLot?.cultivo}</h2>
                  <p className="text-sm text-slate-500">
                    Lote {selectedLot?.id} • {selectedLot?.plantas} plantas
                  </p>
                </div>
                <div className="text-left sm:text-right">
                  <p className="text-sm text-slate-500">Área</p>
                  <p className="text-2xl font-bold text-emerald-700">{selectedLot?.areaHa} ha</p>
                </div>
              </div>
            </article>

            <article className="rounded-2xl border border-slate-200 bg-white shadow-sm">
              <header className="border-b border-slate-100 px-5 py-4">
                <h3 className="text-xl font-bold text-slate-900">Plantas Afectadas</h3>
              </header>
              <div className="flex items-center justify-between px-5 py-5">
                <button
                  type="button"
                  onClick={() => setAffectedPlants((prev) => Math.max(0, prev - 1))}
                  className="rounded-xl bg-slate-100 p-3 text-slate-700 hover:bg-slate-200"
                >
                  <Minus size={22} />
                </button>
                <p className="text-5xl font-bold text-emerald-900">{affectedPlants}</p>
                <button
                  type="button"
                  onClick={() => setAffectedPlants((prev) => prev + 1)}
                  className="rounded-xl bg-emerald-800 p-3 text-white hover:bg-emerald-900"
                >
                  <Plus size={22} />
                </button>
              </div>
            </article>

            <article className="rounded-2xl border border-slate-200 bg-white shadow-sm">
              <header className="border-b border-slate-100 px-5 py-4">
                <h3 className="text-xl font-bold text-slate-900">Registro de Plagas</h3>
              </header>
              <div className="space-y-3 px-5 py-5">
                {pests.map((pest) => (
                  <div key={pest.id} className="flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3">
                    <div>
                      <p className="text-lg font-semibold text-slate-900">{pest.nombre}</p>
                      <p className="text-sm text-slate-500">{pest.nombreCientifico}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => adjustPestCount(pest.id, -1)}
                        className="rounded-lg bg-slate-100 p-2 text-slate-700 hover:bg-slate-200"
                      >
                        <Minus size={18} />
                      </button>
                      <span className="w-8 text-center text-xl font-semibold text-slate-700">{pestCounts[pest.id] ?? 0}</span>
                      <button
                        type="button"
                        onClick={() => adjustPestCount(pest.id, 1)}
                        className="rounded-lg bg-emerald-800 p-2 text-white hover:bg-emerald-900"
                      >
                        <Plus size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </article>

            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={prevStep}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2.5 text-base font-semibold text-slate-700 hover:bg-slate-50"
              >
                <ArrowLeft size={18} /> Volver
              </button>
              <button
                type="button"
                onClick={nextStep}
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-800 px-5 py-2.5 text-base font-semibold text-white hover:bg-emerald-900"
              >
                Continuar <ChevronRight size={18} />
              </button>
            </div>
          </section>
        ) : null}

        {step === 4 ? (
          <section className="space-y-4">
            <article className="rounded-2xl border border-slate-200 bg-white shadow-sm">
              <header className="border-b border-slate-100 px-5 py-4">
                <h2 className="text-2xl font-bold text-slate-900">Resumen de Inspección</h2>
              </header>

              <div className="grid gap-4 px-5 py-5 md:grid-cols-2">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-wide text-slate-500">Lote</p>
                  <p className="mt-1 text-xl font-bold text-slate-900">
                    {selectedLot?.id} - {selectedLot?.cultivo}
                  </p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-wide text-slate-500">Plantas Totales</p>
                  <p className="mt-1 text-xl font-bold text-slate-900">{selectedLot?.plantas}</p>
                </div>
                <div className="rounded-xl border border-rose-200 bg-rose-50 p-4">
                  <p className="text-xs uppercase tracking-wide text-rose-600">Plantas Afectadas</p>
                  <p className="mt-1 text-4xl font-bold text-rose-600">{affectedPlants}</p>
                </div>
                <div className="rounded-xl border border-rose-200 bg-rose-50 p-4">
                  <p className="text-xs uppercase tracking-wide text-rose-600">% Infestación</p>
                  <p className="mt-1 text-4xl font-bold text-rose-600">{infestationPercent}%</p>
                </div>
              </div>

              <div className="space-y-4 px-5 pb-5">
                <div>
                  <label className="mb-1 block text-sm font-semibold text-slate-700">Estado Fenológico *</label>
                  <select
                    value={phenologyState}
                    onChange={(e) => setPhenologyState(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
                  >
                    <option value="">Seleccionar estado...</option>
                    <option value="Vegetativo">Vegetativo</option>
                    <option value="Floración">Floración</option>
                    <option value="Fructificación">Fructificación</option>
                    <option value="Maduración">Maduración</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-semibold text-slate-700">Observaciones</label>
                  <textarea
                    rows={4}
                    value={observations}
                    onChange={(e) => setObservations(e.target.value)}
                    placeholder="Observaciones del técnico..."
                    className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
                  />
                </div>
              </div>
            </article>

            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={prevStep}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2.5 text-base font-semibold text-slate-700 hover:bg-slate-50"
              >
                <ArrowLeft size={18} /> Volver
              </button>
              <button
                type="button"
                onClick={onFinish}
                disabled={!canFinish}
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-5 py-2.5 text-base font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <CheckCircle2 size={18} /> Finalizar Inspección
              </button>
            </div>
          </section>
        ) : null}
      </section>
    </DashboardLayout>
  );
}
