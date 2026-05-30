import { useEffect, useState } from 'react';
import { Calendar, Search } from 'lucide-react';
import DashboardLayout from '../components/layout/DashboardLayout';
import ScheduleInspectionModal from '../components/ui/ScheduleInspectionModal';
import { fincaService } from '../services/finca.service';

function InspectionRequestsPage({ sessionUser, onNavigate, onLogout }: any) {
  const [solicitudes, setSolicitudes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReq, setSelectedReq] = useState<any>(null);

  const esTecnico = sessionUser?.rol?.toLowerCase() === 'asistente_tecnico' || sessionUser?.rol?.toLowerCase() === 'administrador';

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fincaService.getSolicitudesInspeccion();
      setSolicitudes(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const openModal = (sol: any) => {
    setSelectedReq(sol);
    setIsModalOpen(true);
  };

  return (
    <DashboardLayout title="Inspecciones" sessionUser={sessionUser} activeView="inspections-agenda" onNavigate={onNavigate} onLogout={onLogout}>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900">Agenda de Inspecciones</h2>
          <p className="text-slate-600">Gestiona y haz seguimiento a las visitas técnicas.</p>
        </div>
      </div>

      {loading ? (
        <div className="p-8 text-center text-slate-500 animate-pulse">Cargando solicitudes...</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {solicitudes.map((sol) => (
            <article key={sol.id_solicitud} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  sol.estado === 'SOLICITADA' ? 'bg-blue-100 text-blue-700' : 
                  sol.estado === 'PROGRAMADA' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                }`}>
                  {sol.estado}
                </span>
                <p className="text-xs text-slate-400">Radicado: {sol.fecha_creacion.split('T')[0]}</p>
              </div>

              <h3 className="text-lg font-bold text-slate-800">{sol.lugar_nombre}</h3>
              <p className="text-sm text-slate-500 mb-4">{sol.lugar_ubicacion}</p>

              <div className="space-y-2 mb-5 border-t border-slate-100 pt-4">
                <p className="text-sm text-slate-700 flex justify-between">
                  <span className="text-slate-500">Fecha Propuesta:</span> 
                  <span className="font-semibold">{sol.fecha_tentativa ? sol.fecha_tentativa.split('T')[0] : 'N/D'}</span>
                </p>
                <p className="text-sm text-slate-700 flex justify-between">
                  <span className="text-slate-500">Fecha Confirmada:</span> 
                  <span className="font-bold text-emerald-700">{sol.fecha_programada ? sol.fecha_programada.split('T')[0] : 'Pendiente'}</span>
                </p>
              </div>

              {/* Lógica de botones según el ROL */}
              {esTecnico && sol.estado === 'SOLICITADA' ? (
                <button onClick={() => openModal(sol)} className="w-full py-2 bg-emerald-900 text-white rounded-xl text-sm font-bold hover:bg-emerald-800 transition flex justify-center items-center gap-2">
                  <Calendar size={16} /> Programar Visita
                </button>
              ) : (
                <button className="w-full py-2 bg-slate-100 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-200 transition">
                  Ver Detalles
                </button>
              )}
            </article>
          ))}
          {solicitudes.length === 0 && <p className="text-slate-500 col-span-full">No hay solicitudes registradas.</p>}
        </div>
      )}

      <ScheduleInspectionModal 
        isOpen={isModalOpen} 
        solicitud={selectedReq} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={() => { setIsModalOpen(false); loadData(); }} 
      />
    </DashboardLayout>
  );
}

export default InspectionRequestsPage;