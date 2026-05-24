import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Clock3,
  Filter,
  Loader2,
  MapPin,
  Phone,
  Plus,
  Search,
  User,
  X,
  XCircle,
} from 'lucide-react';
import DashboardLayout, { type DashboardViewKey } from '../components/layout/DashboardLayout';
import SkeletonBlock from '../components/ui/SkeletonBlock';
import type { SessionUser } from '../App';
import {
  api,
  type CreateSolicitudDTO,
  type EstadoSolicitud,
  type LoteDTO,
  type LugarProduccionDTO,
  type SolicitudInspeccionDTO,
} from '../services/api';

// ─── Props ───────────────────────────────────────────────────────────────────

type InspectionHistoryPageProps = {
  sessionUser?: SessionUser;
  onGoHome?: () => void;
  onGoUsers?: () => void;
  onGoRoles?: () => void;
  onGoAgricultural?: () => void;
  onGoCatalog?: () => void;
  onGoApprovalPlaces?: () => void;
  onGoInspectionsAgenda?: () => void;
  onLogout?: () => void;
};

// ─── Helpers de estado ───────────────────────────────────────────────────────

const ESTADO_LABEL: Record<EstadoSolicitud, string> = {
  SOLICITADA: 'Solicitada',
  PROGRAMADA: 'Programada',
  REALIZADA: 'Realizada',
  CANCELADA: 'Cancelada',
  NO_PROGRAMADA: 'No Programada',
};

const ESTADO_BADGE: Record<EstadoSolicitud, string> = {
  SOLICITADA: 'bg-blue-100 text-blue-700 border-blue-200',
  PROGRAMADA: 'bg-amber-100 text-amber-700 border-amber-200',
  REALIZADA: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  CANCELADA: 'bg-rose-100 text-rose-700 border-rose-200',
  NO_PROGRAMADA: 'bg-slate-100 text-slate-600 border-slate-200',
};

const ESTADO_DOT: Record<EstadoSolicitud, string> = {
  SOLICITADA: 'bg-blue-500',
  PROGRAMADA: 'bg-amber-500',
  REALIZADA: 'bg-emerald-500',
  CANCELADA: 'bg-rose-500',
  NO_PROGRAMADA: 'bg-slate-400',
};

function EstadoBadge({ estado }: { estado: EstadoSolicitud }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${ESTADO_BADGE[estado] ?? 'bg-slate-100 text-slate-600 border-slate-200'}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${ESTADO_DOT[estado] ?? 'bg-slate-400'}`} />
      {ESTADO_LABEL[estado] ?? estado}
    </span>
  );
}

// ─── Timeline ────────────────────────────────────────────────────────────────

const TIMELINE_STEPS: { estado: EstadoSolicitud; label: string; desc: string }[] = [
  { estado: 'SOLICITADA', label: 'Solicitud creada', desc: 'El productor registró la solicitud' },
  { estado: 'PROGRAMADA', label: 'Programada', desc: 'El técnico confirmó la fecha de visita' },
  { estado: 'REALIZADA', label: 'Realizada', desc: 'Inspección ejecutada exitosamente' },
];

const ESTADO_ORDER: Record<EstadoSolicitud, number> = {
  SOLICITADA: 0,
  PROGRAMADA: 1,
  REALIZADA: 2,
  CANCELADA: -1,
  NO_PROGRAMADA: -1,
};

function Timeline({ solicitud }: { solicitud: SolicitudInspeccionDTO }) {
  const currentOrder = ESTADO_ORDER[solicitud.estado];
  const isCancelled = solicitud.estado === 'CANCELADA' || solicitud.estado === 'NO_PROGRAMADA';

  return (
    <div className="space-y-0">
      {TIMELINE_STEPS.map((step, idx) => {
        const stepOrder = ESTADO_ORDER[step.estado];
        const isDone = !isCancelled && currentOrder >= stepOrder;
        const isActive = !isCancelled && currentOrder === stepOrder;
        const isLast = idx === TIMELINE_STEPS.length - 1;

        return (
          <div key={step.estado} className="flex gap-3">
            <div className="flex flex-col items-center">
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 transition-all ${
                  isDone
                    ? 'border-emerald-500 bg-emerald-500 text-white'
                    : isActive
                      ? 'border-blue-500 bg-blue-50 text-blue-600'
                      : 'border-slate-200 bg-white text-slate-400'
                }`}
              >
                {isDone ? (
                  <CheckCircle2 size={14} />
                ) : (
                  <span className="text-[10px] font-bold">{idx + 1}</span>
                )}
              </div>
              {!isLast && (
                <div className={`mt-1 w-0.5 flex-1 ${isDone ? 'bg-emerald-400' : 'bg-slate-200'}`} style={{ minHeight: 28 }} />
              )}
            </div>
            <div className="pb-5 pt-1">
              <p className={`text-sm font-semibold ${isDone ? 'text-slate-800' : 'text-slate-400'}`}>{step.label}</p>
              <p className={`text-xs ${isDone ? 'text-slate-500' : 'text-slate-300'}`}>{step.desc}</p>
              {step.estado === 'SOLICITADA' && solicitud.fechaCreacion && (
                <p className="mt-0.5 text-[11px] text-slate-400">
                  {formatDateTime(solicitud.fechaCreacion)}
                </p>
              )}
              {step.estado === 'PROGRAMADA' && solicitud.fechaProgramadaTecnico && (
                <p className="mt-0.5 text-[11px] text-slate-400">
                  {formatDateTime(solicitud.fechaProgramadaTecnico)}
                </p>
              )}
            </div>
          </div>
        );
      })}

      {isCancelled && (
        <div className="flex gap-3">
          <div className="flex flex-col items-center">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-rose-400 bg-rose-50 text-rose-500">
              <XCircle size={14} />
            </div>
          </div>
          <div className="pt-1">
            <p className="text-sm font-semibold text-rose-600">{ESTADO_LABEL[solicitud.estado]}</p>
            {solicitud.observaciones && (
              <p className="text-xs text-slate-500">{solicitud.observaciones}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Formatters ──────────────────────────────────────────────────────────────

function formatDate(iso: string | null | undefined): string {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleDateString('es-CO', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return iso;
  }
}

function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString('es-CO', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

// ─── Toast ───────────────────────────────────────────────────────────────────

type ToastState = { type: 'success' | 'error' | 'info'; message: string } | null;

const TOAST_STYLES = {
  success: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  error: 'border-rose-200 bg-rose-50 text-rose-800',
  info: 'border-blue-200 bg-blue-50 text-blue-800',
};

function Toast({ toast, onClose }: { toast: ToastState; onClose: () => void }) {
  if (!toast) return null;
  return (
    <div
      className={`fixed bottom-6 right-6 z-[200] flex items-center gap-3 rounded-2xl border px-5 py-3.5 shadow-xl text-sm font-medium animate-in slide-in-from-bottom-4 ${TOAST_STYLES[toast.type]}`}
    >
      {toast.type === 'success' && <CheckCircle2 size={18} />}
      {toast.type === 'error' && <AlertCircle size={18} />}
      {toast.type === 'info' && <Clock3 size={18} />}
      <span>{toast.message}</span>
      <button type="button" onClick={onClose} className="ml-2 opacity-60 hover:opacity-100">
        <X size={16} />
      </button>
    </div>
  );
}

// ─── Modal base ──────────────────────────────────────────────────────────────

function Modal({
  open,
  onClose,
  children,
  size = 'lg',
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  size?: 'md' | 'lg' | 'xl';
}) {
  if (!open) return null;
  const widths = { md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' };
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className={`relative w-full ${widths[size]} max-h-[90vh] overflow-y-auto rounded-3xl bg-white shadow-2xl`}
      >
        {children}
      </div>
    </div>
  );
}

// ─── Skeleton de tabla ───────────────────────────────────────────────────────

function TableSkeleton({ cols }: { cols: number }) {
  return (
    <>
      {Array.from({ length: 5 }).map((_, i) => (
        <tr key={i} className="border-b border-slate-100">
          {Array.from({ length: cols }).map((_, j) => (
            <td key={j} className="px-4 py-3">
              <SkeletonBlock className="h-4 w-full" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

// ─── Modal Detalle — PRODUCTOR ────────────────────────────────────────────────

function ModalDetalleProductor({
  solicitud,
  onClose,
}: {
  solicitud: SolicitudInspeccionDTO;
  onClose: () => void;
}) {
  const lugar = solicitud.lote?.predio?.lugarProduccion;
  const predio = solicitud.lote?.predio;
  const tecnico = solicitud.asistenteTecnico;

  return (
    <Modal open onClose={onClose} size="lg">
      {/* Header */}
      <div className="sticky top-0 z-10 flex items-start justify-between gap-4 rounded-t-3xl bg-gradient-to-r from-emerald-900 to-emerald-700 px-6 py-5 text-white">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-emerald-200">Detalle de Solicitud</p>
          <h2 className="mt-1 text-xl font-bold leading-tight">
            {lugar?.nombreLugarProduccion ?? '—'}
          </h2>
          <p className="mt-1 text-sm text-emerald-100">
            Lote {solicitud.lote?.numeroLote ?? '—'} · {predio?.nombrePredio ?? '—'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <EstadoBadge estado={solicitud.estado} />
          <button
            type="button"
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      <div className="space-y-5 p-6">
        {/* Info cards */}
        <div className="grid gap-4 sm:grid-cols-2">
          <InfoCard label="Lugar de Producción" value={lugar?.nombreLugarProduccion} icon={<MapPin size={15} />} />
          <InfoCard label="Número ICA" value={lugar?.numeroRegistroICA} icon={<ClipboardList size={15} />} />
          <InfoCard label="Lote" value={solicitud.lote?.numeroLote} icon={<Layers size={15} />} />
          <InfoCard label="Predio" value={predio?.nombrePredio} icon={<MapPin size={15} />} />
          <InfoCard label="Fecha Solicitud" value={formatDate(solicitud.fechaCreacion)} icon={<CalendarDays size={15} />} />
          <InfoCard
            label="Fecha Tentativa Propuesta"
            value={formatDateTime(solicitud.fechaTentativaProductor)}
            icon={<Clock3 size={15} />}
          />
          {solicitud.fechaProgramadaTecnico && (
            <InfoCard
              label="Fecha Programada por Técnico"
              value={formatDateTime(solicitud.fechaProgramadaTecnico)}
              icon={<CalendarDays size={15} />}
              highlight
            />
          )}
          <InfoCard
            label="Técnico Asignado"
            value={tecnico ? `${tecnico.nombre} ${tecnico.apellidos}` : '—'}
            icon={<User size={15} />}
          />
        </div>

        {/* Observaciones */}
        {solicitud.observaciones && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-amber-700">Observaciones</p>
            <p className="text-sm text-amber-900">{solicitud.observaciones}</p>
          </div>
        )}

        {/* Timeline */}
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-slate-500">Historial del Proceso</p>
          <Timeline solicitud={solicitud} />
        </div>
      </div>
    </Modal>
  );
}

// ─── Modal Detalle — ASISTENTE / ADMIN ───────────────────────────────────────

function ModalDetalleAdmin({
  solicitud,
  onClose,
  onAccept,
  onReject,
  isUpdating,
}: {
  solicitud: SolicitudInspeccionDTO;
  onClose: () => void;
  onAccept: (id: string, fecha: string) => Promise<void>;
  onReject: (id: string, obs: string) => Promise<void>;
  isUpdating: boolean;
}) {
  const lugar = solicitud.lote?.predio?.lugarProduccion;
  const predio = solicitud.lote?.predio;
  const productor = lugar?.productor;

  const [accion, setAccion] = useState<'none' | 'aceptar' | 'rechazar'>('none');
  const [fechaPropuesta, setFechaPropuesta] = useState('');
  const [observaciones, setObservaciones] = useState('');

  const canAccept = solicitud.estado === 'SOLICITADA';

  return (
    <Modal open onClose={onClose} size="xl">
      {/* Header */}
      <div className="sticky top-0 z-10 flex items-start justify-between gap-4 rounded-t-3xl bg-gradient-to-r from-slate-900 to-slate-700 px-6 py-5 text-white">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-300">Gestión de Solicitud</p>
          <h2 className="mt-1 text-xl font-bold leading-tight">
            {lugar?.nombreLugarProduccion ?? '—'}
          </h2>
          <p className="mt-1 text-sm text-slate-300">
            Lote {solicitud.lote?.numeroLote ?? '—'} · {predio?.nombrePredio ?? '—'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <EstadoBadge estado={solicitud.estado} />
          <button
            type="button"
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      <div className="space-y-5 p-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {/* Productor */}
          <div className="col-span-full rounded-2xl border border-blue-100 bg-blue-50 p-4">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-blue-600">Datos del Productor</p>
            <div className="grid gap-3 sm:grid-cols-3">
              <InfoCard label="Productor" value={productor ? `${productor.nombre} ${productor.apellidos}` : '—'} icon={<User size={15} />} />
              <InfoCard label="Teléfono" value={productor?.telefono} icon={<Phone size={15} />} />
              <InfoCard label="Correo" value={productor?.correoElectronico} icon={<User size={15} />} />
            </div>
          </div>

          {/* Lugar */}
          <InfoCard label="Lugar de Producción" value={lugar?.nombreLugarProduccion} icon={<MapPin size={15} />} />
          <InfoCard label="Número ICA Lugar" value={lugar?.numeroRegistroICA} icon={<ClipboardList size={15} />} />
          <InfoCard label="Lote" value={solicitud.lote?.numeroLote} icon={<Layers size={15} />} />
          <InfoCard label="Predio" value={predio?.nombrePredio} icon={<MapPin size={15} />} />
          <InfoCard label="Número ICA Predio" value={predio?.numeroRegistroICA} icon={<ClipboardList size={15} />} />
          <InfoCard label="Dirección Predio" value={predio?.direccion} icon={<MapPin size={15} />} />
          <InfoCard label="Fecha Solicitud" value={formatDate(solicitud.fechaCreacion)} icon={<CalendarDays size={15} />} />
          <InfoCard
            label="Fecha Propuesta por Productor"
            value={formatDateTime(solicitud.fechaTentativaProductor)}
            icon={<Clock3 size={15} />}
            highlight
          />
          {solicitud.fechaProgramadaTecnico && (
            <InfoCard
              label="Fecha Programada"
              value={formatDateTime(solicitud.fechaProgramadaTecnico)}
              icon={<CalendarDays size={15} />}
            />
          )}
        </div>

        {/* Observaciones */}
        {solicitud.observaciones && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-amber-700">Observaciones</p>
            <p className="text-sm text-amber-900">{solicitud.observaciones}</p>
          </div>
        )}

        {/* Timeline */}
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-slate-500">Historial del Proceso</p>
          <Timeline solicitud={solicitud} />
        </div>

        {/* Acciones */}
        {canAccept && accion === 'none' && (
          <div className="flex flex-wrap gap-3 border-t border-slate-100 pt-4">
            <button
              type="button"
              onClick={() => setAccion('aceptar')}
              className="flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 active:scale-95"
            >
              <CheckCircle2 size={16} />
              Aceptar Solicitud
            </button>
            <button
              type="button"
              onClick={() => setAccion('rechazar')}
              className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-5 py-2.5 text-sm font-semibold text-rose-700 transition hover:bg-rose-100 active:scale-95"
            >
              <XCircle size={16} />
              Rechazar y Proponer Nueva Fecha
            </button>
          </div>
        )}

        {/* Panel Aceptar */}
        {accion === 'aceptar' && (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 space-y-3">
            <p className="text-sm font-semibold text-emerald-800">Confirmar fecha de inspección</p>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">Fecha y hora programada</label>
              <input
                type="datetime-local"
                value={fechaPropuesta}
                onChange={(e) => setFechaPropuesta(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={!fechaPropuesta || isUpdating}
                onClick={() => onAccept(solicitud.id, fechaPropuesta)}
                className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50 hover:bg-emerald-700 active:scale-95"
              >
                {isUpdating ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                Confirmar
              </button>
              <button
                type="button"
                onClick={() => setAccion('none')}
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}

        {/* Panel Rechazar */}
        {accion === 'rechazar' && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 space-y-3">
            <p className="text-sm font-semibold text-rose-800">Rechazar solicitud</p>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">Motivo / Observaciones</label>
              <textarea
                rows={3}
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
                placeholder="Explica el motivo del rechazo o propón una nueva fecha..."
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-100 resize-none"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={!observaciones.trim() || isUpdating}
                onClick={() => onReject(solicitud.id, observaciones)}
                className="flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50 hover:bg-rose-700 active:scale-95"
              >
                {isUpdating ? <Loader2 size={14} className="animate-spin" /> : <XCircle size={14} />}
                Confirmar Rechazo
              </button>
              <button
                type="button"
                onClick={() => setAccion('none')}
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}

// ─── Modal Solicitar Inspección (PRODUCTOR) ───────────────────────────────────

type SolicitudFormState = {
  idLugarProduccion: string;
  idLotes: string[];
  fechaTentativa: string;
};

function ModalSolicitarInspeccion({
  open,
  onClose,
  onSubmit,
  lugares,
  lotes,
  isSubmitting,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateSolicitudDTO[]) => Promise<void>;
  lugares: LugarProduccionDTO[];
  lotes: LoteDTO[];
  isSubmitting: boolean;
}) {
  const [step, setStep] = useState<1 | 2>(1);
  const [form, setForm] = useState<SolicitudFormState>({
    idLugarProduccion: '',
    idLotes: [],
    fechaTentativa: '',
  });

  const lotesDelLugar = useMemo(
    () => lotes.filter((l) => l.predio?.id === form.idLugarProduccion || form.idLugarProduccion === ''),
    [lotes, form.idLugarProduccion],
  );

  // Técnico asignado al lugar seleccionado — se deriva automáticamente
  const lugarSeleccionado = useMemo(
    () => lugares.find((l) => l.id === form.idLugarProduccion) ?? null,
    [lugares, form.idLugarProduccion],
  );
  const tecnicoAsignado = lugarSeleccionado?.solicitudRegistroLugar?.asistenteAsignado ?? null;
  const tecnicoId = tecnicoAsignado?.id ?? '';
  const tecnicoNombre = tecnicoAsignado
    ? `${tecnicoAsignado.nombre} ${tecnicoAsignado.apellidos}`
    : null;

  const canGoStep2 = form.idLugarProduccion && form.idLotes.length > 0 && form.fechaTentativa && tecnicoId;

  const toggleLote = (id: string) => {
    setForm((f) => ({
      ...f,
      idLotes: f.idLotes.includes(id)
        ? f.idLotes.filter((l) => l !== id)
        : [...f.idLotes, id],
    }));
  };

  const toggleTodos = () => {
    setForm((f) => ({
      ...f,
      idLotes: f.idLotes.length === lotesDelLugar.length
        ? []
        : lotesDelLugar.map((l) => l.id),
    }));
  };

  const handleClose = () => {
    setStep(1);
    setForm({ idLugarProduccion: '', idLotes: [], fechaTentativa: '' });
    onClose();
  };

  const handleSubmit = async () => {
    const solicitudes: CreateSolicitudDTO[] = form.idLotes.map((idLote) => ({
      idLote,
      idAsistenteTecnico: tecnicoId,
      fechaTentativaProductor: form.fechaTentativa,
    }));
    await onSubmit(solicitudes);
    handleClose();
  };

  return (
    <Modal open={open} onClose={handleClose} size="md">
      {/* Header */}
      <div className="flex items-center justify-between rounded-t-3xl bg-gradient-to-r from-emerald-900 to-emerald-700 px-6 py-5 text-white">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-emerald-200">
            Paso {step} de 2
          </p>
          <h2 className="mt-1 text-lg font-bold">
            {step === 1 ? 'Nueva Solicitud de Inspección' : 'Confirmar Solicitud'}
          </h2>
        </div>
        <button
          type="button"
          onClick={handleClose}
          className="grid h-8 w-8 place-items-center rounded-full bg-white/10 hover:bg-white/20"
        >
          <X size={16} />
        </button>
      </div>

      {/* Stepper */}
      <div className="flex items-center gap-2 border-b border-slate-100 px-6 py-3">
        {[1, 2].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div
              className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                step >= s ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-500'
              }`}
            >
              {s}
            </div>
            <span className={`text-xs font-medium ${step >= s ? 'text-emerald-700' : 'text-slate-400'}`}>
              {s === 1 ? 'Datos' : 'Confirmación'}
            </span>
            {s < 2 && <div className={`h-px w-8 ${step > s ? 'bg-emerald-400' : 'bg-slate-200'}`} />}
          </div>
        ))}
      </div>

      <div className="p-6 space-y-4">
        {step === 1 ? (
          <>
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-600">Lugar de Producción *</label>
              <select
                value={form.idLugarProduccion}
                onChange={(e) => setForm((f) => ({ ...f, idLugarProduccion: e.target.value, idLotes: [] }))}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
              >
                <option value="">Selecciona un lugar...</option>
                {lugares.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.nombreLugarProduccion} — {l.numeroRegistroICA}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-600">
                  Lotes * <span className="font-normal text-slate-400">(selecciona uno o más)</span>
                </label>
                {form.idLugarProduccion && lotesDelLugar.length > 0 && (
                  <button
                    type="button"
                    onClick={toggleTodos}
                    className="text-[11px] font-semibold text-emerald-600 hover:text-emerald-800"
                  >
                    {form.idLotes.length === lotesDelLugar.length ? 'Deseleccionar todos' : 'Seleccionar todos'}
                  </button>
                )}
              </div>

              {!form.idLugarProduccion ? (
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-400">
                  Selecciona primero un lugar de producción
                </div>
              ) : lotesDelLugar.length === 0 ? (
                <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-3 text-sm text-amber-700">
                  Este lugar no tiene lotes registrados
                </div>
              ) : (
                <div className="max-h-44 space-y-1.5 overflow-y-auto rounded-xl border border-slate-200 bg-white p-2">
                  {lotesDelLugar.map((l) => {
                    const checked = form.idLotes.includes(l.id);
                    return (
                      <label
                        key={l.id}
                        className={`flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 transition-colors ${
                          checked
                            ? 'bg-emerald-50 border border-emerald-200'
                            : 'border border-transparent hover:bg-slate-50'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleLote(l.id)}
                          className="h-4 w-4 rounded accent-emerald-600"
                        />
                        <div className="min-w-0 flex-1">
                          <p className={`text-sm font-semibold ${checked ? 'text-emerald-800' : 'text-slate-800'}`}>
                            Lote {l.numeroLote}
                          </p>
                          <p className="text-xs text-slate-500">{l.areaTotal} ha</p>
                        </div>
                        {checked && (
                          <span className="shrink-0 rounded-full bg-emerald-600 px-2 py-0.5 text-[10px] font-bold text-white">
                            ✓
                          </span>
                        )}
                      </label>
                    );
                  })}
                </div>
              )}

              {form.idLotes.length > 0 && (
                <p className="mt-1 text-[11px] font-medium text-emerald-700">
                  {form.idLotes.length} lote{form.idLotes.length > 1 ? 's' : ''} seleccionado{form.idLotes.length > 1 ? 's' : ''}
                </p>
              )}
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-600">Técnico Inspector Asignado</label>
              <div
                className={`flex items-center gap-2 w-full rounded-xl border px-3 py-2.5 text-sm ${
                  !form.idLugarProduccion
                    ? 'border-slate-200 bg-slate-50 text-slate-400'
                    : tecnicoNombre
                      ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                      : 'border-amber-200 bg-amber-50 text-amber-700'
                }`}
              >
                <User size={14} className="shrink-0 opacity-60" />
                <span>
                  {!form.idLugarProduccion
                    ? 'Selecciona primero un lugar de producción'
                    : tecnicoNombre
                      ? tecnicoNombre
                      : 'Sin técnico asignado a este lugar'}
                </span>
              </div>
              {form.idLugarProduccion && !tecnicoNombre && (
                <p className="mt-1 text-[11px] text-amber-600">
                  Este lugar no tiene un técnico asignado. Contacta al administrador.
                </p>
              )}
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-600">Fecha y Hora Tentativa *</label>
              <input
                type="datetime-local"
                value={form.fechaTentativa}
                onChange={(e) => setForm((f) => ({ ...f, fechaTentativa: e.target.value }))}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={handleClose}
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={!canGoStep2}
                onClick={() => setStep(2)}
                className="rounded-xl bg-emerald-600 px-5 py-2 text-sm font-semibold text-white disabled:opacity-50 hover:bg-emerald-700 active:scale-95"
              >
                Continuar →
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Resumen de la Solicitud</p>
              <div className="space-y-2">
                <SummaryRow
                  label="Lugar de Producción"
                  value={lugares.find((l) => l.id === form.idLugarProduccion)?.nombreLugarProduccion ?? '—'}
                />
                <SummaryRow
                  label={`Lote${form.idLotes.length > 1 ? 's' : ''} (${form.idLotes.length})`}
                  value={form.idLotes
                    .map((id) => {
                      const l = lotes.find((x) => x.id === id);
                      return l ? `Lote ${l.numeroLote}` : id;
                    })
                    .join(', ')}
                />
                <SummaryRow
                  label="Técnico Inspector"
                  value={tecnicoNombre ?? '—'}
                />
                <SummaryRow
                  label="Fecha Tentativa"
                  value={form.fechaTentativa ? formatDateTime(form.fechaTentativa) : '—'}
                />
              </div>
            </div>

            <div className="rounded-2xl border border-blue-100 bg-blue-50 p-3 text-xs text-blue-700">
              Al confirmar, la solicitud quedará en estado <strong>Solicitada</strong> y el técnico asignado podrá aceptarla o proponer una nueva fecha.
            </div>

            <div className="flex justify-between gap-2 pt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex items-center gap-1 rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                <ChevronLeft size={14} /> Atrás
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleSubmit}
                className="flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2 text-sm font-semibold text-white disabled:opacity-50 hover:bg-emerald-700 active:scale-95"
              >
                {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                Enviar Solicitud
              </button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}

// ─── Componentes auxiliares ───────────────────────────────────────────────────

function Layers({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 2 7 12 12 22 7 12 2" />
      <polyline points="2 17 12 22 22 17" />
      <polyline points="2 12 12 17 22 12" />
    </svg>
  );
}

function InfoCard({
  label,
  value,
  icon,
  highlight = false,
}: {
  label: string;
  value?: string | null;
  icon?: React.ReactNode;
  highlight?: boolean;
}) {
  return (
    <div className={`rounded-xl border p-3 ${highlight ? 'border-emerald-200 bg-emerald-50' : 'border-slate-200 bg-white'}`}>
      <div className={`mb-1 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide ${highlight ? 'text-emerald-600' : 'text-slate-400'}`}>
        {icon}
        {label}
      </div>
      <p className={`text-sm font-medium ${highlight ? 'text-emerald-800' : 'text-slate-800'}`}>{value ?? '—'}</p>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 text-sm">
      <span className="text-slate-500 shrink-0">{label}</span>
      <span className="font-medium text-slate-800 text-right">{value}</span>
    </div>
  );
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────

function KpiCard({
  label,
  value,
  color,
  icon,
}: {
  label: string;
  value: number;
  color: string;
  icon: React.ReactNode;
}) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
          <p className="mt-1 text-3xl font-bold text-slate-900">{value}</p>
        </div>
        <div className={`rounded-xl p-2 ${color}`}>{icon}</div>
      </div>
    </article>
  );
}

// ─── Página principal ─────────────────────────────────────────────────────────

const PAGE_SIZE = 8;

export default function InspectionHistoryPage({
  sessionUser,
  onGoHome,
  onGoUsers,
  onGoRoles,
  onGoAgricultural,
  onGoCatalog,
  onGoApprovalPlaces,
  onGoInspectionsAgenda,
  onLogout,
}: InspectionHistoryPageProps) {
  const rol = sessionUser?.rol ?? '';
  const userId = sessionUser?.id ?? '';
  const isProductor = rol === 'PRODUCTOR';
  const isAdminOrTecnico = rol === 'ADMIN' || rol === 'ASISTENTE_TECNICO';

  // ── Data ──────────────────────────────────────────────────────────────────
  const [solicitudes, setSolicitudes] = useState<SolicitudInspeccionDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Para el modal de solicitar (PRODUCTOR)
  const [lugares, setLugares] = useState<LugarProduccionDTO[]>([]);
  const [lotes, setLotes] = useState<LoteDTO[]>([]);

  // ── UI ────────────────────────────────────────────────────────────────────
  const [search, setSearch] = useState('');
  const [estadoFilter, setEstadoFilter] = useState<'Todos' | EstadoSolicitud>('Todos');
  const [dateFilter, setDateFilter] = useState('');
  const [page, setPage] = useState(1);

  const [selectedSolicitud, setSelectedSolicitud] = useState<SolicitudInspeccionDTO | null>(null);
  const [isSolicitarOpen, setIsSolicitarOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<ToastState>(null);

  // ── Fetch ─────────────────────────────────────────────────────────────────
  const fetchSolicitudes = useCallback(async () => {
    if (!userId || !rol) return;
    setLoading(true);
    setError(null);
    try {
      const res = await api.getSolicitudesInspeccion({ userId, rol });
      setSolicitudes(res.data ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar las solicitudes.');
    } finally {
      setLoading(false);
    }
  }, [userId, rol]);

  const fetchFormData = useCallback(async () => {
    if (!isProductor) return;
    try {
      const [lugaresRes, lotesRes] = await Promise.all([
        api.getLugaresProduccion(),
        api.getLotes(),
      ]);
      // Filtrar lugares del productor actual
      const misLugares = (lugaresRes.data ?? []).filter((l) => l.idUsuarioProductor === userId);
      setLugares(misLugares);
      setLotes(lotesRes.data ?? []);
    } catch {
      // No bloquear la página si falla la carga de datos del formulario
    }
  }, [isProductor, userId]);

  useEffect(() => {
    fetchSolicitudes();
  }, [fetchSolicitudes]);

  useEffect(() => {
    fetchFormData();
  }, [fetchFormData]);

  // ── Filtros ───────────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return solicitudes.filter((s) => {
      const lugar = s.lote?.predio?.lugarProduccion?.nombreLugarProduccion ?? '';
      const lote = s.lote?.numeroLote ?? '';
      const productor = s.lote?.predio?.lugarProduccion?.productor;
      const productorNombre = productor ? `${productor.nombre} ${productor.apellidos}` : '';
      const tecnico = s.asistenteTecnico ? `${s.asistenteTecnico.nombre} ${s.asistenteTecnico.apellidos}` : '';

      const bySearch = q
        ? lugar.toLowerCase().includes(q) ||
          lote.toLowerCase().includes(q) ||
          productorNombre.toLowerCase().includes(q) ||
          tecnico.toLowerCase().includes(q)
        : true;

      const byEstado = estadoFilter === 'Todos' ? true : s.estado === estadoFilter;
      const byDate = dateFilter ? s.fechaCreacion?.startsWith(dateFilter) : true;

      return bySearch && byEstado && byDate;
    });
  }, [solicitudes, search, estadoFilter, dateFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = useMemo(
    () => filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [filtered, page],
  );

  // ── KPIs ──────────────────────────────────────────────────────────────────
  const kpis = useMemo(() => ({
    total: solicitudes.length,
    solicitadas: solicitudes.filter((s) => s.estado === 'SOLICITADA').length,
    programadas: solicitudes.filter((s) => s.estado === 'PROGRAMADA').length,
    realizadas: solicitudes.filter((s) => s.estado === 'REALIZADA').length,
    canceladas: solicitudes.filter((s) => s.estado === 'CANCELADA').length,
  }), [solicitudes]);

  // ── Acciones ──────────────────────────────────────────────────────────────
  const showToast = (type: 'success' | 'error' | 'info', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const handleAccept = async (id: string, fecha: string) => {
    setIsUpdating(true);
    try {
      await api.updateEstadoSolicitud(id, { accion: 'ACEPTAR', fechaProgramada: fecha });
      showToast('success', 'Solicitud aceptada y programada correctamente.');
      setSelectedSolicitud(null);
      await fetchSolicitudes();
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Error al aceptar la solicitud.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleReject = async (id: string, obs: string) => {
    setIsUpdating(true);
    try {
      await api.updateEstadoSolicitud(id, { accion: 'RECHAZAR', observaciones: obs });
      showToast('info', 'Solicitud rechazada. El productor será notificado.');
      setSelectedSolicitud(null);
      await fetchSolicitudes();
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Error al rechazar la solicitud.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCreateSolicitud = async (solicitudes: CreateSolicitudDTO[]) => {
    setIsSubmitting(true);
    try {
      await Promise.all(solicitudes.map((s) => api.createSolicitud(s)));
      const n = solicitudes.length;
      showToast(
        'success',
        n === 1
          ? 'Solicitud de inspección creada exitosamente.'
          : `${n} solicitudes de inspección creadas exitosamente.`,
      );
      await fetchSolicitudes();
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Error al crear la solicitud.');
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNavigate = (view: DashboardViewKey) => {
    if (view === 'home') onGoHome?.();
    if (view === 'users') onGoUsers?.();
    if (view === 'roles') onGoRoles?.();
    if (view === 'agricultural') onGoAgricultural?.();
    if (view === 'catalog') onGoCatalog?.();
    if (view === 'approval-places') onGoApprovalPlaces?.();
    if (view === 'inspections-agenda') onGoInspectionsAgenda?.();
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <DashboardLayout
      title="Historial de Inspecciones"
      subtitle={
        isProductor
          ? 'Consulta y gestiona tus solicitudes de inspección'
          : 'Gestión y seguimiento de solicitudes de inspección fitosanitaria'
      }
      sessionUser={sessionUser}
      activeView="inspections-history"
      onNavigate={handleNavigate}
      onLogout={onLogout}
    >
      <section className="space-y-6">
        {/* KPIs */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <KpiCard
            label="Total Solicitudes"
            value={kpis.total}
            color="bg-slate-100 text-slate-600"
            icon={<ClipboardList size={22} />}
          />
          <KpiCard
            label="Solicitadas"
            value={kpis.solicitadas}
            color="bg-blue-100 text-blue-600"
            icon={<Clock3 size={22} />}
          />
          <KpiCard
            label="Programadas"
            value={kpis.programadas}
            color="bg-amber-100 text-amber-600"
            icon={<CalendarDays size={22} />}
          />
          <KpiCard
            label="Realizadas"
            value={kpis.realizadas}
            color="bg-emerald-100 text-emerald-600"
            icon={<CheckCircle2 size={22} />}
          />
        </div>

        {/* Barra de herramientas */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {/* Búsqueda */}
            <div className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar lugar, lote, productor..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="h-9 w-64 rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-800 placeholder-slate-400 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
              />
            </div>

            {/* Filtro estado */}
            <div className="relative">
              <Filter size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <select
                value={estadoFilter}
                onChange={(e) => { setEstadoFilter(e.target.value as typeof estadoFilter); setPage(1); }}
                className="h-9 rounded-xl border border-slate-200 bg-white pl-8 pr-3 text-sm text-slate-700 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
              >
                <option value="Todos">Todos los estados</option>
                <option value="SOLICITADA">Solicitada</option>
                <option value="PROGRAMADA">Programada</option>
                <option value="REALIZADA">Realizada</option>
                <option value="CANCELADA">Cancelada</option>
                <option value="NO_PROGRAMADA">No Programada</option>
              </select>
            </div>

            {/* Filtro fecha */}
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => { setDateFilter(e.target.value); setPage(1); }}
              className="h-9 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
            />

            {dateFilter && (
              <button
                type="button"
                onClick={() => setDateFilter('')}
                className="flex h-9 items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-500 hover:bg-slate-50"
              >
                <X size={12} /> Limpiar fecha
              </button>
            )}
          </div>

          {/* Botón solicitar (solo PRODUCTOR) */}
          {isProductor && (
            <button
              type="button"
              onClick={() => setIsSolicitarOpen(true)}
              className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 active:scale-95"
            >
              <Plus size={16} />
              Solicitar Inspección
            </button>
          )}
        </div>

        {/* Tabla */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Fecha Solicitud
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Lugar Producción
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Lote
                  </th>
                  {isAdminOrTecnico && (
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Productor
                    </th>
                  )}
                  {isProductor && (
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Técnico Asignado
                    </th>
                  )}
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Fecha/Hora Inspección
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Estado
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Detalle
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <TableSkeleton cols={isProductor ? 7 : 7} />
                ) : error ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-16 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <AlertCircle size={40} className="text-rose-400" />
                        <p className="font-semibold text-slate-700">Error al cargar datos</p>
                        <p className="text-sm text-slate-500">{error}</p>
                        <button
                          type="button"
                          onClick={fetchSolicitudes}
                          className="mt-1 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
                        >
                          Reintentar
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : paged.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-16 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <ClipboardList size={40} className="text-slate-300" />
                        <p className="font-semibold text-slate-600">
                          {solicitudes.length === 0
                            ? 'No hay solicitudes de inspección registradas'
                            : 'No se encontraron resultados con los filtros aplicados'}
                        </p>
                        <p className="text-sm text-slate-400">
                          {isProductor
                            ? 'Crea tu primera solicitud usando el botón "Solicitar Inspección"'
                            : 'Ajusta los filtros o espera nuevas solicitudes'}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paged.map((s) => {
                    const lugar = s.lote?.predio?.lugarProduccion;
                    const productor = lugar?.productor;
                    const tecnico = s.asistenteTecnico;
                    return (
                      <tr
                        key={s.id}
                        className="group transition-colors hover:bg-slate-50"
                      >
                        <td className="px-4 py-3 text-slate-600">
                          {formatDate(s.fechaCreacion)}
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-medium text-slate-800">
                            {lugar?.nombreLugarProduccion ?? '—'}
                          </span>
                          {lugar?.numeroRegistroICA && (
                            <p className="text-[11px] text-slate-400">{lugar.numeroRegistroICA}</p>
                          )}
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          {s.lote?.numeroLote ? `Lote ${s.lote.numeroLote}` : '—'}
                        </td>
                        {isAdminOrTecnico && (
                          <td className="px-4 py-3 text-slate-700">
                            {productor ? `${productor.nombre} ${productor.apellidos}` : '—'}
                          </td>
                        )}
                        {isProductor && (
                          <td className="px-4 py-3 text-slate-700">
                            {tecnico ? `${tecnico.nombre} ${tecnico.apellidos}` : '—'}
                          </td>
                        )}
                        <td className="px-4 py-3 text-slate-600">
                          {s.fechaProgramadaTecnico
                            ? formatDateTime(s.fechaProgramadaTecnico)
                            : s.fechaTentativaProductor
                              ? <span className="text-slate-400 italic">{formatDateTime(s.fechaTentativaProductor)} (tentativa)</span>
                              : '—'}
                        </td>
                        <td className="px-4 py-3">
                          <EstadoBadge estado={s.estado} />
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button
                            type="button"
                            onClick={() => setSelectedSolicitud(s)}
                            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700 active:scale-95"
                          >
                            Ver detalle
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Paginación */}
          {!loading && !error && filtered.length > PAGE_SIZE && (
            <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3">
              <p className="text-xs text-slate-500">
                Mostrando {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} de {filtered.length} registros
              </p>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 bg-white text-slate-600 disabled:opacity-40 hover:bg-slate-50"
                >
                  <ChevronLeft size={15} />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                  .reduce<(number | '...')[]>((acc, p, idx, arr) => {
                    if (idx > 0 && typeof arr[idx - 1] === 'number' && (p as number) - (arr[idx - 1] as number) > 1) {
                      acc.push('...');
                    }
                    acc.push(p);
                    return acc;
                  }, [])
                  .map((p, idx) =>
                    p === '...' ? (
                      <span key={`ellipsis-${idx}`} className="px-1 text-slate-400">…</span>
                    ) : (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setPage(p as number)}
                        className={`h-8 w-8 rounded-lg border text-xs font-semibold transition ${
                          page === p
                            ? 'border-emerald-500 bg-emerald-600 text-white'
                            : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {p}
                      </button>
                    ),
                  )}
                <button
                  type="button"
                  disabled={page === totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 bg-white text-slate-600 disabled:opacity-40 hover:bg-slate-50"
                >
                  <ChevronRight size={15} />
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Modal detalle PRODUCTOR */}
      {selectedSolicitud && isProductor && (
        <ModalDetalleProductor
          solicitud={selectedSolicitud}
          onClose={() => setSelectedSolicitud(null)}
        />
      )}

      {/* Modal detalle ADMIN / ASISTENTE */}
      {selectedSolicitud && isAdminOrTecnico && (
        <ModalDetalleAdmin
          solicitud={selectedSolicitud}
          onClose={() => setSelectedSolicitud(null)}
          onAccept={handleAccept}
          onReject={handleReject}
          isUpdating={isUpdating}
        />
      )}

      {/* Modal solicitar inspección */}
      <ModalSolicitarInspeccion
        open={isSolicitarOpen}
        onClose={() => setIsSolicitarOpen(false)}
        onSubmit={handleCreateSolicitud}
        lugares={lugares}
        lotes={lotes}
        isSubmitting={isSubmitting}
      />

      {/* Toast */}
      <Toast toast={toast} onClose={() => setToast(null)} />
    </DashboardLayout>
  );
}
