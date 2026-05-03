import { useMemo, useState } from 'react';
import {
  ArrowLeft,
  BarChart3,
  Bell,
  ChevronDown,
  Eye,
  Folder,
  Home,
  Layers,
  Pencil,
  Plus,
  Search,
  ShieldCheck,
  Users,
} from 'lucide-react';
import SidebarItem from '../components/ui/SidebarItem';
import type { ProductionSite } from './AgriculturalManagementPage';

type LotDetail = {
  id: number;
  code: string;
  especie: string;
  variedad: string;
  areaHa: number;
  fechaSiembra: string;
};

type ProductionLotsPageProps = {
  site: ProductionSite | null;
  onGoResumen?: () => void;
  onGoHome?: () => void;
  onGoUsers?: () => void;
  onGoRoles?: () => void;
};

const lotesMock: LotDetail[] = [
  {
    id: 1,
    code: 'LOT-001',
    especie: 'Café Arábica',
    variedad: 'Castillo',
    areaHa: 15.5,
    fechaSiembra: '2024-02-01',
  },
  {
    id: 2,
    code: 'LOT-002',
    especie: 'Aguacate',
    variedad: 'Hass',
    areaHa: 12.4,
    fechaSiembra: '2024-03-15',
  },
];

function ProductionLotsPage({ site, onGoResumen, onGoHome, onGoUsers, onGoRoles }: ProductionLotsPageProps) {
  const [isUsersOpen, setIsUsersOpen] = useState(false);
  const [search, setSearch] = useState('');

  const filteredLotes = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return lotesMock;
    return lotesMock.filter((lote) => {
      return (
        lote.code.toLowerCase().includes(q) ||
        lote.especie.toLowerCase().includes(q) ||
        lote.variedad.toLowerCase().includes(q)
      );
    });
  }, [search]);

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="grid min-h-screen grid-cols-1 xl:grid-cols-[280px_1fr]">
        <aside className="relative flex flex-col overflow-hidden bg-gradient-to-b from-emerald-950 via-emerald-900 to-emerald-950 p-4 text-white">
          <div className="mb-5 flex items-center gap-3 border-b border-white/10 pb-4">
            <div className="h-12 w-12 rounded-xl bg-white/95 shadow-md" />
            <div>
              <p className="text-2xl font-bold leading-none">FitoGestor</p>
              <p className="mt-1 text-sm text-emerald-100/90">Sistema Fitosanitario</p>
            </div>
          </div>

          <nav className="flex flex-1 flex-col gap-1.5">
            <button type="button" onClick={onGoHome} className="w-full">
              <SidebarItem label="Inicio" icon={<Home size={20} />} />
            </button>

            <button
              type="button"
              onClick={() => setIsUsersOpen((prev) => !prev)}
              className="group relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-emerald-50/90 transition-all duration-300 hover:bg-white/10 hover:text-white"
            >
              <Users size={20} className="text-emerald-200" />
              <span className="flex-1 text-[1.02rem] font-semibold tracking-tight">Gestión de Usuarios</span>
              <ChevronDown
                size={16}
                className={`transition-transform duration-300 ${isUsersOpen ? 'rotate-180' : ''}`}
              />
            </button>

            {isUsersOpen ? (
              <div className="ml-3 mt-1 space-y-1">
                <button
                  type="button"
                  onClick={onGoUsers}
                  className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-base font-medium text-emerald-100 transition hover:bg-white/10 hover:text-white"
                >
                  <Users size={18} />
                  Usuarios
                </button>
                <button
                  type="button"
                  onClick={onGoRoles}
                  className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-base font-medium text-emerald-100 transition hover:bg-white/10 hover:text-white"
                >
                  <ShieldCheck size={18} />
                  Roles
                </button>
              </div>
            ) : null}

            <SidebarItem label="Gestión Agrícola" active icon={<Layers size={20} />} />
            <SidebarItem label="Mis Solicitudes" icon={<Folder size={20} />} />
            <SidebarItem label="Inspecciones" hasChevron icon={<ShieldCheck size={20} />} />
            <SidebarItem label="Reportes" icon={<BarChart3 size={20} />} />
          </nav>

          <button
            type="button"
            className="mt-4 flex items-center gap-2 rounded-xl border border-red-300/30 bg-red-500/10 px-3 py-3 text-base font-bold text-red-300 transition hover:bg-red-500/20"
          >
            <span>↪</span>
            Cerrar Sesion
          </button>
        </aside>

        <div className="flex flex-col">
          <header className="sticky top-0 z-10 flex min-h-[84px] items-center justify-between border-b border-emerald-800/40 bg-emerald-900 px-5 py-3 text-white sm:px-8">
            <div>
              <h1 className="text-3xl font-bold leading-none">Gestión Agrícola</h1>
              <p className="mt-1 text-sm text-emerald-100">Sistema de Inspección Fitosanitaria</p>
            </div>
            <div className="flex items-center gap-3">
              <button className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-900/40 text-emerald-300 transition-all duration-300 hover:bg-emerald-700/80 hover:text-white">
                <Bell size={18} />
              </button>
              <div className="text-right">
                <p className="text-base font-bold leading-none">Pepito Perez</p>
                <p className="text-xs text-emerald-200">Administrador</p>
              </div>
              <div className="grid h-10 w-10 place-items-center rounded-full bg-emerald-700 text-sm font-bold">PP</div>
            </div>
          </header>

          <section className="flex-1 p-4 sm:p-6">
            <div className="mb-3 flex items-center gap-2 text-sm text-slate-500">
              <button
                type="button"
                onClick={onGoResumen}
                className="inline-flex items-center gap-1 hover:text-slate-700"
              >
                <ArrowLeft size={14} />
                Lugares de Producción
              </button>
              <span>/</span>
              <span className="font-semibold text-slate-700">{site?.name ?? 'Zona Productiva Norte'}</span>
            </div>

            <h2 className="text-[3rem] font-extrabold leading-none tracking-tight text-slate-900">
              {site?.name ?? 'Zona Productiva Norte'}
            </h2>

            <div className="mt-5 inline-flex rounded-2xl border border-slate-200 bg-white p-1">
              <button
                type="button"
                onClick={onGoResumen}
                className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100"
              >
                Resumen
              </button>
              <button type="button" className="rounded-xl bg-emerald-900 px-4 py-2 text-sm font-semibold text-white">
                Lotes ({site?.activeLots ?? 2})
              </button>
            </div>

            <div className="mt-6 mb-4 flex flex-wrap items-center justify-between gap-3">
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
                      <th className="px-4 py-3">Estado</th>
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
                        <td className="px-4 py-2.5">
                          <span className="inline-flex h-5 min-w-[46px] rounded-full bg-emerald-500/95" />
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex justify-end gap-2 text-slate-500">
                            <button
                              type="button"
                              className="rounded-md p-1.5 transition hover:bg-slate-100 hover:text-emerald-700"
                            >
                              <Eye size={15} />
                            </button>
                            <button
                              type="button"
                              className="rounded-md p-1.5 transition hover:bg-slate-100 hover:text-emerald-700"
                            >
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
        </div>
      </div>
    </main>
  );
}

export default ProductionLotsPage;
