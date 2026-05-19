import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, FileText } from 'lucide-react';
import DashboardLayout, { type DashboardViewKey } from '../components/layout/DashboardLayout';
import type { SessionUser } from '../App';

type InspectionResult = 'Aprobado' | 'Con Hallazgos' | 'Rechazado';

type InspectionHistoryItem = {
  idInspeccion: string;
  fechaEjecucion: string;
  predio: string;
  cultivo: string;
  resultado: InspectionResult;
};

type InspectionHistoryPageProps = {
  sessionUser?: SessionUser;
  onGoHome?: () => void;
  onGoUsers?: () => void;
  onGoRoles?: () => void;
  onGoAgricultural?: () => void;
  onGoApprovalPlaces?: () => void;
  onGoInspectionsAgenda?: () => void;
  onLogout?: () => void;
};

const historySeed: InspectionHistoryItem[] = [
  { idInspeccion: 'INS-2026-0012', fechaEjecucion: '2026-05-16 09:20', predio: 'Finca Los Naranjos', cultivo: 'Cítricos', resultado: 'Aprobado' },
  { idInspeccion: 'INS-2026-0011', fechaEjecucion: '2026-05-15 14:10', predio: 'Predio Palmas del Sol', cultivo: 'Palma', resultado: 'Con Hallazgos' },
  { idInspeccion: 'INS-2026-0010', fechaEjecucion: '2026-05-14 08:55', predio: 'Hacienda El Cedro', cultivo: 'Cacao', resultado: 'Rechazado' },
  { idInspeccion: 'INS-2026-0009', fechaEjecucion: '2026-05-13 11:40', predio: 'Finca Bella Vista', cultivo: 'Banano', resultado: 'Aprobado' },
  { idInspeccion: 'INS-2026-0008', fechaEjecucion: '2026-05-12 16:00', predio: 'Parcela San Jorge', cultivo: 'Arroz', resultado: 'Con Hallazgos' },
  { idInspeccion: 'INS-2026-0007', fechaEjecucion: '2026-05-11 10:30', predio: 'Predio El Molino', cultivo: 'Café', resultado: 'Aprobado' },
];

const resultClasses: Record<InspectionResult, string> = {
  Aprobado: 'bg-emerald-100 text-emerald-700',
  'Con Hallazgos': 'bg-amber-100 text-amber-700',
  Rechazado: 'bg-rose-100 text-rose-700',
};

export default function InspectionHistoryPage({
  sessionUser,
  onGoHome,
  onGoUsers,
  onGoRoles,
  onGoAgricultural,
  onGoApprovalPlaces,
  onGoInspectionsAgenda,
  onLogout,
}: InspectionHistoryPageProps) {
  const [page, setPage] = useState(1);
  const pageSize = 6;
  const totalPages = Math.max(1, Math.ceil(historySeed.length / pageSize));

  const pagedRows = useMemo(() => {
    return historySeed.slice((page - 1) * pageSize, page * pageSize);
  }, [page]);

  const handleNavigate = (view: DashboardViewKey) => {
    if (view === 'home') onGoHome?.();
    if (view === 'users') onGoUsers?.();
    if (view === 'roles') onGoRoles?.();
    if (view === 'agricultural') onGoAgricultural?.();
    if (view === 'approval-places') onGoApprovalPlaces?.();
    if (view === 'inspections-agenda') onGoInspectionsAgenda?.();
  };

  return (
    <DashboardLayout
      title="Historial de Inspecciones"
      subtitle="Consulta inspecciones ejecutadas y sus resultados"
      sessionUser={sessionUser}
      activeView="inspections-history"
      onNavigate={handleNavigate}
      onLogout={onLogout}
      breadcrumbs={['Inicio', 'Inspecciones', 'Historial de Inspecciones']}
    >
      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-5 py-4">
          <h2 className="text-lg font-bold text-slate-900">Histórico de inspecciones ejecutadas</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-left text-slate-600">
              <tr>
                <th className="px-4 py-3 font-semibold">ID Inspección</th>
                <th className="px-4 py-3 font-semibold">Fecha de Ejecución</th>
                <th className="px-4 py-3 font-semibold">Finca / Predio</th>
                <th className="px-4 py-3 font-semibold">Cultivo</th>
                <th className="px-4 py-3 font-semibold">Resultado</th>
                <th className="px-4 py-3 font-semibold text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {pagedRows.map((row) => (
                <tr key={row.idInspeccion} className="border-t border-slate-100">
                  <td className="px-4 py-3 font-semibold text-slate-800">{row.idInspeccion}</td>
                  <td className="px-4 py-3 text-slate-600">{row.fechaEjecucion}</td>
                  <td className="px-4 py-3 text-slate-700">{row.predio}</td>
                  <td className="px-4 py-3 text-slate-700">{row.cultivo}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${resultClasses[row.resultado]}`}>
                      {row.resultado}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end">
                      <button
                        type="button"
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                      >
                        <FileText size={14} />
                        Ver reporte
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3">
          <p className="text-xs text-slate-500">
            Mostrando {(page - 1) * pageSize + 1} - {Math.min(page * pageSize, historySeed.length)} de {historySeed.length}
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              className="rounded-lg border border-slate-300 p-1.5 text-slate-600 disabled:opacity-50"
              disabled={page === 1}
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-sm font-semibold text-slate-700">
              {page}/{totalPages}
            </span>
            <button
              type="button"
              onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
              className="rounded-lg border border-slate-300 p-1.5 text-slate-600 disabled:opacity-50"
              disabled={page === totalPages}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </section>
    </DashboardLayout>
  );
}
