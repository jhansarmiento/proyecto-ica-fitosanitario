// frontend/src/components/ui/InspectionDetailsModal.tsx
import { CalendarCheck, FileText, MapPin, User, Layers, X, Sprout, AlertCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { fincaService } from '../../services/finca.service';

type InspectionDetailsModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  solicitud: any | null;
  esTecnico: boolean;
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

  // Lógica para APROBAR
  const handleConfirmar = async () => {
    if (!fechaConfirmada || loading) return;
    try {
      setLoading(true);
      await fincaService.gestionarInspeccion(solicitud.id_solicitud, {
        fecha_programada_tecnico: fechaConfirmada,
        observaciones_tecnico: notasTecnico.trim() || undefined,
        estado: 'PROGRAMADA' // 🌟 Aprobamos
      });
      onSuccess();
    } catch (e: any) {
      setError(e.message || 'Error al programar la inspección.');
      setLoading(false);
    }
  };

  // Lógica para RECHAZAR
  const handleRechazar = async () => {
    if (notasTecnico.trim().length === 0) {
      setError('Debes dejar un comentario explicando por qué rechazas la solicitud.');
      return;
    }
    try {
      setLoading(true);
      await fincaService.gestionarInspeccion(solicitud.id_solicitud, {
        observaciones_tecnico: notasTecnico.trim(),
        estado: 'RECHAZADA' // 🌟 Rechazamos
      });
      onSuccess();
    } catch (e: any) {
      setError(e.message || 'Error al rechazar la solicitud.');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/45 px-4 py-6 backdrop-blur-[1px] overflow-y-auto">
      <div className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/5 my-auto">
        
        <div className="bg-emerald-900 px-5 py-4 text-white flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-emerald-800 ring-1 ring-white/20">
              <CalendarCheck size={22} />
            </div>
            <div>
              <h3 className="text-xl font-bold leading-none">{esTecnico ? 'Gestionar Inspección' : 'Detalles de la Solicitud'}</h3>
              <p className="mt-1 text-sm text-emerald-100">Estado: <span className="font-bold uppercase">{solicitud.estado}</span></p>
            </div>
          </div>
          <button onClick={onClose} className="text-emerald-100 hover:text-white transition">
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 p-3 flex gap-2 items-start text-sm text-rose-700">
              <AlertCircle size={18} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* 🌟 INFORMACIÓN ENRIQUECIDA DEL LUGAR */}
          <div className="mb-6 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <h4 className="text-lg font-bold text-slate-800 mb-1">{solicitud.lugar_nombre}</h4>
            <p className="text-sm text-slate-600 flex items-center gap-1.5"><MapPin size={15} className="text-emerald-700"/> {solicitud.lugar_ubicacion}</p>
            
            <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 border-t border-slate-200 pt-3">
                <p className="text-sm text-slate-600 flex items-center gap-1.5 font-medium"><User size={15} className="text-emerald-700"/> Asignado: {solicitud.asistente_nombre}</p>
                <p className="text-sm text-slate-600 flex items-center gap-1.5 font-medium"><Layers size={15} className="text-emerald-700"/> {solicitud.cantidad_lotes} Lotes Activos</p>
            </div>
            
            <div className="mt-2 flex items-start gap-1.5">
                <Sprout size={15} className="text-emerald-700 mt-0.5 shrink-0"/> 
                <p className="text-sm text-slate-600 font-medium">Cultivos: <span className="font-normal text-slate-500">{solicitud.cultivos}</span></p>
            </div>
          </div>

          <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4">
             <p className="text-xs uppercase tracking-wide font-bold text-amber-800 mb-1">Notas del Productor</p>
             <p className="text-sm text-amber-900 flex items-start gap-2">
               <FileText size={16} className="shrink-0 mt-0.5 opacity-50" />
               {solicitud.observaciones || 'No se dejaron notas adicionales en la solicitud.'}
             </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-1.5">
              <span className="text-sm font-semibold text-slate-700">
                {esTecnico && solicitud.estado === 'SOLICITADA' ? 'Fecha Definitiva *' : 'Fecha de Inspección'}
              </span>
              <p className="text-xs text-slate-500 font-semibold">Propuesta del Productor (aa/mm/dd): {solicitud.fecha_tentativa ? solicitud.fecha_tentativa.split('T')[0] : 'N/D'}</p>
              
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
                  {fechaConfirmada || (solicitud.estado === 'RECHAZADA' ? 'Rechazada' : 'Pendiente')}
                </div>
              )}
            </label>

            <label className="space-y-1.5 sm:col-span-2 mt-2 border-t border-slate-100 pt-4">
              <span className="text-sm font-semibold text-slate-700">
                {esTecnico && solicitud.estado === 'SOLICITADA' ? 'Dejar Notas para el Productor' : 'Comentarios del Inspector ICA'}
              </span>
              {esTecnico && solicitud.estado === 'SOLICITADA' ? (
                <textarea
                  rows={3}
                  value={notasTecnico}
                  onChange={(e) => setNotasTecnico(e.target.value)}
                  placeholder="Obligatorio si vas a rechazar la solicitud. Ej: Favor corregir fecha..."
                  className="w-full rounded-xl border border-slate-300 p-3 text-sm outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100 resize-none"
                />
              ) : (
                <div className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700 min-h-20">
                  {notasTecnico || <span className="text-slate-400 italic">El asistente no ha dejado comentarios.</span>}
                </div>
              )}
            </label>
          </div>

          <div className="flex flex-wrap justify-end gap-3 border-t border-slate-100 pt-6 mt-6">
            <button onClick={onClose} disabled={loading} className="rounded-xl border px-5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition">
              {esTecnico && solicitud.estado === 'SOLICITADA' ? 'Cancelar' : 'Cerrar'}
            </button>
            
            {esTecnico && solicitud.estado === 'SOLICITADA' && (
              <>
                <button onClick={handleRechazar} disabled={loading} className="rounded-xl bg-rose-100 px-6 py-2 text-sm font-bold text-rose-700 hover:bg-rose-200 transition">
                  {loading ? '...' : 'Rechazar Solicitud'}
                </button>
                <button onClick={handleConfirmar} disabled={!fechaConfirmada || loading} className="rounded-xl bg-emerald-900 px-6 py-2 text-sm font-bold text-white hover:bg-emerald-800 disabled:opacity-50 transition">
                  {loading ? 'Procesando...' : 'Confirmar Agenda'}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default InspectionDetailsModal;