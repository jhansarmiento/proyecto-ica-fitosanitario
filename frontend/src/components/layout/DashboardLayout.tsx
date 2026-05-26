// src/components/layout/DashboardLayout.tsx
import { useState, useMemo } from "react";
import { Bell, Menu } from "lucide-react";
import { SidebarContent } from "./SidebarContent";
import type {
  DashboardLayoutProps,
  NotificationItem,
} from "../../types/dashboard.types";

const notificationsSeed: NotificationItem[] = [
  {
    id: "N-1",
    tipo: "urgent",
    mensaje: "Alerta de plaga detectada en lote 2 de Predio Santa Isabel.",
    horaRelativa: "Hace 10 min",
  },
  {
    id: "N-2",
    tipo: "info",
    mensaje: "Nueva inspección programada en Predio El Porvenir.",
    horaRelativa: "Hace 25 min",
  },
  {
    id: "N-3",
    tipo: "info",
    mensaje: "Reporte ICA generado con éxito para INS-2026-0012.",
    horaRelativa: "Hace 1 h",
  },
  {
    id: "N-4",
    tipo: "urgent",
    mensaje: "Inspección vencida sin cierre en Hacienda La Aurora.",
    horaRelativa: "Hace 2 h",
  },
];

function DashboardLayout({
  title,
  subtitle = "Sistema de Inspección Fitosanitaria",
  sessionUser,
  activeView,
  breadcrumbs = [],
  onNavigate,
  onLogout,
  children,
}: DashboardLayoutProps) {
  const [isUsersOpen, setIsUsersOpen] = useState(
    activeView === "users" || activeView === "roles",
  );
  const [isInspectionsOpen, setIsInspectionsOpen] = useState(
    activeView === "inspections-agenda" || activeView === "inspections-history",
  );
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] =
    useState<NotificationItem[]>(notificationsSeed);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const unreadCount = notifications.length;

  const sharedSidebarProps = useMemo(
    () => ({
      activeView,
      isUsersOpen,
      setIsUsersOpen,
      isInspectionsOpen,
      setIsInspectionsOpen,
      onNavigate,
      onLogout,
    }),
    [activeView, isUsersOpen, isInspectionsOpen, onNavigate, onLogout],
  );

  return (
    <main className="min-h-screen bg-slate-100 text-slate-900">
      <div className="grid min-h-screen grid-cols-1 xl:grid-cols-[280px_1fr]">
        {/* Sidebar desktop */}
        <aside className="sticky top-0 hidden h-screen overflow-hidden bg-gradient-to-b from-emerald-950 via-emerald-900 to-emerald-950 p-4 text-white xl:block">
          <SidebarContent {...sharedSidebarProps} />
        </aside>

        {/* Sidebar móvil */}
        {isMobileMenuOpen && (
          <>
            <div
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm xl:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <aside className="fixed inset-y-0 left-0 z-50 w-72 overflow-y-auto bg-gradient-to-b from-emerald-950 via-emerald-900 to-emerald-950 p-4 text-white shadow-2xl xl:hidden">
              <SidebarContent
                {...sharedSidebarProps}
                onClose={() => setIsMobileMenuOpen(false)}
              />
            </aside>
          </>
        )}

        <div className="flex min-w-0 flex-col">
          {/* Header */}
          <header className="sticky top-0 z-10 flex min-h-[72px] flex-wrap items-center justify-between gap-4 border-b border-emerald-800/40 bg-emerald-900/95 px-4 py-3 text-white backdrop-blur sm:px-8">
            <div className="flex items-center gap-3 min-w-0">
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(true)}
                className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-emerald-800/60 text-emerald-200 xl:hidden"
              >
                <Menu size={20} />
              </button>
              <div className="min-w-0">
                <h1 className="truncate text-xl font-bold sm:text-3xl">
                  {title}
                </h1>
                <p className="mt-0.5 text-xs text-emerald-100 sm:text-sm">
                  {subtitle}
                </p>
              </div>
            </div>

            <div className="relative flex items-center gap-2 sm:gap-3">
              <button
                type="button"
                onClick={() => setShowNotifications((prev) => !prev)}
                className="relative grid h-9 w-9 place-items-center rounded-xl bg-emerald-900/40 text-emerald-300"
              >
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span className="absolute -right-1 -top-1 rounded-full bg-rose-500 px-1.5 text-[10px] font-bold text-white">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Panel de notificaciones dinámico */}
              {showNotifications && (
                <div className="absolute right-0 top-12 z-50 w-[320px] rounded-2xl border border-slate-200 bg-white text-slate-900 shadow-2xl sm:w-[360px]">
                  <div className="border-b border-slate-100 px-4 py-3">
                    <h3 className="text-base font-bold">
                      Notificaciones recientes
                    </h3>
                  </div>
                  <div className="max-h-72 divide-y divide-slate-100 overflow-y-auto">
                    {notifications.map((n) => (
                      <article
                        key={n.id}
                        className="flex items-start gap-3 px-4 py-3"
                      >
                        <span
                          className={`mt-2 h-2.5 w-2.5 shrink-0 rounded-full ${n.tipo === "urgent" ? "bg-rose-500" : "bg-blue-500"}`}
                        />
                        <div className="min-w-0">
                          <p className="text-sm text-slate-800">{n.mensaje}</p>
                          <p className="mt-1 text-xs text-slate-500">
                            {n.horaRelativa}
                          </p>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              )}

              <div className="hidden text-right sm:block">
                <p className="text-sm font-bold leading-none sm:text-base">
                  {sessionUser
                    ? `${sessionUser.nombre} ${sessionUser.apellidos}`
                    : ""}
                </p>
                <p className="text-xs text-emerald-200">
                  {sessionUser?.rol ?? ""}
                </p>
              </div>

              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-emerald-700 text-sm font-bold sm:h-10 sm:w-10">
                {sessionUser?.nombre && sessionUser?.apellidos
                  ? `${sessionUser.nombre.charAt(0)}${sessionUser.apellidos.charAt(0)}`.toUpperCase()
                  : "U"}
              </div>
            </div>
          </header>

          <section className="flex-1 overflow-x-hidden p-4 sm:p-6">
            {children}
          </section>
        </div>
      </div>
    </main>
  );
}

export default DashboardLayout;
