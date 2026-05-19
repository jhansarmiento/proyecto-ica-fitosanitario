import { Bell, ChevronDown, ClipboardList, Folder, Home, Layers, ShieldCheck, Users } from 'lucide-react';
import { useMemo, useState } from 'react';
import SidebarItem from '../ui/SidebarItem';
import type { SessionUser } from '../../App';

type NotificationItem = {
  id: string;
  tipo: 'urgent' | 'info';
  mensaje: string;
  horaRelativa: string;
};

export type DashboardViewKey =
  | 'home'
  | 'users'
  | 'roles'
  | 'agricultural'
  | 'approval-places'
  | 'inspections-agenda'
  | 'inspections-history';

type MenuItem = {
  key: DashboardViewKey;
  label: string;
  icon?: React.ReactNode;
};

type DashboardLayoutProps = {
  title: string;
  subtitle?: string;
  sessionUser?: SessionUser;
  activeView: DashboardViewKey;
  breadcrumbs?: string[];
  onNavigate?: (view: DashboardViewKey) => void;
  onLogout?: () => void;
  children: React.ReactNode;
};

const notificationsSeed: NotificationItem[] = [
  {
    id: 'N-1',
    tipo: 'urgent',
    mensaje: 'Alerta de plaga detectada en lote 2 de Predio Santa Isabel.',
    horaRelativa: 'Hace 10 min',
  },
  {
    id: 'N-2',
    tipo: 'info',
    mensaje: 'Nueva inspección programada en Predio El Porvenir.',
    horaRelativa: 'Hace 25 min',
  },
  {
    id: 'N-3',
    tipo: 'info',
    mensaje: 'Reporte ICA generado con éxito para INS-2026-0012.',
    horaRelativa: 'Hace 1 h',
  },
  {
    id: 'N-4',
    tipo: 'urgent',
    mensaje: 'Inspección vencida sin cierre en Hacienda La Aurora.',
    horaRelativa: 'Hace 2 h',
  },
];

function DashboardLayout({
  title,
  subtitle = 'Sistema de Inspección Fitosanitaria',
  sessionUser,
  activeView,
  breadcrumbs = [],
  onNavigate,
  onLogout,
  children,
}: DashboardLayoutProps) {
  const [isUsersOpen, setIsUsersOpen] = useState(activeView === 'users' || activeView === 'roles');
  const [isInspectionsOpen, setIsInspectionsOpen] = useState(
    activeView === 'inspections-agenda' || activeView === 'inspections-history',
  );
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>(notificationsSeed);

  const menuSections = useMemo(
    () => ({
      users: [
        { key: 'users', label: 'Usuarios', icon: <Users size={18} /> },
        { key: 'roles', label: 'Roles', icon: <ShieldCheck size={18} /> },
      ] as MenuItem[],
      requests: [{ key: 'approval-places', label: 'Mis Solicitudes', icon: <Folder size={20} /> }] as MenuItem[],
    }),
    [],
  );

  const unreadCount = notifications.length;

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
            <button type="button" onClick={() => onNavigate?.('home')} className="w-full">
              <SidebarItem label="Inicio" active={activeView === 'home'} icon={<Home size={20} />} />
            </button>

            <button
              type="button"
              onClick={() => setIsUsersOpen((prev) => !prev)}
              className={`group relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all duration-300 ${
                activeView === 'users' || activeView === 'roles'
                  ? 'bg-white/10 text-white'
                  : 'text-emerald-50/90 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Users size={20} className="text-emerald-200" />
              <span className="flex-1 text-[1.02rem] font-semibold tracking-tight">Gestión de Usuarios</span>
              <ChevronDown size={16} className={`transition-transform duration-300 ${isUsersOpen ? 'rotate-180' : ''}`} />
            </button>

            {isUsersOpen ? (
              <div className="ml-3 mt-1 space-y-1">
                {menuSections.users.map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => onNavigate?.(item.key)}
                    className={`flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-base transition ${
                      activeView === item.key
                        ? 'bg-white text-emerald-900 font-semibold shadow-sm'
                        : 'text-emerald-100 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    {item.icon}
                    {item.label}
                  </button>
                ))}
              </div>
            ) : null}

            <button type="button" onClick={() => onNavigate?.('agricultural')} className="w-full">
              <SidebarItem label="Gestión Agrícola" active={activeView === 'agricultural'} icon={<Layers size={20} />} />
            </button>

            {menuSections.requests.map((item) => (
              <button key={item.key} type="button" onClick={() => onNavigate?.(item.key)} className="w-full">
                <SidebarItem label={item.label} active={activeView === item.key} icon={item.icon} />
              </button>
            ))}

            <button
              type="button"
              onClick={() => setIsInspectionsOpen((prev) => !prev)}
              className={`group relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all duration-300 ${
                activeView === 'inspections-agenda' || activeView === 'inspections-history'
                  ? 'bg-white/10 text-white'
                  : 'text-emerald-50/90 hover:bg-white/10 hover:text-white'
              }`}
            >
              <ClipboardList size={20} className="text-emerald-200" />
              <span className="flex-1 text-[1.02rem] font-semibold tracking-tight">Inspecciones</span>
              <ChevronDown size={16} className={`transition-transform duration-300 ${isInspectionsOpen ? 'rotate-180' : ''}`} />
            </button>

            {isInspectionsOpen ? (
              <div className="ml-3 mt-1 space-y-1">
                <button
                  type="button"
                  onClick={() => onNavigate?.('inspections-agenda')}
                  className={`flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-base transition ${
                    activeView === 'inspections-agenda'
                      ? 'bg-white text-emerald-900 font-semibold shadow-sm'
                      : 'text-emerald-100 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <ClipboardList size={18} />
                  Realizar Inspección
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate?.('inspections-history')}
                  className={`flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-base transition ${
                    activeView === 'inspections-history'
                      ? 'bg-white text-emerald-900 font-semibold shadow-sm'
                      : 'text-emerald-100 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <ClipboardList size={18} />
                  Historial de Inspecciones
                </button>
              </div>
            ) : null}

            <SidebarItem label="Reportes" icon={<Folder size={20} />} />
          </nav>

          <button
            type="button"
            onClick={onLogout}
            className="mt-4 flex items-center gap-2 rounded-xl border border-red-300/30 bg-red-500/10 px-3 py-3 text-base font-bold text-red-300 transition hover:bg-red-500/20"
          >
            <span>↪</span>
            Cerrar Sesión
          </button>
        </aside>

        <div className="flex min-w-0 flex-col">
          <header className="sticky top-0 z-10 flex min-h-[86px] flex-wrap items-center justify-between gap-4 border-b border-emerald-800/40 bg-emerald-900/95 px-5 py-3 text-white backdrop-blur sm:px-8">
            <div className="min-w-0">
              <h1 className="truncate text-3xl font-bold leading-none">{title}</h1>
              <p className="mt-1 text-sm text-emerald-100">{subtitle}</p>
              {breadcrumbs.length ? (
                <div className="mt-2 flex flex-wrap items-center gap-1 text-xs text-emerald-200/90">
                  {breadcrumbs.map((crumb, idx) => (
                    <span key={`${crumb}-${idx}`} className="inline-flex items-center gap-1">
                      {idx > 0 ? <span>/</span> : null}
                      <span>{crumb}</span>
                    </span>
                  ))}
                </div>
              ) : null}
            </div>

            <div className="relative flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowNotifications((prev) => !prev)}
                className="relative grid h-10 w-10 place-items-center rounded-xl bg-emerald-900/40 text-emerald-300 transition-all duration-300 hover:bg-emerald-700/80 hover:text-white"
              >
                <Bell size={18} />
                {unreadCount > 0 ? (
                  <span className="absolute -right-1 -top-1 rounded-full bg-rose-500 px-1.5 text-[10px] font-bold leading-5 text-white">
                    {unreadCount}
                  </span>
                ) : null}
              </button>

              {showNotifications ? (
                <div className="absolute right-0 top-12 z-50 w-[360px] max-w-[calc(100vw-2rem)] rounded-2xl border border-slate-200 bg-white text-slate-900 shadow-2xl">
                  <div className="border-b border-slate-100 px-4 py-3">
                    <h3 className="text-lg font-bold text-slate-900">Notificaciones recientes</h3>
                  </div>
                  <div className="max-h-80 divide-y divide-slate-100 overflow-y-auto">
                    {notifications.map((n) => (
                      <article key={n.id} className="flex items-start gap-3 px-4 py-3">
                        <span className={`mt-2 h-2.5 w-2.5 rounded-full ${n.tipo === 'urgent' ? 'bg-rose-500' : 'bg-blue-500'}`} />
                        <div className="min-w-0">
                          <p className="text-sm text-slate-800">{n.mensaje}</p>
                          <p className="mt-1 text-xs text-slate-500">{n.horaRelativa}</p>
                        </div>
                      </article>
                    ))}
                    {notifications.length === 0 ? (
                      <div className="px-4 py-6 text-center text-sm text-slate-500">No hay notificaciones pendientes.</div>
                    ) : null}
                  </div>
                  <div className="border-t border-slate-100 p-3">
                    <button
                      type="button"
                      onClick={() => setNotifications([])}
                      className="w-full rounded-xl bg-emerald-700 px-3 py-2 text-sm font-semibold text-white transition hover:bg-emerald-800"
                    >
                      Marcar todas como leídas
                    </button>
                  </div>
                </div>
              ) : null}

              <div className="text-right">
                <p className="text-base font-bold leading-none">{sessionUser ? `${sessionUser.nombre} ${sessionUser.apellidos}` : ''}</p>
                <p className="text-xs text-emerald-200">{sessionUser?.rol ?? ''}</p>
              </div>
              <div className="grid h-10 w-10 place-items-center rounded-full bg-emerald-700 text-sm font-bold">
                {sessionUser ? `${sessionUser.nombre.charAt(0)}${sessionUser.apellidos.charAt(0)}`.toUpperCase() : ''}
              </div>
            </div>
          </header>

          <section className="flex-1 p-4 sm:p-6">{children}</section>
        </div>
      </div>
    </main>
  );
}

export default DashboardLayout;
