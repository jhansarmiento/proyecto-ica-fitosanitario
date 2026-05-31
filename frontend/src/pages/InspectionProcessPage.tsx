// frontend/src/pages/InspectionProcessPage.tsx
import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, ChevronUp, Eye, Minus, Plus, Save } from 'lucide-react';
import DashboardLayout from '../components/layout/DashboardLayout';
import type { SessionUser } from '../types/auth.types';
import { fincaService } from '../services/finca.service';

type InspectionProcessPageProps = {
  sessionUser?: SessionUser;
  solicitud?: any;
  onGoInspectionsAgenda?: () => void;
  onLogout?: () => void;
  onBack?: () => void;
  onFinish?: () => void;
};

type LotInspectionData = {
  totalPlants: number;
  affectedPlants: number;
  pestCounts: Record<string, number>;
  phenologyState: string;
  observations: string;
  isCompleted: boolean;
};

export default function InspectionProcessPage({
  sessionUser,
  solicitud,
  onGoInspectionsAgenda,
  onBack,
  onFinish,
  onLogout,
}: InspectionProcessPageProps) {
  const [loading, setLoading] = useState(true);
  const [generalInfo, setGeneralInfo] = useState<any>({});
  const [lots, setLots] = useState<any[]>([]);
  const [plagasCat, setPlagasCat] = useState<any[]>([]);

  const [expandedLotId, setExpandedLotId] = useState<string | null>(null);
  const [inspectionData, setInspectionData] = useState<Record<string, LotInspectionData>>({});

  const mapData = useMemo(() => {
    const raw =
      generalInfo?.coordenadas ??
      generalInfo?.coordenada ??
      generalInfo?.latLng ??
      (generalInfo?.latitud && generalInfo?.longitud
        ? `${generalInfo.latitud},${generalInfo.longitud}`
        : '');

    const str = String(raw || '').trim();
    const match = str.match(/(-?\d+(?:\.\d+)?)\s*[,; ]\s*(-?\d+(?:\.\d+)?)/);

    if (match) {
      const lat = Number(match[1]);
      const lng = Number(match[2]);
      if (!Number.isNaN(lat) && !Number.isNaN(lng)) {
        return {
          hasCoords: true,
          lat,
          lng,
          googleUrl: `https://www.google.com/maps?q=${lat},${lng}`,
          label: `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
        };
      }
    }

    const ubicacion = [generalInfo?.municipio, generalInfo?.vereda].filter(Boolean).join(' ');
    const q = encodeURIComponent(ubicacion || generalInfo?.nombreLugar || 'Colombia');
    return {
      hasCoords: false,
      lat: null,
      lng: null,
      googleUrl: `https://www.google.com/maps/search/?api=1&query=${q}`,
      label: ubicacion || 'Ubicación referencial',
    };
  }, [generalInfo]);

  const draftKey = `draft_inspeccion_${solicitud?.id_solicitud}`;

  useEffect(() => {
    const fetchContexto = async () => {
      if (!solicitud?.id_solicitud) return;
      try {
        setLoading(true);
        const res = await fincaService.getDatosInicioInspeccion(solicitud.id_solicitud);

        setGeneralInfo(res.data.generalInfo);
        setLots(res.data.lotes);
        setPlagasCat(res.data.plagas);

        const savedDraft = localStorage.getItem(draftKey);

        if (savedDraft) {
          setInspectionData(JSON.parse(savedDraft));
        } else {
          const initialData: Record<string, LotInspectionData> = {};
          res.data.lotes.forEach((l: any) => {
            initialData[l.id] = {
              totalPlants: l.plantas || 0,
              affectedPlants: 0,
              pestCounts: {},
              phenologyState: '',
              observations: '',
              isCompleted: false,
            };
          });
          setInspectionData(initialData);
        }
      } catch (error) {
        console.error('Error cargando contexto de inspección', error);
      } finally {
        setLoading(false);
      }
    };
    fetchContexto();
  }, [solicitud, draftKey]);

  const toggleLot = (lotId: string) => setExpandedLotId((prev) => (prev === lotId ? null : lotId));

  const updateLotData = (lotId: string, field: keyof LotInspectionData, value: any) => {
    setInspectionData((prev) => ({
      ...prev,
      [lotId]: { ...prev[lotId], [field]: value },
    }));
  };

  const updatePestCount = (lotId: string, pestId: string, delta: number) => {
    setInspectionData((prev) => {
      const currentCount = prev[lotId].pestCounts[pestId] || 0;
      return {
        ...prev,
        [lotId]: {
          ...prev[lotId],
          pestCounts: { ...prev[lotId].pestCounts, [pestId]: Math.max(0, currentCount + delta) },
        },
      };
    });
  };

  const markLotCompleted = (lotId: string) => {
    updateLotData(lotId, 'isCompleted', true);
    setExpandedLotId(null);
  };

  const handleSaveDraftAndExit = () => {
    localStorage.setItem(draftKey, JSON.stringify(inspectionData));
    onBack?.();
  };

  const canFinish = Object.values(inspectionData).some((d) => d.isCompleted);

  const handleFinalizarInspeccion = async () => {
    try {
      setLoading(true);

      const lotesInspeccionados = Object.entries(inspectionData)
        .filter(([_, data]) => data.isCompleted)
        .map(([lotId, data]) => {
          const plagas = Object.entries(data.pestCounts)
            .filter(([_, count]) => count > 0)
            .map(([plagaId, count]) => ({
              id_plaga: plagaId,
              cantidad: count,
            }));

          return {
            id_lote: lotId,
            cantidad_plantas: data.totalPlants,
            estado_fenologico: data.phenologyState,
            observaciones: data.observations,
            plagas,
          };
        });

      await fincaService.finalizarInspeccion(solicitud.id_solicitud, { lotesInspeccionados });
      localStorage.removeItem(draftKey);
      onFinish?.();
    } catch (error) {
      console.error('Error guardando la inspección final:', error);
      alert('Hubo un error al guardar los datos. Intenta nuevamente.');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="Realizar Inspección" sessionUser={sessionUser} activeView="inspections-agenda">
        <div className="p-10 text-center text-slate-500 animate-pulse">Cargando contexto de inspección...</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="Realizar Inspección"
      subtitle="Proceso de recolección de datos fitosanitarios en campo"
      sessionUser={sessionUser}
      activeView="inspections-agenda"
      onNavigate={onGoInspectionsAgenda}
      onLogout={onLogout}
    >
      <section className="mx-auto max-w-7xl space-y-6 px-3 sm:px-4 lg:px-6">
        <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 bg-linear-to-r from-[#015c4b] to-[#0b6b57] px-6 py-4">
            <div>
              <span className="inline-flex rounded-full bg-white/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.15em] text-emerald-50">
                Lugar de Producción
              </span>
              <h2 className="mt-2 text-2xl font-black tracking-tight text-white sm:text-3xl">{generalInfo.nombreLugar}</h2>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2 sm:gap-4 sm:p-5 xl:grid-cols-3">
            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
              <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Registro ICA</p>
              <h3 className="mt-1 text-lg font-black text-slate-900">{generalInfo.registroIca}</h3>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
              <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Coordenadas</p>
              <h3 className="mt-1 break-words text-base font-black text-slate-900 sm:text-lg">{generalInfo.coordenadas || mapData.label}</h3>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
              <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Fecha Inspección</p>
              <h3 className="mt-1 break-words text-base font-black text-slate-900 sm:text-lg">{generalInfo.fechaInspeccion}</h3>
            </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 sm:col-span-2 xl:col-span-1">
              <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Ubicación</p>
              <h3 className="mt-1 break-words text-base font-black text-slate-900 sm:text-lg">{generalInfo.municipio} - Vda. {generalInfo.vereda}</h3>
            </div>
<a
  href={mapData.googleUrl}
  target="_blank"
  rel="noreferrer"
  className="
    group
    relative
    overflow-hidden
    rounded-2xl
    border border-slate-200
    bg-gradient-to-br from-white to-slate-50
    p-5
    shadow-sm
    transition-all
    duration-300
    hover:-translate-y-1
    hover:border-emerald-300
    hover:shadow-lg
    hover:shadow-emerald-100
  "
>
  {/* Línea decorativa superior */}
  <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-emerald-500 to-emerald-300"></div>

  <div className="flex items-center justify-between">
    
    <div>
      <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
        Ubicación Geográfica
      </p>

      <h4 className="mt-2 text-lg font-bold text-slate-900 transition-colors group-hover:text-emerald-700 sm:text-xl">
        Abrir en Google Maps
      </h4>

      <p className="mt-1 text-sm text-slate-500">
        Visualizar coordenadas y ubicación del lugar de producción
      </p>
    </div>

    <div
      className="
        flex h-14 w-14 items-center justify-center
        rounded-2xl
        bg-emerald-50
        text-emerald-700
        transition-all
        group-hover:bg-emerald-100
        group-hover:scale-110
      "
    >
      📍
    </div>

  </div>
</a>
              <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 sm:col-span-2 xl:col-span-1">
              <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Productor</p>
              <h3 className="mt-1 break-words text-base font-black text-slate-900 sm:text-lg">{generalInfo.productorNombre}</h3>
              <p className="text-sm font-medium text-slate-500">Tel: {generalInfo.productorTelefono}</p>
            </div>

          </div>
        </article>

        <div className="mb-4 mt-8 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-900">Lotes a Inspeccionar</h2>
          <p className="text-sm font-semibold text-slate-500">
            {Object.values(inspectionData).filter((d) => d.isCompleted).length} de {lots.length} listos
          </p>
        </div>

        <div className="space-y-4">
          {lots.map((lot) => {
            const isExpanded = expandedLotId === lot.id;
            const data = inspectionData[lot.id];
            const plagasDelLote = plagasCat.filter(
              (p) => p.especies_compatibles && p.especies_compatibles.includes(String(lot.id_especie_vegetal)),
            );

            return (
              <article key={lot.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all">
                <div
                  onClick={() => toggleLot(lot.id)}
                  className="cursor-pointer flex flex-col items-start justify-between gap-3 p-4 transition hover:bg-slate-50 sm:flex-row sm:items-center"
                >
                  <div className="flex w-full min-w-0 items-center gap-3 sm:w-auto sm:gap-4">
                    <img src={lot.imagen} alt={lot.cultivo} className="h-14 w-14 rounded-xl border border-slate-200 object-cover sm:h-16 sm:w-16" />
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-base font-bold text-slate-900 sm:text-lg">{lot.numero}</p>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                            data?.isCompleted ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                          }`}
                        >
                          {data?.isCompleted ? 'Inspeccionado' : 'Pendiente'}
                        </span>
                      </div>
                      <p className="break-words text-sm font-medium text-slate-600">
                        {lot.cultivo} <span className="text-xs italic text-slate-400">({lot.nombreCientifico})</span>
                      </p>
                      <p className="mt-1 text-xs text-slate-500">Siembra: {lot.fechaSiembra} • {lot.areaHa} ha</p>
                    </div>
                  </div>

                  <button
                    className={`mt-1 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition sm:mt-0 sm:w-auto ${
                      isExpanded ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {isExpanded ? <><ChevronUp size={16} /> Cerrar</> : <><Eye size={16} /> Llenar Datos</>}
                  </button>
                </div>

                {isExpanded && (
                  <div className="border-t border-slate-100 bg-slate-50/50 p-5">
                    <div className="grid gap-6 md:grid-cols-2">
                      <div className="rounded-xl border border-blue-200 bg-white p-5 shadow-sm">
                        <h3 className="mb-4 text-sm font-bold uppercase tracking-wide text-blue-600">Plantas Totales (Conteo Físico)</h3>
                        <div className="flex items-center justify-between">
                          <button
                            onClick={() => updateLotData(lot.id, 'totalPlants', Math.max(0, data.totalPlants - 1))}
                            className="rounded-xl bg-slate-100 p-3 text-slate-700 transition hover:bg-blue-100 hover:text-blue-600"
                          >
                            <Minus size={22} />
                          </button>
                          <div className="text-center">
                            <p className="text-3xl font-black text-blue-600 sm:text-5xl">{data.totalPlants}</p>
                            <p className="text-xs font-medium text-slate-400">Encontradas en el lote</p>
                          </div>
                          <button
                            onClick={() => updateLotData(lot.id, 'totalPlants', data.totalPlants + 1)}
                            className="rounded-xl bg-slate-100 p-3 text-slate-700 transition hover:bg-blue-100 hover:text-blue-600"
                          >
                            <Plus size={22} />
                          </button>
                        </div>
                      </div>

                      <div className="rounded-xl border border-rose-200 bg-white p-5 shadow-sm">
                        <h3 className="mb-4 text-sm font-bold uppercase tracking-wide text-rose-600">Plantas con Plagas</h3>
                        <div className="flex items-center justify-between">
                          <button
                            onClick={() => updateLotData(lot.id, 'affectedPlants', Math.max(0, data.affectedPlants - 1))}
                            className="rounded-xl bg-slate-100 p-3 text-slate-700 transition hover:bg-rose-100 hover:text-rose-600"
                          >
                            <Minus size={22} />
                          </button>
                          <div className="text-center">
                            <p className="text-3xl font-black text-rose-600 sm:text-5xl">{data.affectedPlants}</p>
                            <p className="text-xs font-medium text-slate-400">Con signos de infestación</p>
                          </div>
                          <button
                            onClick={() =>
                              updateLotData(lot.id, 'affectedPlants', Math.min(data.totalPlants, data.affectedPlants + 1))
                            }
                            className="rounded-xl bg-slate-100 p-3 text-slate-700 transition hover:bg-rose-100 hover:text-rose-600"
                          >
                            <Plus size={22} />
                          </button>
                        </div>
                      </div>

                      <div className="space-y-4 md:col-span-2">
                        <label className="block">
                          <span className="text-sm font-bold text-slate-700">Estado Fenológico de la Plantación *</span>
                          <select
                            value={data.phenologyState}
                            onChange={(e) => updateLotData(lot.id, 'phenologyState', e.target.value)}
                            className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-emerald-400"
                          >
                            <option value="">Seleccionar estado...</option>
                            <option value="Vegetativo">Vegetativo</option>
                            <option value="Floración">Floración</option>
                            <option value="Fructificación">Fructificación</option>
                            <option value="Maduración">Maduración</option>
                          </select>
                        </label>
                        <label className="block">
                          <span className="text-sm font-bold text-slate-700">Observaciones Específicas del Lote</span>
                          <textarea
                            value={data.observations}
                            onChange={(e) => updateLotData(lot.id, 'observations', e.target.value)}
                            rows={2}
                            className="mt-1 w-full resize-none rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-400"
                            placeholder="Condiciones de maleza, riego, daños mecánicos..."
                          />
                        </label>
                      </div>
                    </div>

                    <div className="mt-6 border-t border-slate-200 pt-5">
                      <h3 className="mb-4 text-sm font-bold uppercase tracking-wide text-slate-700">Registro de Plagas Específicas</h3>
                      <div className="grid gap-3 lg:grid-cols-2">
                        {plagasDelLote.map((pest) => (
                          <div key={pest.id} className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
                            <div>
                              <p className="text-sm font-bold text-slate-800">{pest.nombre}</p>
                              <p className="text-xs italic text-slate-500">{pest.nombreCientifico}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => updatePestCount(lot.id, pest.id, -1)}
                                className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200"
                              >
                                <Minus size={14} />
                              </button>
                              <p className="w-8 text-center font-bold text-slate-800">{data.pestCounts[pest.id] || 0}</p>
                              <button
                                onClick={() => updatePestCount(lot.id, pest.id, 1)}
                                className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                              >
                                <Plus size={14} />
                              </button>
                            </div>
                          </div>
                        ))}
                        {plagasDelLote.length === 0 && (
                          <p className="text-sm italic text-slate-500">No hay plagas registradas en el catálogo para esta especie.</p>
                        )}
                      </div>
                    </div>

                    <div className="mt-6 flex flex-col justify-end gap-3 sm:flex-row">
                      <button
                        onClick={() => markLotCompleted(lot.id)}
                        disabled={!data.phenologyState}
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-800 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-900 disabled:opacity-50 sm:w-auto"
                      >
                        <CheckCircle2 size={18} /> Guardar Inspección del Lote
                      </button>
                    </div>
                  </div>
                )}
              </article>
            );
          })}
        </div>

        <div className="mt-8 flex flex-col items-stretch justify-between gap-3 border-t border-slate-200 pb-10 pt-6 sm:flex-row sm:items-center sm:gap-4">
          <button
            type="button"
            onClick={handleSaveDraftAndExit}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 sm:w-auto"
          >
            <Save size={16} /> Guardar Progreso y Salir
          </button>

          <button
            type="button"
            onClick={handleFinalizarInspeccion}
            disabled={!canFinish}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 px-6 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-800 disabled:opacity-50 sm:w-auto"
          >
            <CheckCircle2 size={16} /> Finalizar Inspección
          </button>
        </div>
      </section>
    </DashboardLayout>
  );
}
