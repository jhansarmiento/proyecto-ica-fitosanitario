import { useState } from "react";
import "./App.css";
import HomePage from "./pages/HomePage";
import UsersPage from "./pages/UsersPage";
import RolesPage from "./pages/RolesPage";
import AgriculturalManagementPage, {
  type ProductionSite,
} from "./pages/AgriculturalManagementPage";
import ProductionPlaceDetailPage from "./pages/ProductionPlaceDetailPage";
import ProductionLotsPage from "./pages/ProductionLotsPage";
import LoginPage from "./pages/LoginPage";
import RegisterProductorPage from "./pages/RegisterProductorPage";
import AdminProductionApprovalPage from "./pages/AdminProductionApprovalPage";
import InspectionRequestsPage from "./pages/InspectionRequestsPage";
// import InspectionAgendaPage from "./pages/InspectionAgendaPage";
import InspectionHistoryPage from "./pages/InspectionHistoryPage";
import InspectionProcessPage from "./pages/InspectionProcessPage";
import CatalogManagementPage from "./pages/CatalogManagementPage";
import ReportsPage from "./pages/ReportsPage";
import type { SessionUser } from "./types/auth.types";

type View =
  | "login"
  | "register"
  | "home"
  | "users"
  | "roles"
  | "agricultural"
  | "catalog"
  | "production-detail"
  | "production-lots"
  | "approval-places"
  | "mis-solicitudes"
  | "inspections-agenda"
  | "inspections-history"
  | "inspection-process"
  | "reports";

// Objeto de inicialización segura para evitar campos undefined
const estadoUsuarioVacio: SessionUser = {
  id_usuario: "",
  nombre: "",
  apellidos: "",
  correo_electronico: "",
  rol: "",
};

function App() {
  const [view, setView] = useState<View>(() => {
    const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";
    return isAuthenticated ? "home" : "login";
  });

  const [sessionUser, setSessionUser] = useState<SessionUser>(() => {
    try {
      const stored = localStorage.getItem("sessionUser");
      return stored ? JSON.parse(stored) : estadoUsuarioVacio;
    } catch {
      return { id: "", nombre: "", apellidos: "", rol: "" };
    }
  });

  const [selectedSite, setSelectedSite] = useState<ProductionSite | null>(null);
  const [selectedSolicitud, setSelectedSolicitud] = useState<any>(null);

  const handleLoginSuccess = (user: SessionUser) => {
    localStorage.setItem("isAuthenticated", "true");
    localStorage.setItem("sessionUser", JSON.stringify(user));
    setSessionUser(user);
    setView("home");
  };

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("sessionUser");
    setSessionUser({
      id_usuario: "",
      nombre: "",
      apellidos: "",
      correo_electronico: "",
      rol: "",
    });
    setSelectedSite(null);
    setView("login");
  };

  let page: React.ReactNode;

  if (view === "register") {
    page = (
      <RegisterProductorPage
        onGoLogin={() => setView("login")}
        onRegisterSuccess={() => setView("login")}
      />
    );
  } else if (view === "login") {
    page = (
      <LoginPage
        onLoginSuccess={handleLoginSuccess}
        onGoRegister={() => setView("register")}
      />
    );
  } else if (view === "home") {
    page = (
      <HomePage
        sessionUser={sessionUser}
        onGoUsers={() => setView("users")}
        onGoRoles={() => setView("roles")}
        onGoAgricultural={() => setView("agricultural")}
        onGoCatalog={() => setView("catalog")}
        onGoApprovalPlaces={() => setView("approval-places")}
        onGoInspectionsAgenda={() => setView("inspections-agenda")}
        onGoInspectionsHistory={() => setView("inspections-history")}
        onGoReports={() => setView("reports")}
        onLogout={handleLogout}
      />
    );
  } else if (view === "users") {
    page = (
      <UsersPage
        sessionUser={sessionUser}
        onGoHome={() => setView("home")}
        onGoRoles={() => setView("roles")}
        onGoAgricultural={() => setView("agricultural")}
        onGoCatalog={() => setView("catalog")}
        onGoApprovalPlaces={() => setView("approval-places")}
        onGoInspectionsAgenda={() => setView("inspections-agenda")}
        onGoInspectionsHistory={() => setView("inspections-history")}
        onGoReports={() => setView("reports")}
        onLogout={handleLogout}
      />
    );
  } else if (view === "roles") {
    page = (
      <RolesPage
        sessionUser={sessionUser}
        onGoHome={() => setView("home")}
        onGoUsers={() => setView("users")}
        onGoAgricultural={() => setView("agricultural")}
        onGoCatalog={() => setView("catalog")}
        onGoApprovalPlaces={() => setView("approval-places")}
        onGoInspectionsAgenda={() => setView("inspections-agenda")}
        onGoInspectionsHistory={() => setView("inspections-history")}
        onGoReports={() => setView("reports")}
        onLogout={handleLogout}
      />
    );
  } else if (view === "agricultural") {
    page = (
      <AgriculturalManagementPage
        sessionUser={sessionUser}
        onGoHome={() => setView("home")}
        onGoUsers={() => setView("users")}
        onGoRoles={() => setView("roles")}
        onGoCatalog={() => setView("catalog")}
        onGoApprovalPlaces={() => setView("approval-places")}
        onGoInspectionsAgenda={() => setView("inspections-agenda")}
        onGoInspectionsHistory={() => setView("inspections-history")}
        onGoReports={() => setView("reports")}
        onLogout={handleLogout}
        onOpenProductionDetail={(site) => {
          setSelectedSite(site);
          setView("production-detail");
        }}
      />
    );
  } else if (view === "production-detail") {
    page = (
      <ProductionPlaceDetailPage
        sessionUser={sessionUser}
        site={selectedSite}
        onBackToAgricultural={() => setView("agricultural")}
        onGoLots={() => setView("production-lots")}
        onGoHome={() => setView("home")}
        onGoUsers={() => setView("users")}
        onGoRoles={() => setView("roles")}
        onGoApprovalPlaces={() => setView("approval-places")}
        onGoCatalog={() => setView("catalog")}
        onGoInspectionsAgenda={() => setView("inspections-agenda")}
        onGoInspectionsHistory={() => setView("inspections-history")}
        onGoReports={() => setView("reports")}
        onLogout={handleLogout}
      />
    );
  } else if (view === "production-lots") {
    page = (
      <ProductionLotsPage
        sessionUser={sessionUser}
        site={selectedSite}
        onGoResumen={() => setView("production-detail")}
        onGoHome={() => setView("home")}
        onGoUsers={() => setView("users")}
        onGoRoles={() => setView("roles")}
        onGoApprovalPlaces={() => setView("approval-places")}
        onGoCatalog={() => setView("catalog")}
        onGoInspectionsAgenda={() => setView("inspections-agenda")}
        onGoInspectionsHistory={() => setView("inspections-history")}
        onGoReports={() => setView("reports")}
        onLogout={handleLogout}
      />
    );
  } else if (view === "catalog") {
    page = (
      <CatalogManagementPage
        sessionUser={sessionUser}
        onGoHome={() => setView("home")}
        onGoUsers={() => setView("users")}
        onGoRoles={() => setView("roles")}
        onGoAgricultural={() => setView("agricultural")}
        onGoApprovalPlaces={() => setView("approval-places")}
        onGoInspectionsAgenda={() => setView("inspections-agenda")}
        onGoInspectionsHistory={() => setView("inspections-history")}
        onGoReports={() => setView("reports")}
        onLogout={handleLogout}
      />
    );
  } else if (view === "approval-places") {
    // 🌟 ENRUTAMIENTO DINÁMICO POR ROL:
    // Reutilizamos la llave física que todas las páginas ya saben propagar
    const rol = sessionUser?.rol?.toLowerCase();

    if (rol === "productor") {
      // Si es productor, la pestaña "Mis Solicitudes" lo lleva a ver sus inspecciones radicas
      page = (
        <InspectionRequestsPage
          sessionUser={sessionUser}
          onNavigate={(v: string) => setView(v as View)}
          onLogout={handleLogout}
        />
      );
    } else {
      // Si es Administrador, lo lleva a la pantalla original de aprobar fincas nuevas
      page = (
        <AdminProductionApprovalPage
          sessionUser={sessionUser}
          onGoHome={() => setView("home")}
          onGoUsers={() => setView("users")}
          onGoRoles={() => setView("roles")}
          onGoAgricultural={() => setView("agricultural")}
          onGoCatalog={() => setView("catalog")}
          onGoApprovalPlaces={() => setView("approval-places")}
          onGoInspectionsAgenda={() => setView("inspections-agenda")}
          onGoInspectionsHistory={() => setView("inspections-history")}
          onGoReports={() => setView("reports")}
          onLogout={handleLogout}
        />
      );
    }
  } else if (view === "inspections-agenda" || view === "mis-solicitudes") {
    // 🌟 AMBAS RUTAS APUNTAN AL MISMO COMPONENTE REACTIVO
    page = (
      <InspectionRequestsPage
        sessionUser={sessionUser}
        onNavigate={(v: string) => setView(v as View)}
        onLogout={handleLogout}
        // Atrapamos la solicitud y vamos a la inspección
        onStartInspection={(sol) => {
          setSelectedSolicitud(sol);
          setView('inspection-process');
        }}
      />
    );
  } else if (view === "inspections-history") {
    page = (
      <InspectionHistoryPage
        sessionUser={sessionUser}
        onGoHome={() => setView("home")}
        onGoUsers={() => setView("users")}
        onGoRoles={() => setView("roles")}
        onGoAgricultural={() => setView("agricultural")}
        onGoCatalog={() => setView("catalog")}
        onGoApprovalPlaces={() => setView("approval-places")}
        onGoInspectionsAgenda={() => setView("inspections-agenda")}
        onGoReports={() => setView("reports")}
        onLogout={handleLogout}
      />
    );
  } else if (view === "inspection-process") {
    page = (
      <InspectionProcessPage
        sessionUser={sessionUser}
        solicitud={selectedSolicitud}
        onGoHome={() => setView("home")}
        onGoUsers={() => setView("users")}
        onGoRoles={() => setView("roles")}
        onGoAgricultural={() => setView("agricultural")}
        onGoCatalog={() => setView("catalog")}
        onGoApprovalPlaces={() => setView("approval-places")}
        onGoInspectionsAgenda={() => setView("inspections-agenda")}
        onGoInspectionsHistory={() => setView("inspections-history")}
        onGoReports={() => setView("reports")}
        onLogout={handleLogout}
        onBack={() => setView("inspections-agenda")}
        onFinish={() => setView("inspections-history")}
      />
    );
  } else if (view === "reports") {
    page = (
      <ReportsPage
        sessionUser={sessionUser}
        onGoHome={() => setView("home")}
        onGoUsers={() => setView("users")}
        onGoRoles={() => setView("roles")}
        onGoAgricultural={() => setView("agricultural")}
        onGoCatalog={() => setView("catalog")}
        onGoApprovalPlaces={() => setView("approval-places")}
        onGoInspectionsAgenda={() => setView("inspections-agenda")}
        onGoInspectionsHistory={() => setView("inspections-history")}
        onLogout={handleLogout}
      />
    );
  } else {
    page = (
      <AdminProductionApprovalPage
        sessionUser={sessionUser}
        onGoHome={() => setView("home")}
        onGoUsers={() => setView("users")}
        onGoRoles={() => setView("roles")}
        onGoAgricultural={() => setView("agricultural")}
        onGoCatalog={() => setView("catalog")}
        onGoApprovalPlaces={() => setView("approval-places")}
        onGoInspectionsAgenda={() => setView("inspections-agenda")}
        onGoInspectionsHistory={() => setView("inspections-history")}
        onGoReports={() => setView("reports")}
        onLogout={handleLogout}
      />
    );
  }

  return <>{page}</>;
}

export default App;
