// frontend/src/pages/InspectionProcessPage.tsx
import { useEffect, useState } from 'react';
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
  totalPlants: number; // 🌟 NUEVO: Plantas físicas en el lote
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

  // 🌟 LLAVE DE ALMACENAMIENTO PARA EL BORRADOR
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
        
        // 🌟 SISTEMA DE BORRADORES: Revisamos si hay progreso guardado
        const savedDraft = localStorage.getItem(draftKey);
        
        if (savedDraft) {
          setInspectionData(JSON.parse(savedDraft));
        } else {
          // Si no hay borrador, inicializamos con los valores por defecto
          const initialData: Record<string, LotInspectionData> = {};
          res.data.lotes.forEach((l: any) => {
            initialData[l.id] = { 
              totalPlants: l.plantas || 0, // Carga las plantas históricas como sugerencia
              affectedPlants: 0, 
              pestCounts: {}, 
              phenologyState: '', 
              observations: '', 
              isCompleted: false 
            };
          });
          setInspectionData(initialData);
        }
      } catch (error) {
        console.error("Error cargando contexto de inspección", error);
      } finally {
        setLoading(false);
      }
    };
    fetchContexto();
  }, [solicitud, draftKey]);

  const toggleLot = (lotId: string) => setExpandedLotId(prev => prev === lotId ? null : lotId);

  const updateLotData = (lotId: string, field: keyof LotInspectionData, value: any) => {
    setInspectionData(prev => ({
      ...prev,
      [lotId]: { ...prev[lotId], [field]: value }
    }));
  };

  const updatePestCount = (lotId: string, pestId: string, delta: number) => {
    setInspectionData(prev => {
      const currentCount = prev[lotId].pestCounts[pestId] || 0;
      return {
        ...prev,
        [lotId]: {
          ...prev[lotId],
          pestCounts: { ...prev[lotId].pestCounts, [pestId]: Math.max(0, currentCount + delta) }
        }
      };
    });
  };

  const markLotCompleted = (lotId: string) => {
    updateLotData(lotId, 'isCompleted', true);
    setExpandedLotId(null);
  };

  // 🌟 FUNCIÓN PARA GUARDAR BORRADOR Y SALIR
  const handleSaveDraftAndExit = () => {
    localStorage.setItem(draftKey, JSON.stringify(inspectionData));
    onBack?.();
  };

  const canFinish = Object.values(inspectionData).some(d => d.isCompleted);

  const handleFinalizarInspeccion = async () => {
    try {
      setLoading(true);

      // 1. Transformamos el estado local al formato que el backend espera
      const lotesInspeccionados = Object.entries(inspectionData)
        .filter(([_, data]) => data.isCompleted) // 👈 Solo enviamos los lotes que se marcaron como listos
        .map(([lotId, data]) => {
          
          // Mapeamos solo las plagas que tengan > 0 afectadas
          const plagas = Object.entries(data.pestCounts)
            .filter(([_, count]) => count > 0)
            .map(([plagaId, count]) => ({
              id_plaga: plagaId,
              cantidad: count
            }));

          return {
            id_lote: lotId,
            cantidad_plantas: data.totalPlants, // 👈 Lo que digitó el técnico
            estado_fenologico: data.phenologyState,
            observaciones: data.observations,
            plagas: plagas // 👈 Arreglo de hallazgos
          };
        });

      // 2. Enviamos al Backend
      await fincaService.finalizarInspeccion(solicitud.id_solicitud, { lotesInspeccionados });

      // 3. Limpiamos el borrador del LocalStorage para que no vuelva a aparecer
      localStorage.removeItem(draftKey);

      // 4. Redirigimos a la página de Historial
      onFinish?.();

    } catch (error) {
      console.error("Error guardando la inspección final:", error);
      alert("Hubo un error al guardar los datos. Intenta nuevamente.");
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
      <section className="mx-auto max-w-7xl space-y-6">

        <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 bg-linear-to-r from-[#015c4b] to-[#0b6b57] px-6 py-4 flex justify-between items-center">
            <div>
              <span className="inline-flex rounded-full bg-white/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.15em] text-emerald-50">
                Lugar de Producción
              </span>
              <h2 className="mt-2 text-2xl sm:text-3xl font-black tracking-tight text-white">{generalInfo.nombreLugar}</h2>
            </div>
          </div>

          <div className="grid gap-2 p-5 sm:grid-cols-2 xl:grid-cols-3">
            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
              <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Registro ICA</p>
              <h3 className="mt-1 text-lg font-black text-slate-900">{generalInfo.registroIca}</h3>
            </div>
            {/* <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
              <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Coordenadas</p>
              <h3 className="mt-1 text-lg font-black text-slate-900">{generalInfo.coordenadas}</h3>
            </div> */}
            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
              <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Fecha Inspección</p>
              <h3 className="mt-1 text-lg font-black text-slate-900">{generalInfo.fechaInspeccion}</h3>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
              <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Ubicación</p>
              <h3 className="mt-1 text-lg font-black text-slate-900">{generalInfo.municipio} - Vda. {generalInfo.vereda}</h3>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 sm:col-span-2 xl:col-span-1">
              <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Productor</p>
              <h3 className="mt-1 text-lg font-black text-slate-900">{generalInfo.productorNombre}</h3>
              <p className="text-sm font-medium text-slate-500">Tel: {generalInfo.productorTelefono}</p>
            </div>
          </div>
        </article>

        <div className="flex items-center justify-between mt-8 mb-4">
            <h2 className="text-2xl font-bold text-slate-900">Lotes a Inspeccionar</h2>
            <p className="text-sm font-semibold text-slate-500">{Object.values(inspectionData).filter(d => d.isCompleted).length} de {lots.length} listos</p>
        </div>

        <div className="space-y-4">
          {lots.map((lot) => {
            const isExpanded = expandedLotId === lot.id;
            const data = inspectionData[lot.id];
            // 🌟 FILTRO: Verifica si el ID de la especie del lote está en el arreglo de especies compatibles de la plaga
            const plagasDelLote = plagasCat.filter(p => 
              p.especies_compatibles && 
              p.especies_compatibles.includes(String(lot.id_especie_vegetal))
            );

            return (
              <article key={lot.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all">
                
                <div onClick={() => toggleLot(lot.id)} className="cursor-pointer flex flex-wrap sm:flex-nowrap items-center justify-between p-4 hover:bg-slate-50 transition">
                  <div className="flex items-center gap-4 w-full sm:w-auto">
                    <img src={lot.imagen} alt={lot.cultivo} className="h-16 w-16 rounded-xl object-cover border border-slate-200" />
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-lg font-bold text-slate-900">{lot.numero}</p>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${data?.isCompleted ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                          {data?.isCompleted ? 'Inspeccionado' : 'Pendiente'}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-slate-600">{lot.cultivo} <span className="italic text-slate-400 text-xs">({lot.nombreCientifico})</span></p>
                      <p className="text-xs text-slate-500 mt-1">Siembra: {lot.fechaSiembra} • {lot.areaHa} ha</p>
                    </div>
                  </div>
                  
                  <button className={`mt-4 sm:mt-0 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition ${isExpanded ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>
                    {isExpanded ? <><ChevronUp size={16}/> Cerrar</> : <><Eye size={16}/> Llenar Datos</>}
                  </button>
                </div>

                {isExpanded && (
                  <div className="border-t border-slate-100 p-5 bg-slate-50/50">
                    
                    <div className="grid md:grid-cols-2 gap-6">
                      
                      {/* 🌟 NUEVO: CONTADOR DE PLANTAS TOTALES (AZUL) */}
                      <div className="rounded-xl border border-blue-200 bg-white p-5 shadow-sm">
                        <h3 className="text-sm font-bold uppercase tracking-wide text-blue-600 mb-4">Plantas Totales (Conteo Físico)</h3>
                        <div className="flex items-center justify-between">
                          <button onClick={() => updateLotData(lot.id, 'totalPlants', Math.max(0, data.totalPlants - 1))} className="rounded-xl bg-slate-100 p-3 text-slate-700 hover:bg-blue-100 hover:text-blue-600 transition"><Minus size={22} /></button>
                          <div className="text-center">
                            <p className="text-5xl font-black text-blue-600">{data.totalPlants}</p>
                            <p className="text-xs text-slate-400 font-medium">Encontradas en el lote</p>
                          </div>
                          <button onClick={() => updateLotData(lot.id, 'totalPlants', data.totalPlants + 1)} className="rounded-xl bg-slate-100 p-3 text-slate-700 hover:bg-blue-100 hover:text-blue-600 transition"><Plus size={22} /></button>
                        </div>
                      </div>

                      {/* CONTADOR DE PLANTAS AFECTADAS (ROJO) */}
                      <div className="rounded-xl border border-rose-200 bg-white p-5 shadow-sm">
                        <h3 className="text-sm font-bold uppercase tracking-wide text-rose-600 mb-4">Plantas con Plagas</h3>
                        <div className="flex items-center justify-between">
                          <button onClick={() => updateLotData(lot.id, 'affectedPlants', Math.max(0, data.affectedPlants - 1))} className="rounded-xl bg-slate-100 p-3 text-slate-700 hover:bg-rose-100 hover:text-rose-600 transition"><Minus size={22} /></button>
                          <div className="text-center">
                            <p className="text-5xl font-black text-rose-600">{data.affectedPlants}</p>
                            <p className="text-xs text-slate-400 font-medium">Con signos de infestación</p>
                          </div>
                          <button onClick={() => updateLotData(lot.id, 'affectedPlants', Math.min(data.totalPlants, data.affectedPlants + 1))} className="rounded-xl bg-slate-100 p-3 text-slate-700 hover:bg-rose-100 hover:text-rose-600 transition"><Plus size={22} /></button>
                        </div>
                      </div>

                      <div className="space-y-4 md:col-span-2">
                        <label className="block">
                          <span className="text-sm font-bold text-slate-700">Estado Fenológico de la Plantación *</span>
                          <select value={data.phenologyState} onChange={(e) => updateLotData(lot.id, 'phenologyState', e.target.value)} className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-emerald-400">
                            <option value="">Seleccionar estado...</option>
                            <option value="Vegetativo">Vegetativo</option>
                            <option value="Floración">Floración</option>
                            <option value="Fructificación">Fructificación</option>
                            <option value="Maduración">Maduración</option>
                          </select>
                        </label>
                        <label className="block">
                          <span className="text-sm font-bold text-slate-700">Observaciones Específicas del Lote</span>
                          <textarea value={data.observations} onChange={(e) => updateLotData(lot.id, 'observations', e.target.value)} rows={2} className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-400 resize-none" placeholder="Condiciones de maleza, riego, daños mecánicos..." />
                        </label>
                      </div>
                    </div>

                    {/* REGISTRO DE PLAGAS */}
                    <div className="mt-6 border-t border-slate-200 pt-5">
                      <h3 className="text-sm font-bold uppercase tracking-wide text-slate-700 mb-4">Registro de Plagas Específicas</h3>
                      <div className="grid lg:grid-cols-2 gap-3">
                        {plagasDelLote.map(pest => (
                          <div key={pest.id} className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
                            <div>
                              <p className="font-bold text-slate-800 text-sm">{pest.nombre}</p>
                              <p className="text-xs italic text-slate-500">{pest.nombreCientifico}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <button onClick={() => updatePestCount(lot.id, pest.id, -1)} className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200"><Minus size={14} /></button>
                              <p className="w-8 text-center font-bold text-slate-800">{data.pestCounts[pest.id] || 0}</p>
                              <button onClick={() => updatePestCount(lot.id, pest.id, 1)} className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-800 hover:bg-emerald-200"><Plus size={14} /></button>
                            </div>
                          </div>
                        ))}
                        {plagasDelLote.length === 0 && <p className="text-sm text-slate-500 italic">No hay plagas registradas en el catálogo para esta especie.</p>}
                      </div>
                    </div>

                    <div className="mt-6 flex justify-end gap-3">
                      <button onClick={() => markLotCompleted(lot.id)} disabled={!data.phenologyState} className="px-6 py-2.5 bg-emerald-800 text-white font-bold rounded-xl text-sm hover:bg-emerald-900 transition disabled:opacity-50 flex items-center gap-2">
                        <CheckCircle2 size={18} /> Guardar Inspección del Lote
                      </button>
                    </div>

                  </div>
                )}
              </article>
            );
          })}
        </div>

        {/* 🌟 BOTONERA FINAL (CON GUARDADO DE BORRADOR) */}
        <div className="flex flex-wrap items-center justify-between pt-6 border-t border-slate-200 mt-8 pb-10 gap-4">
          <button type="button" onClick={handleSaveDraftAndExit} className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 shadow-sm transition">
            <Save size={16} /> Guardar Progreso y Salir
          </button>
          
          <button 
            type="button" 
            onClick={handleFinalizarInspeccion} 
            disabled={!canFinish}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-800 disabled:opacity-50 shadow-sm"
          >
            <CheckCircle2 size={16} /> Finalizar Inspección
          </button>
        </div>

      </section>
    </DashboardLayout>
  );
}