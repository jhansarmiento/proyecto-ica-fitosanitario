import { useMemo, useState } from 'react';
import { ArrowLeft, Eye, Pencil, Plus, Search } from 'lucide-react';
import NewLotModal from '../components/ui/NewLotModal';
import EditLotModal, { type EditableLot } from '../components/ui/EditLotModal';
import DashboardLayout from '../components/layout/DashboardLayout';
import type { ProductionSite } from './AgriculturalManagementPage';
import type { SessionUser } from '../App';

type LotDetail = EditableLot;

type ProductionLotsPageProps = {
  sessionUser?: SessionUser;
  site: ProductionSite | null;
  onGoResumen?: () => void;
  onGoHome?: () => void;
  onGoUsers?: () => void;
  onGoRoles?: () => void;
  onGoApprovalPlaces?: () => void;
  onLogout?: () => void;
};

const lotesMock: LotDetail[] = [
  { id: 1, code: 'LOT-001', especie: 'Café Arábica', variedad: 'Castillo', areaHa: 15.5, fechaSiembra: '2024-02-01' },
  { id: 2, code: 'LOT-002', especie: 'Aguacate', variedad: 'Hass', areaHa: 12.4, fechaSiembra: '2024-03-15' },
];

function ProductionLotsPage({ sessionUser, site, onGoResumen, onGoHome, onGoUsers, onGoRoles, onGoApprovalPlaces, onLogout }: ProductionLotsPageProps) {
  const [isNewLotOpen, setIsNewLotOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [lotes, setLotes] = useState<LotDetail[]>(lotesMock);
  const [isEditLotOpen, setIsEditLotOpen] = useState(false);
  const [selectedLot, setSelectedLot] = useState<LotDetail | null>(null);

  const filteredLotes = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return lotes;
    return lotes.filter((lote) => (
      lote.code.toLowerCase().includes(q) ||
      lote.especie.toLowerCase().includes(q) ||
      lote.variedad.toLowerCase().includes(q)
    ));
  }, [search, lotes]);

  const handleCreateLot = (payload: {
    numero: string;
    areaHa: number;
    fechaSiembra: string;
    fechaCosecha?: string;
    especie: string;
    variedad: string;
  }) => {
    const newLot: LotDetail = {
      id: Date.now(),
      code: payload.numero,
      especie: payload.especie,
      variedad: payload.variedad,
      areaHa: payload.areaHa,
      fechaSiembra: payload.fechaSiembra,
      fechaCosecha: payload.fechaCosecha,
    };
    setLotes((prev) => [newLot, ...prev]);
  };

  const handleEditClick = (lot: LotDetail) => {
    setSelectedLot(lot);
    setIsEditLotOpen(true);
  };

  const handleSaveLot = (payload: EditableLot) => {
    setLotes((prev) => prev.map((item) => (item.id === payload.id ? payload : item)));
  };

  return (
    <DashboardLayout
      title="Gestión Agrícola"
      sessionUser={sessionUser}
      activeView="agricultural"
      onNavigate={(view) => {
        if (view === 'home') onGoHome?.();
        if (view === 'users') onGoUsers?.();
        if (view === 'roles') onGoRoles?.();
        if (view === 'approval-places') onGoApprovalPlaces?.();
        if (view === 'agricultural') onGoResumen?.();
      }}
      onLogout={onLogout}
    >
      <section className="flex-1 p-1 sm:p-2">
        <div className="mb-3 flex items-center gap-2 text-sm text-slate-500">
          <button type="button" onClick={onGoResumen} className="inline-flex items-center gap-1 hover:text-slate-700">
            <ArrowLeft size={14} />
            Lugares de Producción
          </button>
          <span>/</span>
          <span className="font-semibold text-slate-700">{site?.name ?? 'Zona Productiva Norte'}</span>
        </div>

        <h2 className="text-[3rem] font-extrabold leading-none tracking-tight text-slate-900">{site?.name ?? 'Zona Productiva Norte'}</h2>

        <div className="mt-5 inline-flex rounded-2xl border border-slate-200 bg-white p-1">
          <button type="button" onClick={onGoResumen} className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100">
            Resumen
          </button>
          <button type="button" className="rounded-xl bg-emerald-900 px-4 py-2 text-sm font-semibold text-white">
            Lotes ({site?.activeLots ?? 2})
          </button>
        </div>

        <div className="mb-4 mt-6 flex flex-wrap items-center justify-between gap-3">
          <div className="flex w-full max-w-md items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 shadow-sm transition focus-within:border-emerald-300 focus-within:ring-4 focus-within:ring-emerald-50">
            <Search size={18} className="text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar lotes..."
              className="w-full bg-transparent text-sm text-slate-700 placeholder:text-slate-400 outline-none"
            />
          </div>

          <button
            type="button"
            onClick={() => setIsNewLotOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-800"
          >
            <Plus size={16} />
            Crear Lote
          </button>
        </div>

        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-slate-50">
                <tr className="text-left text-xs font-bold uppercase tracking-wide text-slate-600">
                  <th className="px-4 py-3">Número</th>
                  <th className="px-4 py-3">Especie</th>
                  <th className="px-4 py-3">Variedad</th>
                  <th className="px-4 py-3">Área (ha)</th>
                  <th className="px-4 py-3">Fecha Siembra</th>
                  <th className="px-4 py-3">Fecha Cosecha</th>
                  <th className="px-4 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {filteredLotes.map((lote) => (
                  <tr key={lote.id}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-purple-50 text-purple-600">
                          <Plus size={12} />
                        </span>
                        <span className="text-sm font-bold text-slate-800">{lote.code}</span>
                      </div>
                    </td>
                    <td className="px-4 py-2.5 text-sm text-slate-700">{lote.especie}</td>
                    <td className="px-4 py-2.5 text-sm text-slate-700">{lote.variedad}</td>
                    <td className="px-4 py-2.5 text-sm font-semibold text-slate-800">{lote.areaHa}</td>
                    <td className="px-4 py-2.5 text-sm text-slate-700">{lote.fechaSiembra}</td>
                    <td className="px-4 py-2.5 text-sm text-slate-700">{lote.fechaCosecha ?? '—'}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2 text-slate-500">
                        <button type="button" className="rounded-md p-1.5 transition hover:bg-slate-100 hover:text-emerald-700">
                          <Eye size={15} />
                        </button>
                        <button type="button" onClick={() => handleEditClick(lote)} className="rounded-md p-1.5 transition hover:bg-slate-100 hover:text-emerald-700">
                          <Pencil size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <NewLotModal isOpen={isNewLotOpen} onClose={() => setIsNewLotOpen(false)} onCreate={handleCreateLot} />
      <EditLotModal isOpen={isEditLotOpen} lot={selectedLot} onClose={() => setIsEditLotOpen(false)} onSave={handleSaveLot} />
    </DashboardLayout>
  );
}

export default ProductionLotsPage;
