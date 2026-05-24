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
  onGoCatalog?: () => void;
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
  imagen: string;
};

type PestItem = {
  id: string;
  nombre: string;
  nombreCientifico: string;
  imagen: string;
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
    imagen: 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'LOT-002',
    cultivo: 'Aguacate',
    nombreCientifico: 'Persea americana',
    fechaSiembra: '2024-03-15',
    plantas: 320,
    areaHa: 12.4,
    estado: 'Pendiente',
    imagen: 'https://images.unsplash.com/photo-1601039641847-7857b994d704?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'LOT-003',
    cultivo: 'Plátano',
    nombreCientifico: 'Musa paradisiaca',
    fechaSiembra: '2024-03-01',
    plantas: 450,
    areaHa: 8.5,
    estado: 'Pendiente',
    imagen: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=600&q=80'
  },
];

const pests: PestItem[] = [
  {
    id: 'P-1',
    nombre: 'Broca del Café',
    nombreCientifico: 'Hypothenemus hampei',
    imagen: 'https://images.unsplash.com/photo-1595152772835-219674b2a8a6?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'P-2',
    nombre: 'Roya del Café',
    nombreCientifico: 'Hemileia vastatrix',
    imagen: 'https://images.unsplash.com/photo-1471193945509-9ad0617afabf?auto=format&fit=crop&w=600&q=80'
  },
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
  onGoCatalog,
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
    if (view === 'catalog') onGoCatalog?.();
    if (view === 'approval-places') onGoApprovalPlaces?.();
    if (view === 'inspections-agenda') onGoInspectionsAgenda?.();
    if (view === 'inspections-history') onGoInspectionsHistory?.();
  };

  return (
    <DashboardLayout
      title="Realizar Inspección"
      subtitle="Proceso para ejecutar la inspección fitosanitaria"
      sessionUser={sessionUser}
      activeView="inspections-agenda"
      onNavigate={handleNavigate}
      onLogout={onLogout}
    >
      <section className="mx-auto max-w-7xl space-y-2">
        <article className="rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm sm:px-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2 text-slate-700">
              {/* <ArrowLeft size={18} /> */}             
              <span className="text-base font-semibold">Inspecciones</span>
              <ChevronRight size={16} className="text-slate-400" />
              <span className="text-base font-semibold text-emerald-700">Zona Productiva Norte</span>
            </div>
            <StepDots step={step} />
          </div>
        </article>
{step === 1 ? (
  <section className="space-y-4">

    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

      {/* HEADER */}
      <div className="border-b border-slate-100 bg-gradient-to-r from-[#015c4b] to-[#0b6b57] px-6 py-4">

        <div className="flex items-center justify-between">

          <div>

            <span className="inline-flex rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.15em] text-emerald-50">
              Lugar de Producción
            </span>

            <h2 className="mt-3 text-3xl font-black tracking-tight text-white">
              Información General
            </h2>

            <p className="mt-1 text-sm text-white/70">
              Datos registrados para la inspección fitosanitaria
            </p>

          </div>

          <div className="rounded-xl bg-white/10 px-4 py-2 backdrop-blur-sm">

            <p className="text-[11px] uppercase tracking-wide text-white/60">
              Estado
            </p>

            <p className="text-sm font-semibold text-white">
              Programada
            </p>

          </div>

        </div>

      </div>

      {/* GRID INFO */}
      <div className="grid gap-2 p-5 sm:grid-cols-2 xl:grid-cols-3">

        <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            Registro ICA
          </p>
          <h3 className="mt-2 text-xl font-black text-slate-900">
            ICA-LP-2024-001
          </h3>
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            Coordenadas
          </p>
          <h3 className="mt-2 text-xl font-black text-slate-900">
            6.2476, -75.5658
          </h3>
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            Fecha
          </p>
          <h3 className="mt-2 text-xl font-black text-slate-900">
            2026-05-20
          </h3>
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            Vereda
          </p>
          <h3 className="mt-2 text-xl font-black text-slate-900">
            La Cabaña
          </h3>
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            Municipio / Departamento
          </p>
          <h3 className="mt-2 text-xl font-black text-slate-900">
            Medellín / Antioquia
          </h3>
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            Productor
          </p>
          <h3 className="mt-2 text-xl font-black text-slate-900">
            Carlos Restrepo
          </h3>
          <p className="mt-1 text-sm font-medium text-slate-500">
            310 000 0000
          </p>
        </div>

      </div>

      {/* MAPA */}
      <div className="border-t border-slate-100 p-5">

        <div className="overflow-hidden rounded-2xl border border-slate-200 shadow-sm">

          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3">

            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                Ubicación Geográfica
              </p>

              <h3 className="mt-1 text-lg font-bold text-slate-900">
                Mapa del Lugar
              </h3>
            </div>

            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
              Coordenadas verificadas
            </span>

          </div>

          <div className="relative h-[300px] w-full">

            <iframe
              title="Mapa Lugar Productivo"
              width="100%"
              height="100%"
              loading="lazy"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
              className="border-0"
              src="https://www.google.com/maps?q=6.2476,-75.5658&hl=es&z=16&output=embed"
            />

            <div className="absolute bottom-4 left-4 rounded-xl bg-white/95 px-4 py-3 shadow-lg">

              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                Coordenadas ICA
              </p>

              <h4 className="mt-1 text-sm font-bold text-slate-900">
                6.2476, -75.5658
              </h4>

              <p className="text-xs text-slate-500">
                Medellín, Antioquia
              </p>

            </div>

          </div>

        </div>

      </div>

    </article>

    {/* BOTONES */}
    <div className="flex items-center justify-between">

      <button
        type="button"
        onClick={onBack}
        className="
          rounded-xl border border-slate-300
          px-4 py-2.5 text-sm font-semibold
          text-slate-700 transition-all duration-200
          hover:border-slate-400 hover:bg-slate-100
        "
      >
        Volver
      </button>

      <button
        type="button"
        onClick={nextStep}
        className="
          inline-flex items-center gap-2
          rounded-xl bg-emerald-800
          px-5 py-2.5 text-sm font-semibold
          text-white transition-all duration-200
          hover:bg-emerald-900
        "
      >
        Continuar
        <ChevronRight size={16} />
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
                      <th className="px-6 py-3 font-semibold">Cultivo</th>
                      <th className="px-4 py-3 font-semibold">Lote</th>
                      <th className="px-4 py-3 font-semibold">Fecha Siembra</th>
                      <th className="px-4 py-3 font-semibold">Plantas</th>
                      <th className="px-4 py-3 font-semibold">Área (ha)</th>
                      <th className="px-4 py-3 font-semibold">Estado</th>
                      <th className="px-6 py-3 font-semibold">Acción</th>
                    </tr>
                  </thead>
                  <tbody>
{lots.map((lot) => (
  <tr
    key={lot.id}
    className="
      border-t
      border-slate-100
      transition-all
      duration-300
      hover:bg-emerald-50/40
    "
  >

    {/* CULTIVO */}
    <td className="px-5 py-4">

      <div className="flex items-center gap-4">

        {/* IMAGE */}
        <div className="relative h-16 w-16 overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shadow-sm">

          <img
            src={lot.imagen}
            alt={lot.cultivo}
            className="h-full w-full object-cover transition duration-500 hover:scale-110"
          />

        </div>

        {/* INFO */}
        <div>

          <p className="text-lg font-bold tracking-tight text-slate-900">
            {lot.cultivo}
          </p>

          <p className="mt-1 text-sm italic text-slate-500">
            {lot.nombreCientifico}
          </p>

        </div>

      </div>

    </td>

    {/* ID */}
    <td className="px-5 py-4">

      <span className="rounded-xl bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700">
        {lot.id}
      </span>

    </td>

    {/* FECHA */}
    <td className="px-5 py-4">

      <div>
        <p className="font-semibold text-slate-900">
          {lot.fechaSiembra}
        </p>

        <p className="mt-1 text-xs text-slate-500">
          Fecha siembra
        </p>
      </div>

    </td>

    {/* PLANTAS */}
    <td className="px-5 py-4">

      <div>

        <p className="text-lg font-bold text-slate-900">
          {lot.plantas}
        </p>

        <p className="text-xs text-slate-500">
          Plantas
        </p>

      </div>

    </td>

    {/* AREA */}
    <td className="px-5 py-4">

      <div>

        <p className="text-lg font-bold text-slate-900">
          {lot.areaHa}
        </p>

        <p className="text-xs text-slate-500">
          Hectáreas
        </p>

      </div>

    </td>

    {/* ESTADO */}
    <td className="px-5 py-4">

      <span
        className={`
          inline-flex
          items-center
          rounded-full
          px-3
          py-1.5
          text-xs
          font-bold
          tracking-wide
          ${
            lot.estado === 'Inspeccionado'
              ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
              : 'bg-amber-100 text-amber-700 border border-amber-200'
          }
        `}
      >
        {lot.estado}
      </span>

    </td>

    {/* ACTION */}
    <td className="px-5 py-4">

      <button
        type="button"
        onClick={() => markLotInspected(lot.id)}
        className="
          inline-flex
          items-center
          gap-2
          rounded-2xl
          bg-gradient-to-r
          from-emerald-700
          to-emerald-600
          px-4
          py-2.5
          text-sm
          font-semibold
          text-white
          shadow-sm
          transition-all
          duration-300
          hover:-translate-y-0.5
          hover:shadow-lg
          hover:from-emerald-800
          hover:to-emerald-700
          active:translate-y-0
        "
      >
        <Eye size={16} />
        Inspeccionar
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
                    Lote {selectedLot?.id} 
                    {/* • {selectedLot?.plantas} plantas */}
                  </p>
                </div>
                <div className="text-left sm:text-right">
                  <p className="text-sm text-slate-500">Área</p>
                  <p className="text-2xl font-bold text-emerald-700">{selectedLot?.areaHa} ha</p>
                </div>
              </div>
            </article>

            <article className="rounded-2xl border border-slate-200 bg-white shadow-sm">
              <header className="border-b border-slate-100 px-4 py-3">
                <h3 className="text-xl font-bold text-slate-900">Plantas</h3>
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
<div className="space-y-4 px-5 py-5">
  {pests.map((pest) => (
    <div
      key={pest.id}
      className="
        group flex items-center justify-between
        rounded-2xl border border-slate-200
        bg-white px-4 py-4
        shadow-sm transition-all duration-200
        hover:-translate-y-0.5
        hover:border-emerald-200
        hover:shadow-md
      "
    >

      {/* INFORMACIÓN */}
      <div className="flex items-center gap-4">

        {/* IMAGEN */}
        <div className="h-16 w-16 overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
          <img
            src={pest.imagen}
            alt={pest.nombre}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>

        {/* TEXTO */}
        <div>

          <div className="flex items-center gap-2">

            <p className="text-lg font-bold text-slate-900">
              {pest.nombre}
            </p>

          </div>

          <p className="text-sm italic text-slate-500">
            {pest.nombreCientifico}
          </p>


        </div>

      </div>

      {/* CONTADOR */}
      <div className="flex items-center gap-3">

        <button
          type="button"
          onClick={() => adjustPestCount(pest.id, -1)}
          className="
            flex h-10 w-10 items-center justify-center
            rounded-xl border border-slate-200
            bg-slate-50 text-slate-700
            transition-all duration-200
            hover:bg-slate-100
            hover:shadow-sm
          "
        >
          <Minus size={18} />
        </button>

        <div className="min-w-[70px] rounded-xl bg-slate-50 px-4 py-2 text-center">
          <p className="text-2xl font-black text-emerald-800">
            {pestCounts[pest.id] ?? 0}
          </p>
          <p className="text-[10px] uppercase tracking-wide text-slate-400">
            Afectadas
          </p>
        </div>

        <button
          type="button"
          onClick={() => adjustPestCount(pest.id, 1)}
          className="
            flex h-10 w-10 items-center justify-center
            rounded-xl bg-emerald-800
            text-white transition-all duration-200
            hover:bg-emerald-900
            hover:shadow-md
          "
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
