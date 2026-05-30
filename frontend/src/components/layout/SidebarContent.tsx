import {
  ChevronDown,
  ClipboardList,
  Folder,
  Home,
  ShieldCheck,
  Users,
  X,
  BookOpen, // Agregado para el ícono de Catálogo
  Sprout // Agregado para el ícono de Gestión Agrícola
} from "lucide-react";
import SidebarItem from "../ui/SidebarItem";
import type { SessionUser } from "../../types/auth.types";
import type { DashboardViewKey } from "../../types/dashboard.types";

interface SidebarContentProps {
  activeView: DashboardViewKey;
  isUsersOpen: boolean;
  setIsUsersOpen: (v: boolean | ((p: boolean) => boolean)) => void;
  isInspectionsOpen: boolean;
  setIsInspectionsOpen: (v: boolean | ((p: boolean) => boolean)) => void;
  onNavigate?: (view: DashboardViewKey) => void;
  onLogout?: () => void;
  onClose?: () => void;
  sessionUser?: SessionUser;
}

export function SidebarContent({
  activeView,
  isUsersOpen,
  setIsUsersOpen,
  isInspectionsOpen,
  setIsInspectionsOpen,
  onNavigate,
  onLogout,
  onClose,
  sessionUser,
}: SidebarContentProps) {
  const navigate = (view: DashboardViewKey) => {
    onNavigate?.(view);
    onClose?.();
  };

  // 🌟 1. DEFINIMOS LOS ROLES DE FORMA SEGURA
  const rol = sessionUser?.rol?.toLowerCase() || "";
  
  // Aceptamos tanto 'admin' (de la base de datos real) como 'administrador' por seguridad
  const isAdmin = rol === "admin" || rol === "administrador"; 
  const isProductor = rol === "productor";
  const isAsistente = rol.includes("asistente") || rol.includes("tecnico");

  return (
    <div className="relative z-10 flex h-full flex-col">
      <div className="mb-5 flex items-center gap-3 border-b border-white/10 pb-4">
        <div className="h-12 w-12 rounded-xl bg-white/95 shadow-md flex items-center justify-center">
            <span className="text-emerald-900 font-black text-2xl">FG</span>
        </div>
        <div>
          <p className="text-2xl font-bold leading-none">FitoGestor</p>
          <p className="mt-1 text-sm text-emerald-100/90">
            Sistema Fitosanitario
          </p>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="ml-auto grid h-8 w-8 place-items-center rounded-xl bg-white/10 text-white xl:hidden"
          >
            <X size={18} />
          </button>
        )}
      </div>

      <nav className="min-h-0 flex-1 space-y-1.5 overflow-y-auto pr-1">
        
        {/* ── ADMINISTRADOR: Inicio ── */}
        {isAdmin && (
            <button type="button" onClick={() => navigate("home")} className="w-full">
            <SidebarItem label="Inicio" active={activeView === "home"} icon={<Home size={20} />} />
            </button>
        )}

        {/* ── ADMINISTRADOR: Gestión de Usuarios ── */}
        {isAdmin && (
            <>
                <button
                type="button"
                onClick={() => setIsUsersOpen((prev) => !prev)}
                className={`group relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all duration-300 ${activeView === "users" || activeView === "roles" ? "bg-white/10 text-white" : "text-emerald-50/90 hover:bg-white/10 hover:text-white"}`}
                >
                <Users size={20} className="text-emerald-200" />
                <span className="flex-1 text-[1.02rem] font-semibold tracking-tight">Gestión de Usuarios</span>
                <ChevronDown size={16} className={`transition-transform duration-300 ${isUsersOpen ? "rotate-180" : ""}`} />
                </button>

                {isUsersOpen && (
                <div className="ml-3 mt-1 space-y-1">
                    <button type="button" onClick={() => navigate("users")} className={`flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-base transition ${activeView === "users" ? "bg-white text-emerald-900 font-semibold" : "text-emerald-100 hover:bg-white/10"}`}>
                    <Users size={18} /> Usuarios
                    </button>
                    <button type="button" onClick={() => navigate("roles")} className={`flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-base transition ${activeView === "roles" ? "bg-white text-emerald-900 font-semibold" : "text-emerald-100 hover:bg-white/10"}`}>
                    <ShieldCheck size={18} /> Roles
                    </button>
                </div>
                )}
            </>
        )}

        {/* ── PRODUCTOR: Gestión Agrícola ── */}
        {isProductor && (
            <button type="button" onClick={() => navigate("agricultural")} className="w-full">
            <SidebarItem label="Gestión Agrícola" active={activeView === "agricultural"} icon={<Sprout size={20} />} />
            </button>
        )}

        {/* ── ADMINISTRADOR Y ASISTENTE: Catálogo ── */}
        {(isAdmin || isAsistente) && (
            <button type="button" onClick={() => navigate("catalog")} className="w-full">
            <SidebarItem label="Catálogo" active={activeView === "catalog"} icon={<BookOpen size={20} />} />
            </button>
        )}

        {/* ── ADMINISTRADOR: Aprobación de Lugares ── */}
        {isAdmin && (
            <button type="button" onClick={() => navigate("approval-places")} className="w-full">
            <SidebarItem label="Aprobación de Lugares" active={activeView === "approval-places"} icon={<Folder size={20} />} />
            </button>
        )}

        {/* ── PRODUCTOR: Mis Solicitudes ── */}
        {isProductor && (
            <button type="button" onClick={() => navigate("approval-places")} className="w-full">
            <SidebarItem label="Mis Solicitudes" active={activeView === "approval-places"} icon={<Folder size={20} />} />
            </button>
        )}

        {/* ── ASISTENTE: Inspecciones ── */}
        {isAsistente && (
          <>
            <button
              type="button"
              onClick={() => setIsInspectionsOpen((prev) => !prev)}
              className={`group relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all duration-300 ${activeView === "inspections-agenda" || activeView === "inspections-history" ? "bg-white/10 text-white" : "text-emerald-50/90 hover:bg-white/10 hover:text-white"}`}
            >
              <ClipboardList size={20} className="text-emerald-200" />
              <span className="flex-1 text-[1.02rem] font-semibold tracking-tight">Inspecciones</span>
              <ChevronDown size={16} className={`transition-transform duration-300 ${isInspectionsOpen ? "rotate-180" : ""}`} />
            </button>

            {isInspectionsOpen && (
              <div className="ml-3 mt-1 space-y-1">
                <button type="button" onClick={() => navigate("inspections-agenda")} className={`flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-base transition ${activeView === "inspections-agenda" ? "bg-white text-emerald-900 font-semibold" : "text-emerald-100 hover:bg-white/10"}`}>
                  <ClipboardList size={18} /> Agenda
                </button>
                <button type="button" onClick={() => navigate("inspections-history")} className={`flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-base transition ${activeView === "inspections-history" ? "bg-white text-emerald-900 font-semibold" : "text-emerald-100 hover:bg-white/10"}`}>
                  <ClipboardList size={18} /> Historial
                </button>
              </div>
            )}
          </>
        )}

        {/* ── TODOS: Reportes ── */}
        <button type="button" onClick={() => navigate("reports")} className="w-full">
          <SidebarItem label="Reportes" active={activeView === "reports"} icon={<ClipboardList size={20} />} />
        </button>
      </nav>

      <button
        type="button"
        onClick={onLogout}
        className="mt-4 shrink-0 flex items-center gap-2 rounded-xl border border-red-300/30 bg-red-500/10 px-3 py-3 text-base font-bold text-red-300 transition hover:bg-red-500/20"
      >
        <span>↪</span> Cerrar Sesión
      </button>
    </div>
  );
}