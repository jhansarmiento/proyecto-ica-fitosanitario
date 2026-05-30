import { useMemo, useState } from 'react';
import { Download, FileSpreadsheet, FileText, Filter, Search, X, XCircle } from 'lucide-react';
import DashboardLayout from '../components/layout/DashboardLayout';
import type { DashboardViewKey } from '../types/dashboard.types';
import type { SessionUser } from '../types/auth.types';

// ─── Tipos ────────────────────────────────────────────────────────────────────

type EstadoInspeccion = 'REALIZADA' | 'PROGRAMADA' | 'PENDIENTE' | 'CANCELADA';

type InspeccionReporte = {
  id: string;
  fechaInspeccion: string;
  lugarProduccion: string;
  municipio: string;
  lote: string;
  cultivo: string;
  especieVegetal: string;
  plagaDetectada: string;
  porcentajeInfestacion: number;
  tecnico: string;
  estado: EstadoInspeccion;
};

// ─── Datos mock ───────────────────────────────────────────────────────────────

const MOCK_INSPECCIONES: InspeccionReporte[] = [
  { id: 'INS-2026-0041', fechaInspeccion: '2026-05-20', lugarProduccion: 'Predio Santa Isabel',   municipio: 'Palmira',     lote: 'L-02', cultivo: 'Tomate de mesa',    especieVegetal: 'Solanum lycopersicum',  plagaDetectada: 'Tuta absoluta',       porcentajeInfestacion: 38, tecnico: 'Carlos Mendoza',         estado: 'REALIZADA'  },
  { id: 'INS-2026-0040', fechaInspeccion: '2026-05-18', lugarProduccion: 'Hacienda El Porvenir',  municipio: 'Rionegro',    lote: 'L-05', cultivo: 'Papa criolla',      especieVegetal: 'Solanum phureja',       plagaDetectada: 'Gusano blanco',       porcentajeInfestacion: 22, tecnico: 'Luisa F. Torres',        estado: 'REALIZADA'  },
  { id: 'INS-2026-0039', fechaInspeccion: '2026-05-15', lugarProduccion: 'Finca La Aurora',       municipio: 'Chinchiná',   lote: 'L-01', cultivo: 'Café arábica',      especieVegetal: 'Coffea arabica',        plagaDetectada: 'Broca del café',      porcentajeInfestacion: 5,  tecnico: 'Andrés F. Gómez',        estado: 'REALIZADA'  },
  { id: 'INS-2026-0038', fechaInspeccion: '2026-05-12', lugarProduccion: 'Predio Los Naranjos',   municipio: 'Lebrija',     lote: 'L-03', cultivo: 'Cítricos (naranja)', especieVegetal: 'Citrus sinensis',       plagaDetectada: 'Minador de la hoja',  porcentajeInfestacion: 45, tecnico: 'Sandra M. Ruiz',         estado: 'REALIZADA'  },
  { id: 'INS-2026-0037', fechaInspeccion: '2026-05-10', lugarProduccion: 'Hacienda San Pedro',    municipio: 'Espinal',     lote: 'L-07', cultivo: 'Arroz',             especieVegetal: 'Oryza sativa',          plagaDetectada: 'Sogata',              porcentajeInfestacion: 18, tecnico: 'Carlos Mendoza',         estado: 'REALIZADA'  },
  { id: 'INS-2026-0036', fechaInspeccion: '2026-05-08', lugarProduccion: 'Predio Villa Verde',    municipio: 'Fusagasugá',  lote: 'L-04', cultivo: 'Fresa',             especieVegetal: 'Fragaria × ananassa',  plagaDetectada: 'Ácaros',              porcentajeInfestacion: 30, tecnico: 'Luisa F. Torres',        estado: 'PROGRAMADA' },
  { id: 'INS-2026-0035', fechaInspeccion: '2026-05-05', lugarProduccion: 'Finca El Paraíso',      municipio: 'Dagua',       lote: 'L-01', cultivo: 'Plátano dominico',  especieVegetal: 'Musa paradisiaca',      plagaDetectada: 'Picudo negro',        porcentajeInfestacion: 15, tecnico: 'Andrés F. Gómez',        estado: 'REALIZADA'  },
  { id: 'INS-2026-0034', fechaInspeccion: '2026-05-02', lugarProduccion: 'Predio Santa Rosa',     municipio: 'Pasto',       lote: 'L-02', cultivo: 'Papa pastusa',      especieVegetal: 'Solanum tuberosum',     plagaDetectada: 'Polilla guatemalteca',porcentajeInfestacion: 8,  tecnico: 'Sandra M. Ruiz',         estado: 'REALIZADA'  },
  { id: 'INS-2026-0033', fechaInspeccion: '2026-04-28', lugarProduccion: 'Hacienda La Esperanza', municipio: 'Montería',    lote: 'L-06', cultivo: 'Maíz amarillo',     especieVegetal: 'Zea mays',              plagaDetectada: 'Gusano cogollero',    porcentajeInfestacion: 52, tecnico: 'Carlos Mendoza',         estado: 'CANCELADA'  },
  { id: 'INS-2026-0032', fechaInspeccion: '2026-04-25', lugarProduccion: 'Predio El Vergel',      municipio: 'Pereira',     lote: 'L-03', cultivo: 'Aguacate Hass',     especieVegetal: 'Persea americana',      plagaDetectada: 'Trips',               porcentajeInfestacion: 20, tecnico: 'Luisa F. Torres',        estado: 'PENDIENTE'  },
];

// ─── Props ────────────────────────────────────────────────────────────────────

type ReportsPageProps = {
  sessionUser?: SessionUser;
  onGoHome?: () => void;
  onGoUsers?: () => void;
  onGoRoles?: () => void;
  onGoAgricultural?: () => void;
  onGoCatalog?: () => void;
  onGoApprovalPlaces?: () => void;
  onGoInspectionsAgenda?: () => void;
  onGoInspectionsHistory?: () => void;
  onGoReports?: () => void;
  onLogout?: () => void;
};

// ─── KPI Card ─────────────────────────────────────────────────────────────────


// ─── Página principal ─────────────────────────────────────────────────────────

export default function ReportsPage({
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
}: ReportsPageProps) {

  // ── Filtros ──
  const [filterLugar,      setFilterLugar]      = useState('');
  const [filterLote,       setFilterLote]       = useState('');
  const [filterEspecie,    setFilterEspecie]    = useState('');
  const [filterPlaga,      setFilterPlaga]      = useState('');
  const [filterEstado,     setFilterEstado]     = useState<EstadoInspeccion | ''>('');
  const [filterFechaInicio,setFilterFechaInicio]= useState('');
  const [filterFechaFin,   setFilterFechaFin]   = useState('');
  const [search,           setSearch]           = useState('');

  // ── Formato de exportación (radio) ──
  const [exportFormat, setExportFormat] = useState<'pdf' | 'excel'>('pdf');

  // ── Navegación ──
  const handleNavigate = (view: DashboardViewKey) => {
    const map: Partial<Record<DashboardViewKey, (() => void) | undefined>> = {
      home:                 onGoHome,
      users:                onGoUsers,
      roles:                onGoRoles,
      agricultural:         onGoAgricultural,
      catalog:              onGoCatalog,
      'approval-places':    onGoApprovalPlaces,
      'inspections-agenda': onGoInspectionsAgenda,
      'inspections-history':onGoInspectionsHistory,
      reports:              undefined,
    };
    map[view]?.();
  };

  // ── Filtrado ──
  const filteredInspecciones = useMemo(() => {
    return MOCK_INSPECCIONES.filter((i) => {
      const q = search.toLowerCase();
      const matchSearch = !q || i.lugarProduccion.toLowerCase().includes(q) || i.lote.toLowerCase().includes(q) || i.cultivo.toLowerCase().includes(q) || i.plagaDetectada.toLowerCase().includes(q) || i.tecnico.toLowerCase().includes(q) || i.id.toLowerCase().includes(q);
      const matchLugar   = !filterLugar   || i.lugarProduccion.toLowerCase().includes(filterLugar.toLowerCase());
      const matchLote    = !filterLote    || i.lote.toLowerCase().includes(filterLote.toLowerCase());
      const matchEspecie = !filterEspecie || i.especieVegetal.toLowerCase().includes(filterEspecie.toLowerCase()) || i.cultivo.toLowerCase().includes(filterEspecie.toLowerCase());
      const matchPlaga   = !filterPlaga   || i.plagaDetectada.toLowerCase().includes(filterPlaga.toLowerCase());
      const matchEstado  = !filterEstado  || i.estado === filterEstado;
      const matchInicio  = !filterFechaInicio || i.fechaInspeccion >= filterFechaInicio;
      const matchFin     = !filterFechaFin    || i.fechaInspeccion <= filterFechaFin;
      return matchSearch && matchLugar && matchLote && matchEspecie && matchPlaga && matchEstado && matchInicio && matchFin;
    });
  }, [search, filterLugar, filterLote, filterEspecie, filterPlaga, filterEstado, filterFechaInicio, filterFechaFin]);

  const resetFilters = () => {
    setFilterLugar(''); setFilterLote(''); setFilterEspecie(''); setFilterPlaga('');
    setFilterEstado(''); setFilterFechaInicio(''); setFilterFechaFin(''); setSearch('');
  };

  const hasActiveFilters = filterLugar || filterLote || filterEspecie || filterPlaga || filterEstado || filterFechaInicio || filterFechaFin || search;

  return (
    <DashboardLayout
      title="Reportes Fitosanitarios"
      subtitle="Trazabilidad y análisis de inspecciones agrícolas"
      sessionUser={sessionUser}
      activeView="reports"
      onNavigate={handleNavigate}
      onLogout={onLogout}
    >
      <div className="space-y-6">

        {/* ── Header ──
        <div className="rounded-2xl bg-gradient-to-r from-emerald-900 to-emerald-700 p-6 text-white shadow-sm">
          <div className="flex items-center gap-2">
            <Leaf size={20} className="text-emerald-300" />
            <h2 className="text-lg font-bold">Sistema de Trazabilidad Fitosanitaria</h2>
          </div>
          <p className="mt-1 max-w-xl text-sm text-emerald-100">
            Aplica los filtros, selecciona el formato y genera el reporte oficial de inspecciones fitosanitarias.
          </p>
        </div> */}


        {/* ── Panel de filtros ── */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Filter size={16} className="text-emerald-600" />
              <h3 className="text-sm font-bold text-slate-700">Filtros de búsqueda</h3>
            </div>
            {hasActiveFilters && (
              <button type="button" onClick={resetFilters} className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50">
                <XCircle size={13} /> Limpiar filtros
              </button>
            )}
          </div>

          {/* Búsqueda global */}
          <div className="mb-4 flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 focus-within:border-emerald-400 focus-within:ring-2 focus-within:ring-emerald-100">
            <Search size={16} className="shrink-0 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por lugar, lote, cultivo, plaga, técnico o ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-transparent text-sm text-slate-700 placeholder-slate-400 outline-none"
            />
            {search && (
              <button type="button" onClick={() => setSearch('')}>
                <X size={14} className="text-slate-400 hover:text-slate-600" />
              </button>
            )}
          </div>

          {/* Grid de filtros */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            <div>
              <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-slate-500">Lugar de Producción</label>
              <input type="text" placeholder="Ej: Predio Santa Isabel" value={filterLugar} onChange={(e) => setFilterLugar(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 placeholder-slate-400 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100" />
            </div>
            <div>
              <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-slate-500">Lote</label>
              <input type="text" placeholder="Ej: L-02" value={filterLote} onChange={(e) => setFilterLote(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 placeholder-slate-400 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100" />
            </div>
            <div>
              <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-slate-500">Especie Vegetal / Cultivo</label>
              <input type="text" placeholder="Ej: Tomate, Coffea arabica" value={filterEspecie} onChange={(e) => setFilterEspecie(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 placeholder-slate-400 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100" />
            </div>
            <div>
              <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-slate-500">Plaga</label>
              <input type="text" placeholder="Ej: Tuta absoluta" value={filterPlaga} onChange={(e) => setFilterPlaga(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 placeholder-slate-400 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100" />
            </div>
            <div>
              <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-slate-500">Estado Inspección</label>
              <select value={filterEstado} onChange={(e) => setFilterEstado(e.target.value as EstadoInspeccion | '')} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100">
                <option value="">Todos los estados</option>
                <option value="REALIZADA">Realizada</option>
                <option value="PROGRAMADA">Programada</option>
                <option value="PENDIENTE">Pendiente</option>
                <option value="CANCELADA">Cancelada</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-slate-500">Fecha Inicio</label>
              <input type="date" value={filterFechaInicio} onChange={(e) => setFilterFechaInicio(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100" />
            </div>
            <div>
              <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-slate-500">Fecha Fin</label>
              <input type="date" value={filterFechaFin} onChange={(e) => setFilterFechaFin(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100" />
            </div>
          </div>
        </div>

        {/* ── Formato y generación ── */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-1 flex items-center gap-2">
            <Download size={16} className="text-emerald-600" />
            <h3 className="text-sm font-bold text-slate-700">Formato de exportación</h3>
          </div>
          <p className="mb-5 text-xs text-slate-500">
            Selecciona el formato en que deseas generar el reporte con los filtros aplicados.
          </p>

          {/* Radio buttons */}
          <div className="flex flex-wrap gap-4 mb-6">
            {/* PDF */}
            <label className={`flex cursor-pointer items-center gap-3 rounded-xl border-2 px-5 py-4 transition select-none ${exportFormat === 'pdf' ? 'border-rose-400 bg-rose-50' : 'border-slate-200 bg-slate-50 hover:border-slate-300'}`}>
              <input
                type="radio"
                name="exportFormat"
                value="pdf"
                checked={exportFormat === 'pdf'}
                onChange={() => setExportFormat('pdf')}
                className="h-4 w-4 accent-rose-500"
              />
              <FileText size={22} className={exportFormat === 'pdf' ? 'text-rose-500' : 'text-slate-400'} />
              <div>
                <p className={`text-sm font-bold ${exportFormat === 'pdf' ? 'text-rose-700' : 'text-slate-600'}`}>PDF</p>
              </div>
            </label>

            {/* Excel */}
            <label className={`flex cursor-pointer items-center gap-3 rounded-xl border-2 px-5 py-4 transition select-none ${exportFormat === 'excel' ? 'border-emerald-400 bg-emerald-50' : 'border-slate-200 bg-slate-50 hover:border-slate-300'}`}>
              <input
                type="radio"
                name="exportFormat"
                value="excel"
                checked={exportFormat === 'excel'}
                onChange={() => setExportFormat('excel')}
                className="h-4 w-4 accent-emerald-600"
              />
              <FileSpreadsheet size={22} className={exportFormat === 'excel' ? 'text-emerald-600' : 'text-slate-400'} />
              <div>
                <p className={`text-sm font-bold ${exportFormat === 'excel' ? 'text-emerald-700' : 'text-slate-600'}`}>Excel</p>
              </div>
            </label>
          </div>


          {/* Botón Generar */}
          <button
            type="button"
            className="flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-700 active:scale-95"
          >
            <Download size={16} />
            Generar Reporte ({filteredInspecciones.length} registros)
            <span className="ml-1 rounded-full bg-white/20 px-2 py-0.5 text-xs">
              {exportFormat === 'pdf' ? 'PDF' : 'Excel'}
            </span>
          </button>
        </div>

      </div>
    </DashboardLayout>
  );
}
