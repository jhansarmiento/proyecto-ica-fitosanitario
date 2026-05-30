// frontend/src/components/ui/InspectionDetailsModal.tsx
import { CalendarCheck, FileText, MapPin, User, Layers, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { fincaService } from '../../services/finca.service';

type InspectionDetailsModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  solicitud: any | null;
  esTecnico: boolean; // 🌟 Llave maestra de permisos
};

function InspectionDetailsModal({ isOpen, onClose, onSuccess, solicitud, esTecnico }: InspectionDetailsModalProps) {
  const [fechaConfirmada, setFechaConfirmada] = useState('');
  const [notasTecnico, setNotasTecnico] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && solicitud) {
      setFechaConfirmada(solicitud.fecha_programada ? solicitud.fecha_programada.split('T')[0] : (solicitud.fecha_tentativa ? solicitud.fecha_tentativa.split('T')[0] : ''));
      setNotasTecnico(solicitud.observaciones_tecnico || '');
      setError('');
    }
  }, [isOpen, solicitud]);

  if (!isOpen || !solicitud) return null;

  const handleSave = async () => {
    if (!fechaConfirmada || loading) return;
    try {
      setLoading(true);
      await fincaService.programarInspeccion(solicitud.id_solicitud, {
        fecha_programada_tecnico: fechaConfirmada,
        observaciones_tecnico: notasTecnico.trim() || undefined
      });
      onSuccess();
    } catch (e: any) {
      setError(e.message || 'Error al programar la inspección.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/45 px-4 py-6 backdrop-blur-[1px] overflow-y-auto">
      <div className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/5 my-auto">
        
        {/* Cabecera */}
        <div className="bg-emerald-900 px-5 py-4 text-white flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-emerald-800 ring-1 ring-white/20">
              <CalendarCheck size={22} />
            </div>
            <div>
              <h3 className="text-xl font-bold leading-none">{esTecnico ? 'Programar Inspección' : 'Detalles de la Solicitud'}</h3>
              <p className="mt-1 text-sm text-emerald-100">Estado: <span className="font-bold uppercase">{solicitud.estado}</span></p>
            </div>
          </div>
          <button onClick={onClose} className="text-emerald-100 hover:text-white transition">
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          {error && <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{error}</div>}

          {/* Información del Lugar y Lotes */}
          <div className="mb-6 grid gap-4 sm:grid-cols-2">
             <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 sm:col-span-2">
                <h4 className="text-lg font-bold text-slate-800 mb-1">{solicitud.lugar_nombre}</h4>
                <p className="text-sm text-slate-500 flex items-center gap-1"><MapPin size={14}/> {solicitud.lugar_ubicacion}</p>
                <div className="mt-3 flex gap-4 border-t border-slate-200 pt-3">
                   <p className="text-sm text-slate-600 flex items-center gap-1 font-semibold"><User size={15} className="text-emerald-700"/> {solicitud.asistente_nombre}</p>
                   <p className="text-sm text-slate-600 flex items-center gap-1 font-semibold"><Layers size={15} className="text-emerald-700"/> {solicitud.cantidad_lotes} Lotes Activos</p>
                </div>
             </div>
          </div>

          {/* Notas del Productor (Siempre de solo lectura) */}
          <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4">
             <p className="text-xs uppercase tracking-wide font-bold text-amber-800 mb-1">Notas del Productor</p>
             <p className="text-sm text-amber-900 flex items-start gap-2">
               <FileText size={16} className="shrink-0 mt-0.5 opacity-50" />
               {solicitud.observaciones || 'No se dejaron notas adicionales en la solicitud.'}
             </p>
          </div>

          {/* Zona de Acción Técnica */}
          <div className="grid gap-4 sm:grid-cols-2">
            
            {/* FECHA */}
            <label className="space-y-1.5">
              <span className="text-sm font-semibold text-slate-700">
                {esTecnico ? 'Confirmar Fecha de Inspección *' : 'Fecha de Inspección Asignada'}
              </span>
              <p className="text-xs text-slate-500">Solicitada: {solicitud.fecha_tentativa ? solicitud.fecha_tentativa.split('T')[0] : 'N/D'}</p>
              
              {esTecnico && solicitud.estado === 'SOLICITADA' ? (
                <input
                  type="date"
                  value={fechaConfirmada}
                  onChange={(e) => setFechaConfirmada(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="h-11 w-full rounded-xl border border-slate-300 px-3 text-sm outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
                />
              ) : (
                <div className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 flex items-center text-sm font-bold text-slate-700">
                  {fechaConfirmada || 'Pendiente de confirmación'}
                </div>
              )}
            </label>

            {/* NOTAS DEL TÉCNICO */}
            <label className="space-y-1.5 sm:col-span-2 mt-2 border-t border-slate-100 pt-4">
              <span className="text-sm font-semibold text-slate-700">
                {esTecnico ? 'Dejar Notas para el Productor' : 'Comentarios del Inspector ICA'}
              </span>
              {esTecnico && solicitud.estado === 'SOLICITADA' ? (
                <textarea
                  rows={3}
                  value={notasTecnico}
                  onChange={(e) => setNotasTecnico(e.target.value)}
                  placeholder="Ej: Llegaré en la tarde, favor tener los registros listos..."
                  className="w-full rounded-xl border border-slate-300 p-3 text-sm outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100 resize-none"
                />
              ) : (
                <div className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700 min-h-20">
                  {notasTecnico || <span className="text-slate-400 italic">El asistente no ha dejado comentarios.</span>}
                </div>
              )}
            </label>
          </div>

          <div className="flex justify-end gap-3 border-t border-slate-100 pt-6 mt-6">
            <button onClick={onClose} className="rounded-xl border px-5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition">
              {esTecnico && solicitud.estado === 'SOLICITADA' ? 'Cancelar' : 'Cerrar'}
            </button>
            
            {esTecnico && solicitud.estado === 'SOLICITADA' && (
              <button onClick={handleSave} disabled={!fechaConfirmada || loading} className="rounded-xl bg-emerald-900 px-6 py-2 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-50 transition">
                {loading ? 'Programando...' : 'Confirmar Agenda'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default InspectionDetailsModal;