import type { RequestStatus } from '../../types/dashboard.types';

type StatusBadgeProps = {
  status: RequestStatus | 'Pendiente' | 'Aprobado' | 'Rechazado';
};

const statusStyles: Record<string, string> = {
  Pendiente: 'bg-amber-100 text-amber-700 border-amber-200',
  'En revisión': 'bg-blue-100 text-blue-700 border-blue-200',
  Aprobado: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  Rechazado: 'bg-rose-100 text-rose-700 border-rose-200',
};

function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${statusStyles[status] || 'bg-slate-100 text-slate-700 border-slate-200'}`}>
      {status}
    </span>
  );
}

export default StatusBadge;
