// src/components/layout/DashboardLayout.tsx
import { useState, useMemo } from "react";
import { Bell, Menu } from "lucide-react";
import { SidebarContent } from "./SidebarContent";
import type {
  DashboardLayoutProps,
  NotificationItem,
  NavigationItem,
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
];

// MAPA CENTRALIZADO DE ACCESOS
const MENU_ITEMS: NavigationItem[] = [
  {
    key: "home",
    label: "Inicio",
    icon: "HomeIcon",
    rolesPermitidos: ["administrador", "asistente_tecnico"],
  },
  {
    key: "users",
    label: "Gestión de Usuarios",
    icon: "UsersIcon",
    rolesPermitidos: ["administrador"],
  },
  {
    key: "agricultural",
    label: "Gestión Agrícola",
    icon: "SproutIcon",
    rolesPermitidos: ["productor", "administrador", "asistente_tecnico"],
  },
  {
    key: "catalog",
    label: "Catálogo",
    icon: "BookOpenIcon",
    rolesPermitidos: ["administrador", "asistente_tecnico"],
  },
  {
    key: "approval-places",
    label: "Mis Solicitudes",
    icon: "FolderIcon",
    rolesPermitidos: ["productor", "administrador"],
  },
  {
    key: "inspections-agenda",
    label: "Inspecciones",
    icon: "ClipboardIcon",
    rolesPermitidos: ["administrador", "asistente_tecnico"],
  },
  {
    key: "reports",
    label: "Reportes",
    icon: "ChartIcon",
    rolesPermitidos: ["productor", "administrador", "asistente_tecnico"],
  },
];

function DashboardLayout({
  title,
  subtitle = "Sistema de Inspección Fitosanitaria",
  sessionUser,
  activeView,
  onNavigate,
  onLogout,
  children,
}: DashboardLayoutProps) {
  const rolUsuario = sessionUser?.rol?.toLocaleLowerCase() || "";

  // Filtramos los accesos según el rol de la sesión activa
  const menuFiltrado = useMemo(() => {
    return MENU_ITEMS.filter((item) =>
      item.rolesPermitidos.includes(rolUsuario),
    );
  }, [rolUsuario]);

  // Estados para controlar la apertura de submenús y paneles
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

  // CENTRALIZACIÓN: Le pasamos 'menuItems' a la barra lateral para que oculte las vistas
  const sharedSidebarProps = useMemo(
    () => ({
      activeView,
      isUsersOpen,
      setIsUsersOpen,
      isInspectionsOpen,
      setIsInspectionsOpen,
      onNavigate,
      onLogout,
      sessionUser,
      menuItems: menuFiltrado, // Inyectamos la lista filtrada por rol
    }),
    [
      activeView,
      isUsersOpen,
      isInspectionsOpen,
      onNavigate,
      onLogout,
      menuFiltrado,
      sessionUser,
    ],
  );

  return (
    <main className="min-h-screen bg-slate-100 text-slate-900">
      <div className="grid min-h-screen grid-cols-1 xl:grid-cols-[280px_1fr]">
        {/* Sidebar desktop */}
        <aside className="sticky top-0 hidden h-screen overflow-hidden bg-linear-to-b from-emerald-950 via-emerald-900 to-emerald-950 p-4 text-white xl:block">
          <SidebarContent {...sharedSidebarProps} />
        </aside>

        {/* Sidebar móvil */}
        {isMobileMenuOpen && (
          <>
            <div
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm xl:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <aside className="fixed inset-y-0 left-0 z-50 w-72 overflow-y-auto bg-linear-to-b from-emerald-950 via-emerald-900 to-emerald-950 p-4 text-white shadow-2xl xl:hidden">
              <SidebarContent
                {...sharedSidebarProps}
                onClose={() => setIsMobileMenuOpen(false)}
              />
            </aside>
          </>
        )}

        <div className="flex min-w-0 flex-col">
          {/* Header */}
          <header className="sticky top-0 z-10 flex min-h-18 flex-wrap items-center justify-between gap-4 border-b border-emerald-800/40 bg-emerald-900/95 px-4 py-3 text-white backdrop-blur sm:px-8">
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
                <div className="absolute right-0 top-12 z-50 w-[320px] rounded-2xl border border-slate-200 bg-white text-slate-900 shadow-2xl sm:w-90">
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
                  {sessionUser?.nombre
                    ? `${sessionUser.nombre} ${sessionUser.apellidos}`
                    : ""}
                </p>
                <p className="text-xs text-emerald-200 uppercase tracking-wider mt-1">
                  {sessionUser?.rol || ""}
                </p>
              </div>

              {/* Avatar circular con iniciales nativas */}
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
