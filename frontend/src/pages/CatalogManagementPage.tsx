import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, ArrowUpRight, Bug, Leaf, Search, ShieldAlert, Sparkles, Sprout, X } from 'lucide-react';
import DashboardLayout, { type DashboardViewKey } from '../components/layout/DashboardLayout';
import type { SessionUser } from '../App';

type Props = {
  sessionUser?: SessionUser;
  onGoHome?: () => void;
  onGoUsers?: () => void;
  onGoRoles?: () => void;
  onGoAgricultural?: () => void;
  onGoApprovalPlaces?: () => void;
  onGoInspectionsAgenda?: () => void;
  onGoInspectionsHistory?: () => void;
  onLogout?: () => void;
};

type Severity = 'Baja' | 'Media' | 'Alta';
type PestRef = { id: string; nombre: string; nombreCientifico: string; severidad: Severity };
type SpeciesItem = {
  id: string; nombreComun: string; nombreCientifico: string; tipoCultivo: string;
  ciclo: 'Corto' | 'Medio' | 'Largo'; variedades: string[]; plagas: PestRef[]; imagen: string;
};
type PestItem = {
  id: string; nombreComun: string; nombreCientifico: string; tipo: 'Insecto' | 'Hongo' | 'Bacteria';
  severidad: Severity; especiesAfectadas: string[]; metodosControl: string[]; descripcion: string; imagen: string;
};

const speciesSeed: SpeciesItem[] = [
  { id: 'SP-001', nombreComun: 'Aguacate', nombreCientifico: 'Persea americana', tipoCultivo: 'Frutal', ciclo: 'Largo', variedades: ['Hass', 'Lorena', 'Papelillo'], imagen: 'https://images.unsplash.com/photo-1601039641847-7857b994d704?auto=format&fit=crop&w=1600&q=80', plagas: [{ id: 'P-001', nombre: 'Mosca de la fruta', nombreCientifico: 'Anastrepha spp.', severidad: 'Alta' }, { id: 'P-002', nombre: 'Trips', nombreCientifico: 'Frankliniella occidentalis', severidad: 'Media' }] },
  { id: 'SP-002', nombreComun: 'Café', nombreCientifico: 'Coffea arabica', tipoCultivo: 'Permanente', ciclo: 'Largo', variedades: ['Castillo', 'Caturra', 'Colombia'], imagen: 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&w=1600&q=80', plagas: [{ id: 'P-003', nombre: 'Broca del café', nombreCientifico: 'Hypothenemus hampei', severidad: 'Alta' }, { id: 'P-004', nombre: 'Roya', nombreCientifico: 'Hemileia vastatrix', severidad: 'Alta' }] },
  { id: 'SP-003', nombreComun: 'Plátano', nombreCientifico: 'Musa paradisiaca', tipoCultivo: 'Transitorio', ciclo: 'Medio', variedades: ['Hartón', 'Dominico', 'FHIA-21'], imagen: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=1600&q=80', plagas: [{ id: 'P-005', nombre: 'Sigatoka negra', nombreCientifico: 'Mycosphaerella fijiensis', severidad: 'Alta' }] },
];

const pestsSeed: PestItem[] = [
  { id: 'P-001', nombreComun: 'Mosca de la fruta', nombreCientifico: 'Anastrepha spp.', tipo: 'Insecto', severidad: 'Alta', especiesAfectadas: ['Aguacate', 'Mango', 'Guayaba'], metodosControl: ['Monitoreo con trampas', 'Manejo integrado', 'Control cultural'], descripcion: 'Plaga de alto impacto económico en frutos en desarrollo.', imagen: 'https://unsplash.com/es/fotos/un-insecto-en-una-hoja-X9wvzGcVs54' },
  { id: 'P-002', nombreComun: 'Trips', nombreCientifico: 'Frankliniella occidentalis', tipo: 'Insecto', severidad: 'Media', especiesAfectadas: ['Aguacate', 'Pimentón', 'Tomate'], metodosControl: ['Manejo de malezas', 'Control biológico', 'Rotación de ingredientes activos'], descripcion: 'Insecto chupador que ocasiona deformaciones y debilitamiento.', imagen: 'https://images.unsplash.com/photo-1583496661160-fb5886a13d77?auto=format&fit=crop&w=1600&q=80' },
  { id: 'P-004', nombreComun: 'Roya', nombreCientifico: 'Hemileia vastatrix', tipo: 'Hongo', severidad: 'Alta', especiesAfectadas: ['Café'], metodosControl: ['Variedades tolerantes', 'Podas sanitarias', 'Aplicación preventiva dirigida'], descripcion: 'Enfermedad fúngica foliar de alto impacto productivo.', imagen: 'https://images.unsplash.com/photo-1566404883711-0d8032d13228?auto=format&fit=crop&w=1600&q=80' },
];

const sev = (s: Severity) =>
  s === 'Alta' ? 'bg-rose-100 text-rose-700 border-rose-200' : s === 'Media' ? 'bg-amber-100 text-amber-700 border-amber-200' : 'bg-emerald-100 text-emerald-700 border-emerald-200';

const Kpi = ({ t, v, s, i }: { t: string; v: number; s: string; i: React.ReactNode }) => (
  <article className="group relative overflow-hidden rounded-2xl border border-white/60 bg-white/75 p-4 shadow-[0_10px_30px_rgba(2,6,23,.08)] backdrop-blur-md transition-all hover:-translate-y-1 hover:shadow-[0_16px_36px_rgba(16,185,129,.18)]">
    <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-emerald-100/60 blur-2xl" />
    <div className="relative flex items-start justify-between">
      <div><p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">{t}</p><p className="mt-1 text-4xl font-extrabold text-slate-900">{v}</p><p className="text-xs text-slate-600">{s}</p></div>
      <span className="grid h-12 w-12 place-items-center rounded-xl border border-white/70 bg-white text-emerald-700 shadow-inner">{i}</span>
    </div>
  </article>
);

const InfoWidget = ({ label, value }: { label: string; value: string }) => (
  <article className="rounded-xl border border-white/70 bg-gradient-to-b from-white/95 to-slate-100/80 p-4 shadow-[0_8px_18px_rgba(15,23,42,.06)]">
    <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">{label}</p>
    <p className="mt-1.5 text-sm font-semibold text-slate-900">{value}</p>
  </article>
);

export default function CatalogManagementPage({
  sessionUser, onGoHome, onGoUsers, onGoRoles, onGoAgricultural, onGoApprovalPlaces, onGoInspectionsAgenda, onGoInspectionsHistory, onLogout,
}: Props) {
  const [tab, setTab] = useState<'species' | 'pests'>('species');
  const [q, setQ] = useState('');
  const [sp, setSp] = useState<SpeciesItem | null>(null);
  const [pt, setPt] = useState<PestItem | null>(null);

  const fSp = useMemo(() => !q.trim() ? speciesSeed : speciesSeed.filter(i => [i.nombreComun, i.nombreCientifico, i.codigo, ...i.variedades].join(' ').toLowerCase().includes(q.toLowerCase())), [q]);
  const fPt = useMemo(() => !q.trim() ? pestsSeed : pestsSeed.filter(i => [i.nombreComun, i.nombreCientifico, ...i.especiesAfectadas, ...i.metodosControl].join(' ').toLowerCase().includes(q.toLowerCase())), [q]);

  useEffect(() => {
    const h = (e: KeyboardEvent) => e.key === 'Escape' && (setSp(null), setPt(null));
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, []);

  const nav = (v: DashboardViewKey) => { if (v === 'home') onGoHome?.(); if (v === 'users') onGoUsers?.(); if (v === 'roles') onGoRoles?.(); if (v === 'agricultural') onGoAgricultural?.(); if (v === 'approval-places') onGoApprovalPlaces?.(); if (v === 'inspections-agenda') onGoInspectionsAgenda?.(); if (v === 'inspections-history') onGoInspectionsHistory?.(); };

  return (
    <DashboardLayout title="Gestión de Catálogos" subtitle={tab === 'species' ? 'Catálogo técnico de especies y relación fitosanitaria' : 'Centro fitosanitario de plagas, severidad y control'} sessionUser={sessionUser} activeView="catalog" breadcrumbs={['Gestión Agrícola', tab === 'species' ? 'Especies vegetales' : 'Plagas fitosanitarias']} onNavigate={nav} onLogout={onLogout}>
      <section className="space-y-5">

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          <Kpi t={tab === 'species' ? 'Especies registradas' : 'Plagas registradas'} v={tab === 'species' ? speciesSeed.length : pestsSeed.length} s={tab === 'species' ? 'Base taxonómica activa' : 'Vigilancia fitosanitaria activa'} i={tab === 'species' ? <Sprout size={20} /> : <Bug size={20} />} />
          <Kpi t={tab === 'species' ? 'Variedades asociadas' : 'Métodos de control'} v={tab === 'species' ? speciesSeed.reduce((a, i) => a + i.variedades.length, 0) : pestsSeed.reduce((a, i) => a + i.metodosControl.length, 0)} s="Indicadores técnicos" i={<Leaf size={20} />} />
          <Kpi t="Plagas Asociadas" v={pestsSeed.filter((p) => p.severidad === 'Alta').length} s="Plagas de severidad alta" i={<Bug size={20} />} />
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
              <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2.5"><Search size={16} className="text-slate-400" /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder={tab === 'species' ? 'Buscar por especie o variedad...' : 'Buscar por plaga, especie afectada o control...'} className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400" /></div>
            </div>

            {tab === 'species' ? (
              <div className="overflow-hidden rounded-xl border border-slate-200">
                <table className="min-w-full text-sm"><thead className="bg-slate-50 text-left text-[11px] uppercase tracking-wide text-slate-500"><tr><th className="px-4 py-3">Especie</th><th className="px-4 py-3">Nombre científico</th><th className="px-4 py-3">Ciclo</th><th className="px-4 py-3">Variedades</th><th className="px-4 py-3 text-center">Acción</th></tr></thead>
                  <tbody>{fSp.map((i) => <tr key={i.id} className="border-t border-slate-100 hover:bg-emerald-50/35"><td className="px-4 py-4"><span className="rounded-md border border-slate-200 bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-700">{i.codigo}</span></td><td className="px-4 py-4 font-semibold text-slate-900">{i.nombreComun}</td><td className="px-4 py-4 italic text-slate-700">{i.nombreCientifico}</td><td className="px-4 py-4"><span className="rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-[11px] font-semibold text-blue-700">{i.ciclo}</span></td><td className="px-4 py-4"><div className="flex flex-wrap gap-1.5">{i.variedades.map((v) => <span key={v} className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px]">{v}</span>)}</div></td><td className="px-4 py-4 text-center"><button onClick={() => setSp(i)} className="inline-flex items-center gap-1 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-100">Ver detalle <ArrowUpRight size={12} /></button></td></tr>)}</tbody>
                </table>
              </div>
            ) : (
              <div className="overflow-hidden rounded-xl border border-slate-200">
                <table className="min-w-full text-sm"><thead className="bg-slate-50 text-left text-[11px] uppercase tracking-wide text-slate-500"><tr><th className="px-4 py-3">Plaga</th><th className="px-4 py-3">Severidad</th><th className="px-4 py-3">Especies afectadas</th><th className="px-4 py-3">Métodos de control</th><th className="px-4 py-3"></th><th className="px-4 py-3 text-center">Acción</th></tr></thead>
                  <tbody>{fPt.map((i) => <tr key={i.id} className="border-t border-slate-100 hover:bg-emerald-50/35"><td className="px-4 py-4"><p className="font-semibold text-slate-900">{i.nombreComun}</p><p className="text-xs italic text-slate-500">{i.nombreCientifico}</p></td><td className="px-4 py-4"><span className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${sev(i.severidad)}`}>{i.severidad}</span></td><td className="px-4 py-4"><div className="flex flex-wrap gap-1.5">{i.especiesAfectadas.map((s) => <span key={s} className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px]">{s}</span>)}</div></td><td className="px-4 py-4"><div className="flex flex-wrap gap-1.5">{i.metodosControl.map((m) => <span key={m} className="rounded-md border border-emerald-100 bg-emerald-50 px-2 py-1 text-[11px] text-emerald-700">{m}</span>)}</div></td><td className="px-4 py-4 text-xs text-slate-600"></td><td className="px-4 py-4 text-center"><button onClick={() => setPt(i)} className="inline-flex items-center gap-1 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-100">Ver detalle <ArrowUpRight size={12} /></button></td></tr>)}</tbody>
                </table>
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
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="rounded-full border border-white/35 bg-white/14 px-2.5 py-1 text-[11px] font-semibold">{sp.codigo}</span>
                  <span className="rounded-full border border-white/35 bg-white/14 px-2.5 py-1 text-[11px] font-semibold">Ciclo: {sp.ciclo}</span>
                  <span className="rounded-full border border-white/35 bg-white/14 px-2.5 py-1 text-[11px] font-semibold">Tipo: {sp.tipoCultivo}</span>
                </div>
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
                      <div key={p.id} className="rounded-xl border border-slate-200 bg-gradient-to-r from-white to-slate-50 px-3.5 py-3 hover:border-emerald-200 hover:shadow-sm">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold text-slate-900">{p.nombre}</p>
                            <p className="text-xs italic text-slate-500">{p.nombreCientifico}</p>
                            <span className={`mt-1.5 inline-flex rounded-full border px-2 py-0.5 text-[11px] font-semibold ${sev(p.severidad)}`}>Severidad {p.severidad}</span>
                          </div>
                          <button onClick={() => { const f = pestsSeed.find((x) => x.id === p.id); if (f) setPt(f); }} className="inline-flex items-center gap-1 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-100">Ver detalle <ArrowUpRight size={12} /></button>
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
            <div className="relative h-44 bg-cover bg-center px-6 py-5 text-white md:h-48" style={{ backgroundImage: `url(${pt.imagen})` }}>
              <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(2,6,23,.85)_10%,rgba(2,6,23,.58)_50%,rgba(2,6,23,.4)_100%)]" />
              <button onClick={() => setPt(null)} className="absolute right-4 top-4 z-10 grid h-9 w-9 place-items-center rounded-full border border-white/35 bg-white/20 text-white hover:bg-white/30"><X size={17} /></button>
              <div className="relative z-[1] mt-8 max-w-2xl">
                <h3 className="text-5xl font-extrabold leading-[.95] tracking-tight">{pt.nombreComun}</h3>
                <p className="mt-1 text-2xl italic text-slate-100">{pt.nombreCientifico}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="rounded-full border border-white/35 bg-white/14 px-2.5 py-1 text-[11px] font-semibold">Tipo: {pt.tipo}</span>
                  <span className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${sev(pt.severidad)}`}>Severidad: {pt.severidad}</span>
                </div>
              </div>
            </div>
            <div className="grid gap-4 bg-gradient-to-b from-white to-slate-50 p-5 lg:grid-cols-12">
              <div className="space-y-3 lg:col-span-8">
                <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"><p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Descripción técnica</p><p className="mt-2 text-sm leading-relaxed text-slate-700">{pt.descripcion}</p></article>
                <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"><p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Métodos de control</p><div className="mt-3 flex flex-wrap gap-2">{pt.metodosControl.map((m) => <span key={m} className="rounded-md border border-emerald-100 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">{m}</span>)}</div></article>
                <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"><p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Especies afectadas</p><div className="mt-3 flex flex-wrap gap-2">{pt.especiesAfectadas.map((s) => <span key={s} className="rounded-full border border-rose-200 bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-700">{s}</span>)}</div></article>
              </div>
              <div className="space-y-3 lg:col-span-4">
                <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"><p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Severidad</p><span className={`mt-2 inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${sev(pt.severidad)}`}>{pt.severidad}</span></article>
                <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"><p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Riesgo fitosanitario</p><p className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-slate-800">{pt.severidad === 'Alta' ? <ShieldAlert size={15} /> : <AlertTriangle size={15} />} Vigilancia activa</p></article>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
