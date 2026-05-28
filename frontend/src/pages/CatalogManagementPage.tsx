import { useEffect, useMemo, useState } from 'react';
import { ArrowUpRight, Bug, Leaf, Search, Sprout, X } from 'lucide-react';
import DashboardLayout, { type DashboardViewKey } from '../components/layout/DashboardLayout';
import type { SessionUser } from '../App';
import { getCatalogPests, getCatalogSpecies, type CatalogPestApiItem, type CatalogSpeciesApiItem } from '../services/catalogo.api';

type Props = {
  sessionUser?: SessionUser;
  onGoHome?: () => void;
  onGoUsers?: () => void;
  onGoRoles?: () => void;
  onGoAgricultural?: () => void;
  onGoApprovalPlaces?: () => void;
  onGoInspectionsAgenda?: () => void;
  onGoInspectionsHistory?: () => void;
  onGoReports?: () => void;
  onLogout?: () => void;
};


/**
 * Representa una entrada del catálogo de especies vegetales con variedades y plagas asociadas.
 */
type SpeciesItem = CatalogSpeciesApiItem;

/**
 * Representa una entrada del catálogo de plagas con las especies afectadas.
 */
type PestItem = CatalogPestApiItem;

/**
 * Tarjeta pequeña de KPI usada en la sección de resumen del catálogo.
 */
const Kpi = ({ t, v, s, i }: { t: string; v: number; s: string; i: React.ReactNode }) => (
  <article className="group relative overflow-hidden rounded-2xl border border-white/60 bg-white/75 p-4 shadow-[0_10px_30px_rgba(2,6,23,.08)] backdrop-blur-md transition-all hover:-translate-y-1 hover:shadow-[0_16px_36px_rgba(16,185,129,.18)]">
    <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-emerald-100/60 blur-2xl" />
    <div className="relative flex items-start justify-between">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">{t}</p>
        <p className="mt-1 text-4xl font-extrabold text-slate-900">{v}</p>
        <p className="text-xs text-slate-600">{s}</p>
      </div>
      <span className="grid h-12 w-12 place-items-center rounded-xl border border-white/70 bg-white text-emerald-700 shadow-inner">{i}</span>
    </div>
  </article>
);

/**
 * Widget simple de etiqueta-valor para secciones de detalles en modal.
 */
const InfoWidget = ({ label, value }: { label: string; value: string }) => (
  <article className="rounded-xl border border-white/70 bg-gradient-to-b from-white/95 to-slate-100/80 p-4 shadow-[0_8px_18px_rgba(15,23,42,.06)]">
    <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">{label}</p>
    <p className="mt-1.5 text-sm font-semibold text-slate-900">{value}</p>
  </article>
);

/**
 * Componente de página para gestionar el catálogo técnico de especies vegetales y plagas.
 *
 * Esta página admite dos modos de catálogo:
 * - species: muestra especies vegetales, variedades asociadas y plagas vinculadas.
 * - pests: muestra plagas fitosanitarias y las especies que afectan.
 *
 * También ofrece tablas con búsqueda y vistas de detalle en modal para ambos tipos de catálogo.
 */
export default function CatalogManagementPage({
  sessionUser,
  onGoHome,
  onGoUsers,
  onGoRoles,
  onGoAgricultural,
  onGoApprovalPlaces,
  onGoInspectionsAgenda,
  onGoInspectionsHistory,
  onGoReports,
  onLogout,
}: Props) {
  const [tab, setTab] = useState<'species' | 'pests'>('species');
  const [q, setQ] = useState('');
  const [sp, setSp] = useState<SpeciesItem | null>(null);
  const [pt, setPt] = useState<PestItem | null>(null);
  const [species, setSpecies] = useState<SpeciesItem[]>([]);
  const [pests, setPests] = useState<PestItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  const fSp = useMemo(
    () =>
      !q.trim()
        ? species
        : species.filter((i) =>
            [i.nombreComun, i.nombreCientifico, ...i.variedades].join(' ').toLowerCase().includes(q.toLowerCase()),
          ),
    [q, species],
  );
  const fPt = useMemo(
    () =>
      !q.trim()
        ? pests
        : pests.filter((i) =>
            [i.nombre_comun, i.nombre_cientifico, ...i.especiesAfectadas].join(' ').toLowerCase().includes(q.toLowerCase()),
          ),
    [q, pests],
  );

  useEffect(() => {
    const h = (e: KeyboardEvent) => e.key === 'Escape' && (setSp(null), setPt(null));
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, []);

  /**
   * Carga inicial de catálogo desde backend (BD real).
   */
  useEffect(() => {
    let mounted = true;

    const loadCatalog = async () => {
      try {
        setLoading(true);
        setError('');
        const [speciesData, pestsData] = await Promise.all([getCatalogSpecies(), getCatalogPests()]);
        if (!mounted) return;
        setSpecies(speciesData);
        setPests(pestsData);
      } catch (err) {
        console.error('Error cargando catálogo:', err);
        if (!mounted) return;
        setError('No fue posible cargar datos de catálogo desde la base de datos.');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadCatalog();

    return () => {
      mounted = false;
    };
  }, []);

  const nav = (v: DashboardViewKey) => { if (v === 'home') onGoHome?.(); if (v === 'users') onGoUsers?.(); if (v === 'roles') onGoRoles?.(); if (v === 'agricultural') onGoAgricultural?.(); if (v === 'approval-places') onGoApprovalPlaces?.(); if (v === 'inspections-agenda') onGoInspectionsAgenda?.(); if (v === 'inspections-history') onGoInspectionsHistory?.(); if (v === 'reports') onGoReports?.(); };

  return (
    <DashboardLayout title="Catálogos" subtitle={tab === 'species' ? 'Catálogo técnico de especies y variedades' : 'Centro fitosanitario de plagas, severidad y control'} sessionUser={sessionUser} activeView="catalog" onNavigate={nav} onLogout={onLogout}>
      <section className="space-y-5">

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          <Kpi
          t={tab === 'species' ? 'Especies registradas' : 'Plagas registradas'}
          v={tab === 'species' ? species.length : pests.length}
          s={tab === 'species' ? 'Base taxonómica activa' : 'Vigilancia fitosanitaria activa'}
          i={tab === 'species' ? <Sprout size={20} /> : <Bug size={20} />}
        />
        <Kpi
          t={tab === 'species' ? 'Variedades asociadas' : 'Especies afectadas'}
          v={tab === 'species' ? species.reduce((a, i) => a + i.variedades.length, 0) : pests.reduce((a, i) => a + i.especiesAfectadas.length, 0)}
          s="Indicadores técnicos"
          i={<Leaf size={20} />}
        />
        <Kpi
          t={tab === 'species' ? 'Plagas asociadas' : 'Especies asociadas'}
          v={tab === 'species' ? species.reduce((a, i) => a + i.plagas.length, 0) : pests.reduce((a, i) => a + i.especiesAfectadas.length, 0)}
          s="Indicadores técnicos"
          i={<Leaf size={20} />}
        />
        </div>

        <article className="rounded-2xl border border-slate-200 bg-white shadow-[0_10px_30px_rgba(15,23,42,.06)]">
          <header className="flex flex-col gap-3 border-b border-slate-100 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
            <div><h3 className="text-xl font-extrabold tracking-tight text-slate-900">{tab === 'species' ? 'Catálogo de Especies Vegetales' : 'Catálogo de Plagas Fitosanitarias'}</h3><p className="mt-1 text-sm text-slate-500">{tab === 'species' ? 'Taxonomía, variedades y plagas asociadas por especie.' : 'Severidad, especies afectadas y métodos de control.'}</p></div>
            <div className="relative rounded-2xl border border-white/70 bg-white/70 p-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,.9),0_8px_20px_rgba(15,23,42,.08)] backdrop-blur-md">
              <div className="relative grid grid-cols-2 rounded-xl bg-slate-100/80 p-1">
                <span className={`pointer-events-none absolute top-1 h-[calc(100%-8px)] w-[calc(50%-6px)] rounded-lg bg-white shadow-[0_6px_18px_rgba(16,185,129,.22)] transition-all ${tab === 'species' ? 'left-1' : 'left-[calc(50%+2px)]'}`} />
                <button onClick={() => setTab('species')} className={`relative z-[1] inline-flex items-center justify-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold ${tab === 'species' ? 'text-emerald-700' : 'text-slate-600'}`}><Leaf size={15} />Especies Vegetales</button>
                <button onClick={() => setTab('pests')} className={`relative z-[1] inline-flex items-center justify-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold ${tab === 'pests' ? 'text-emerald-700' : 'text-slate-600'}`}><Bug size={15} />Plagas Fitosanitarias</button>
              </div>
            </div>
          </header>

          <div className="px-5 py-4">
            <div className="mb-4 w-full max-w-3xl rounded-xl border border-white/70 bg-white/75 p-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,.95),0_10px_25px_rgba(15,23,42,.06)] backdrop-blur">
              <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2.5"><Search size={16} className="text-slate-400" /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder={tab === 'species' ? 'Buscar por especie o variedad...' : 'Buscar por plaga ...'} className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400" /></div>
            </div>
            {loading ? (
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 text-sm text-slate-600">Cargando catálogo...</div>
            ) : error ? (
              <div className="rounded-xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">{error}</div>
            ) : tab === 'species' ? (
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

                <div className="overflow-x-auto">
                  <table className="min-w-full">

                    {/* HEADER */}
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>

                        <th className="px-6 py-4 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                          Especie
                        </th>

                        <th className="px-6 py-4 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                          Nombre científico
                        </th>

                        <th className="px-6 py-4 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                          Ciclo
                        </th>

                        <th className="px-6 py-4 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                          Variedades
                        </th>

                        <th className="px-6 py-4 text-center text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                          Acción
                        </th>

                      </tr>
                    </thead>

                    {/* BODY */}
                    <tbody className="divide-y divide-slate-100">

                      {fSp.map((i) => (
                        <tr
                          key={i.id}
                          className="group transition hover:bg-emerald-50/40"
                        >

                          {/* ESPECIE */}
                          <td className="px-6 py-5">

                            <div className="flex items-center gap-4">

                              <img
                                src={i.imagen}
                                alt={i.nombreComun}
                                className="h-12 w-12 rounded-xl object-cover border border-slate-200"
                              />

                              <div>
                                <p className="font-semibold text-slate-900">
                                  {i.nombreComun}
                                </p>


                              </div>

                            </div>

                          </td>

                          {/* NOMBRE CIENTIFICO */}
                          <td className="px-6 py-5">

                            <p className="italic text-slate-700">
                              {i.nombreCientifico}
                            </p>

                          </td>

                          {/* CICLO */}
                          <td className="px-6 py-5">

                            <span className="inline-flex rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                              {i.ciclo}
                            </span>

                          </td>

                          {/* VARIEDADES */}
                          <td className="px-6 py-5">

                            <div className="flex flex-wrap gap-2">

                              {i.variedades.map((v) => (
                                <span
                                  key={v}
                                  className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700"
                                >
                                  {v}
                                </span>
                              ))}

                            </div>

                          </td>

                          {/* BOTON */}
                          <td className="px-6 py-5 text-center">

                            <button
                              onClick={() => setSp(i)}
                              className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100 hover:shadow-sm"
                            >
                              Ver detalle
                              <ArrowUpRight size={14} />
                            </button>

                          </td>

                        </tr>
                      ))}

                    </tbody>

                  </table>
                </div>

              </div>
            ) : (
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

                <div className="overflow-x-auto">
                  <table className="min-w-full">

                    {/* HEADER */}
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>

                        <th className="px-6 py-4 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                          Plaga
                        </th>

                        <th className="px-6 py-4 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                          Nombre científico
                        </th>

                        <th className="px-6 py-4 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                          Especies afectadas
                        </th>

                        <th className="px-6 py-4 text-center text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                          Acción
                        </th>

                      </tr>
                    </thead>

                    {/* BODY */}
                    <tbody className="divide-y divide-slate-100">

                      {fPt.map((i) => (
                        <tr
                          key={i.id_plaga}
                          className="group transition hover:bg-red-50/30"
                        >

                          {/* PLAGA */}
                          <td className="px-6 py-5">

                            <div className="flex items-center gap-4">

                              <img
                                src={i.imagen_plaga}
                                alt={i.nombre_comun}
                                className="h-12 w-12 rounded-xl object-cover border border-slate-200"
                              />

                              <div>

                                <p className="font-semibold text-slate-900">
                                  {i.nombre_comun}
                                </p>

                              </div>

                            </div>

                          </td>

                          {/* NOMBRE */}
                          <td className="px-6 py-5">
                            <p className="italic text-slate-700">
                              {i.nombre_cientifico}
                            </p>
                          </td>

                          {/* ESPECIES */}
                          <td className="px-6 py-5">

                            <div className="flex flex-wrap gap-2">

                              {i.especiesAfectadas.map((s) => (
                                <span
                                  key={s}
                                  className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700"
                                >
                                  {s}
                                </span>
                              ))}

                            </div>

                          </td>

                          {/* BOTON */}
                          <td className="px-6 py-5 text-center">

                            <button
                              onClick={() => setPt(i)}
                              className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100 hover:shadow-sm"
                            >
                              Ver detalle
                              <ArrowUpRight size={14} />
                            </button>

                          </td>

                        </tr>
                      ))}

                    </tbody>

                  </table>
                </div>

              </div>
            )}

          </div>
        </article>
      </section>

      {sp && (
        <div className="fixed inset-0 z-[70] grid place-items-center bg-slate-900/70 p-4 backdrop-blur-sm" onClick={() => setSp(null)}>
          <div className="w-full max-w-5xl overflow-hidden rounded-2xl border border-white/20 bg-white shadow-[0_24px_70px_rgba(2,6,23,.5)]" onClick={(e) => e.stopPropagation()}>
            <div className="relative h-44 bg-cover bg-center px-6 py-5 text-white md:h-48" style={{ backgroundImage: `url(${sp.imagen})` }}>
              <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(2,6,23,.85)_10%,rgba(2,6,23,.58)_50%,rgba(2,6,23,.4)_100%)]" />
              <button onClick={() => setSp(null)} className="absolute right-4 top-4 z-10 grid h-9 w-9 place-items-center rounded-full border border-white/35 bg-white/20 text-white hover:bg-white/30"><X size={17} /></button>
              <div className="relative z-[1] mt-8 max-w-2xl">
                <h3 className="text-5xl font-extrabold leading-[.95] tracking-tight">{sp.nombreComun}</h3>
                <p className="mt-1 text-2xl italic text-slate-100">{sp.nombreCientifico}</p>
              </div>
            </div>
            <div className="grid gap-4 bg-gradient-to-b from-white to-slate-50 p-5 lg:grid-cols-12">
              <section className="space-y-3 lg:col-span-5">
                <h4 className="text-xl font-bold tracking-tight text-slate-900">Información General</h4>
                <div className="grid gap-2.5 sm:grid-cols-2">
                  <InfoWidget label="Nombre común" value={sp.nombreComun} />
                  <InfoWidget label="Nombre científico" value={sp.nombreCientifico} />
                  <InfoWidget label="Ciclo cultivo" value={sp.ciclo} />
                </div>
              </section>
              <section className="space-y-3 lg:col-span-7">
                <article className="rounded-xl border border-white/70 bg-white/85 p-4 shadow-[0_8px_20px_rgba(2,6,23,.07)]">
                  <h4 className="text-xl font-bold tracking-tight text-slate-900">Variedades Asociadas</h4>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {sp.variedades.map((v) => (
                      <span key={v} className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700">{v}</span>
                    ))}
                  </div>
                </article>
                <article className="rounded-xl border border-white/70 bg-white/90 p-4 shadow-[0_8px_20px_rgba(2,6,23,.07)]">
                  <h4 className="text-xl font-bold tracking-tight text-slate-900">Plagas Relacionadas</h4>
                  <div className="mt-3 space-y-2.5">
                    {sp.plagas.map((p) => (
                      <div key={p.id_plaga} className="rounded-xl border border-slate-200 bg-gradient-to-r from-white to-slate-50 px-3.5 py-3 hover:border-emerald-200 hover:shadow-sm">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold text-slate-900">{p.nombre_comun}</p>
                            <p className="text-xs italic text-slate-500">{p.nombre_cientifico}</p>
                          </div>
                          <button onClick={() => { const f = pests.find((x) => x.id_plaga === p.id_plaga); if (f) setPt(f); }} className="inline-flex items-center gap-1 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-100">Ver detalle <ArrowUpRight size={12} /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                </article>
              </section>
            </div>
          </div>
        </div>
      )}

      {pt && (
        <div className="fixed inset-0 z-[75] grid place-items-center bg-slate-900/70 p-4 backdrop-blur-sm" onClick={() => setPt(null)}>
          <div className="w-full max-w-5xl overflow-hidden rounded-2xl border border-white/20 bg-white shadow-[0_24px_70px_rgba(2,6,23,.5)]" onClick={(e) => e.stopPropagation()}>
            <div className="relative h-44 bg-cover bg-center px-6 py-5 text-white md:h-48" style={{ backgroundImage: `url(${pt.imagen_plaga})` }}>
              <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(2,6,23,.85)_10%,rgba(2,6,23,.58)_50%,rgba(2,6,23,.4)_100%)]" />
              <button onClick={() => setPt(null)} className="absolute right-4 top-4 z-10 grid h-9 w-9 place-items-center rounded-full border border-white/35 bg-white/20 text-white hover:bg-white/30"><X size={17} /></button>
              <div className="relative z-[1] mt-8 max-w-2xl">
                <h3 className="text-5xl font-extrabold leading-[.95] tracking-tight">{pt.nombre_comun}</h3>
                <p className="mt-1 text-2xl italic text-slate-100">{pt.nombre_cientifico}</p>

              </div>
            </div>
            <div className="grid gap-4 bg-gradient-to-b from-white to-slate-50 p-5 lg:grid-cols-12">
              <div className="space-y-3 lg:col-span-8">
                <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"><p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Nombre Cientifico</p><div className="mt-3 flex flex-wrap gap-2">{pt.nombre_cientifico}</div></article>
                <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"><p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Tipo de Plaga</p><div className="mt-3 flex flex-wrap gap-2">{pt.tipo_plaga ?? 'N/A'}</div></article>
                <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"><p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Especies afectadas</p><div className="mt-3 flex flex-wrap gap-2">{pt.especiesAfectadas.map((s) => <span key={s} className="rounded-full border border-rose-200 bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-700">{s}</span>)}</div></article>
              </div>
              {/* <div className="space-y-3 lg:col-span-4">
                <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"><p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Severidad</p><span className={`mt-2 inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${sev(pt.severidad)}`}>{pt.severidad}</span></article>
                <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"><p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Riesgo fitosanitario</p><p className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-slate-800">{pt.severidad === 'Alta' ? <ShieldAlert size={15} /> : <AlertTriangle size={15} />} Vigilancia activa</p></article>
              </div> */}
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
