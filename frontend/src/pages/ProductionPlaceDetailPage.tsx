import { useMemo, useState } from 'react';
import {
  ArrowLeft,
  BarChart3,
  Bell,
  ChevronDown,
  Folder,
  Home,
  Layers,
  MapPin,
  ShieldCheck,
  Users,
  Warehouse,
} from 'lucide-react';
import SidebarItem from '../components/ui/SidebarItem';
import type { ProductionSite } from './AgriculturalManagementPage';

type PredioDetail = {
  id: number;
  nombre: string;
  matricula: string;
  vereda: string;
  municipio: string;
  areaHa: number;
};

type ProductionPlaceDetailPageProps = {
  site: ProductionSite | null;
  onBackToAgricultural?: () => void;
  onGoLots?: () => void;
  onGoHome?: () => void;
  onGoUsers?: () => void;
  onGoRoles?: () => void;
};

const prediosAsociadosMock: PredioDetail[] = [
  {
    id: 1,
    nombre: 'Predio La Esperanza',
    matricula: '001-2023',
    vereda: 'La Cabaña',
    municipio: 'Chinchiná',
    areaHa: 15.5,
  },
  {
    id: 2,
    nombre: 'Predio Santa Elena',
    matricula: '004-2023',
    vereda: 'La Aurora',
    municipio: 'Chinchiná',
    areaHa: 12.4,
  },
];

function ProductionPlaceDetailPage({
  site,
  onBackToAgricultural,
  onGoLots,
  onGoHome,
  onGoUsers,
  onGoRoles,
}: ProductionPlaceDetailPageProps) {
  const [isUsersOpen, setIsUsersOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'resumen' | 'lotes'>('resumen');

  const totalPredios = prediosAsociadosMock.length;
  const totalArea = useMemo(
    () => prediosAsociadosMock.reduce((acc, p) => acc + p.areaHa, 0).toFixed(1),
    [],
  );

  return (
    <main className="min-h-screen bg-slate-100 text-slate-900">
      <div className="grid min-h-screen grid-cols-1 xl:grid-cols-[280px_1fr]">
        <aside className="relative flex flex-col overflow-hidden bg-gradient-to-b from-emerald-950 via-emerald-900 to-emerald-950 p-4 text-white">
          <div className="pointer-events-none absolute -right-16 top-10 h-48 w-48 rounded-full bg-emerald-400/10 blur-3xl" />
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
          <header className="sticky top-0 z-10 flex min-h-[84px] flex-wrap items-center justify-between gap-3 border-b border-emerald-800/40 bg-emerald-900/95 px-5 py-3 text-white backdrop-blur sm:px-8">
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
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="mb-2 flex items-center gap-2 text-sm text-slate-500">
                  <button
                    type="button"
                    onClick={onBackToAgricultural}
                    className="inline-flex items-center gap-1 rounded-lg px-2 py-1 transition hover:bg-slate-100"
                  >
                    <ArrowLeft size={14} />
                    Lugares de Producción
                  </button>
                  <span>/</span>
                  <span className="font-semibold text-slate-700">{site?.name ?? 'Detalle'}</span>
                </div>
                <h2 className="text-[3rem] font-extrabold leading-none tracking-tight text-slate-900">
                  {site?.name ?? 'Zona Productiva'}
                </h2>
              </div>

              <button
                type="button"
                className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Editar
              </button>
            </div>

            <div className="mb-5 inline-flex rounded-2xl border border-slate-200 bg-white p-1">
              <button
                type="button"
                onClick={() => setActiveTab('resumen')}
                className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                  activeTab === 'resumen'
                    ? 'bg-emerald-900 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Resumen
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('lotes');
                  onGoLots?.();
                }}
                className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                  activeTab === 'lotes'
                    ? 'bg-emerald-900 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Lotes ({site?.activeLots ?? 0})
              </button>
            </div>

            <div className="grid gap-5 xl:grid-cols-[1fr_420px]">
              <div className="space-y-5">
                <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <h3 className="mb-4 text-2xl font-bold text-slate-900">Información General</h3>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <p className="text-xs uppercase tracking-wide text-slate-500">Código</p>
                      <p className="mt-1 text-base font-semibold text-slate-800">LP-001</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wide text-slate-500">Estado</p>
                      <span className="mt-1 inline-flex rounded-full bg-emerald-100 px-3 py-1 text-sm font-semibold text-emerald-700">
                        {site?.status ?? 'Activo'}
                      </span>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wide text-slate-500">Capacidad</p>
                      <p className="mt-1 text-base font-semibold text-slate-800">1OOO Kg</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wide text-slate-500">Fecha de creación</p>
                      <p className="mt-1 text-base font-semibold text-slate-800">2024-01-15</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wide text-slate-500">Ubicación</p>
                      <p className="mt-1 text-base font-semibold text-slate-800">
                        {site ? `${site.municipality}, ${site.department}` : 'Chinchiná, Caldas'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wide text-slate-500">Área total</p>
                      <p className="mt-1 text-base font-semibold text-slate-800">{site?.area ?? '27.9 ha'}</p>
                    </div>
                  </div>
                </article>

                <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <h3 className="mb-4 text-2xl font-bold text-slate-900">Predios Asociados</h3>
                  <div className="space-y-3">
                    {prediosAsociadosMock.map((predio) => (
                      <div
                        key={predio.id}
                        className="rounded-xl border border-slate-200 bg-slate-50 p-4 transition hover:border-emerald-200 hover:bg-emerald-50/30"
                      >
                        <div className="mb-2 flex items-start justify-between gap-3">
                          <div className="flex items-start gap-2">
                            <div className="mt-1 rounded-lg bg-blue-50 p-1.5 text-blue-600">
                              <Warehouse size={16} />
                            </div>
                            <div>
                              <p className="text-base font-bold text-slate-800">{predio.nombre}</p>
                              <p className="text-xs text-slate-500">Matrícula: {predio.matricula}</p>
                            </div>
                          </div>
                          <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                            Activo
                          </span>
                        </div>

                        <div className="grid gap-2 text-sm text-slate-700 sm:grid-cols-3">
                          <p>
                            <span className="text-slate-500">Vereda:</span> {predio.vereda}
                          </p>
                          <p>
                            <span className="text-slate-500">Municipio:</span> {predio.municipio}
                          </p>
                          <p>
                            <span className="text-slate-500">Área:</span>{' '}
                            <span className="font-semibold">{predio.areaHa} ha</span>
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </article>
              </div>

              <aside className="space-y-5">
                <div className="rounded-2xl bg-gradient-to-r from-emerald-700 to-emerald-600 p-5 text-white shadow-md">
                  <p className="text-sm text-emerald-100">Total Lotes</p>
                  <p className="mt-1 text-4xl font-extrabold">{site?.activeLots ?? 2}</p>
                  <p className="mt-2 text-xs text-emerald-100/90">Última actualización: hace 5 minutos</p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <h4 className="mb-4 text-4xl font-bold text-slate-900">Resumen</h4>
                  <div className="space-y-3 text-lg">
                    <div className="flex items-center justify-between">
                      <p className="text-slate-600">Predios</p>
                      <p className="font-bold text-slate-900">{totalPredios}</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-slate-600">Lotes Activos</p>
                      <p className="font-bold text-slate-900">{site?.activeLots ?? 2}</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-slate-600">Especies</p>
                      <p className="font-bold text-slate-900">{site?.authorizedSpecies ?? 0}</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-slate-600">Área Total</p>
                      <p className="font-bold text-slate-900">{totalArea} ha</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-slate-600">Ubicación</p>
                      <p className="flex items-center gap-1 font-bold text-slate-900">
                        <MapPin size={14} />
                        {site?.municipality ?? 'Chinchiná'}
                      </p>
                    </div>
                  </div>
                </div>
              </aside>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

export default ProductionPlaceDetailPage;
