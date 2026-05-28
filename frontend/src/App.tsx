/**
 * Componente principal de la aplicación.
 *
 * Este componente actúa como el contenedor raíz de la SPA y maneja la
 * navegación interna sin usar React Router. Controla las vistas de:
 * login, registro, administración, catálogos, inspecciones y reportes.
 *
 * @module App
 */
import { useState } from 'react';
import './App.css';
import HomePage from './pages/HomePage';
import UsersPage from './pages/UsersPage';
import RolesPage from './pages/RolesPage';
import AgriculturalManagementPage, { type ProductionSite } from './pages/AgriculturalManagementPage';
import ProductionPlaceDetailPage from './pages/ProductionPlaceDetailPage';
import ProductionLotsPage from './pages/ProductionLotsPage';
import LoginPage from './pages/LoginPage';
import RegisterProductorPage from './pages/RegisterProductorPage';
import AdminProductionApprovalPage from './pages/AdminProductionApprovalPage';
import InspectionAgendaPage from './pages/InspectionAgendaPage';
import InspectionHistoryPage from './pages/InspectionHistoryPage';
import InspectionProcessPage from './pages/InspectionProcessPage';
import CatalogManagementPage from './pages/CatalogManagementPage';
import ReportsPage from './pages/ReportsPage';
import ResetPasswordPage from './pages/ResetPasswordPage';

type View =
  | 'login'
  | 'register'
  | 'home'
  | 'users'
  | 'roles'
  | 'agricultural'
  | 'catalog'
  | 'production-detail'
  | 'production-lots'
  | 'approval-places'
  | 'inspections-agenda'
  | 'inspections-history'
  | 'inspection-process'
  | 'reports';

/**
 * Usuario autenticado en la sesión.
 *
 * @typedef {Object} SessionUser
 * @property {string} id Identificador del usuario.
 * @property {string} nombre Nombre del usuario.
 * @property {string} apellidos Apellidos del usuario.
 * @property {string} rol Rol asignado al usuario.
 */
export type SessionUser = {
  id: string;
  nombre: string;
  apellidos: string;
  rol: string;
};

/**
 * Componente raíz de la aplicación.
 *
 * Determina la vista inicial según la ruta y el estado de autenticación,
 * carga el usuario de sesión desde localStorage y delega la renderización
 * de las páginas hijas mediante callbacks de navegación.
 *
 * @returns {JSX.Element} Página actual de la aplicación.
 */
function App() {
  const [view, setView] = useState<View>(() => {
    const path = window.location.pathname;
    if (path === '/reset-password') return 'login';
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    return isAuthenticated ? 'home' : 'login';
  });

  const [sessionUser, setSessionUser] = useState<SessionUser>(() => {
    try {
      const stored = localStorage.getItem('sessionUser');
      return stored ? JSON.parse(stored) : { id: '', nombre: '', apellidos: '', rol: '' };
    } catch {
      return { id: '', nombre: '', apellidos: '', rol: '' };
    }
  });

  const [selectedSite, setSelectedSite] = useState<ProductionSite | null>(null);

  const handleLoginSuccess = (user: SessionUser) => {
    localStorage.setItem('isAuthenticated', 'true');
    localStorage.setItem('sessionUser', JSON.stringify(user));
    setSessionUser(user);
    setView('home');
  };

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('sessionUser');
    setSessionUser({ id: '', nombre: '', apellidos: '', rol: '' });
    setSelectedSite(null);
    setView('login');
  };

  if (window.location.pathname === '/reset-password') {
    return <ResetPasswordPage />;
  }

  let page: React.ReactNode;

  if (view === 'register') {
    page = (
      <RegisterProductorPage
        onGoLogin={() => setView('login')}
        onRegisterSuccess={() => setView('login')}
      />
    );
  } else if (view === 'login') {
    page = <LoginPage onLoginSuccess={handleLoginSuccess} onGoRegister={() => setView('register')} />;
  } else if (view === 'home') {
    page = (
      <HomePage
        sessionUser={sessionUser}
        onGoUsers={() => setView('users')}
        onGoRoles={() => setView('roles')}
        onGoAgricultural={() => setView('agricultural')}
        onGoCatalog={() => setView('catalog')}
        onGoApprovalPlaces={() => setView('approval-places')}
        onGoInspectionsAgenda={() => setView('inspections-agenda')}
        onGoInspectionsHistory={() => setView('inspections-history')}
        onGoReports={() => setView('reports')}
        onLogout={handleLogout}
      />
    );
  } else if (view === 'users') {
    page = (
      <UsersPage
        sessionUser={sessionUser}
        onGoHome={() => setView('home')}
        onGoRoles={() => setView('roles')}
        onGoAgricultural={() => setView('agricultural')}
        onGoCatalog={() => setView('catalog')}
        onGoApprovalPlaces={() => setView('approval-places')}
        onGoInspectionsAgenda={() => setView('inspections-agenda')}
        onGoInspectionsHistory={() => setView('inspections-history')}
        onGoReports={() => setView('reports')}
        onLogout={handleLogout}
      />
    );
  } else if (view === 'roles') {
    page = (
      <RolesPage
        sessionUser={sessionUser}
        onGoHome={() => setView('home')}
        onGoUsers={() => setView('users')}
        onGoAgricultural={() => setView('agricultural')}
        onGoCatalog={() => setView('catalog')}
        onGoApprovalPlaces={() => setView('approval-places')}
        onGoInspectionsAgenda={() => setView('inspections-agenda')}
        onGoInspectionsHistory={() => setView('inspections-history')}
        onGoReports={() => setView('reports')}
        onLogout={handleLogout}
      />
    );
  } else if (view === 'agricultural') {
    page = (
      <AgriculturalManagementPage
        sessionUser={sessionUser}
        onGoHome={() => setView('home')}
        onGoUsers={() => setView('users')}
        onGoRoles={() => setView('roles')}
        onGoCatalog={() => setView('catalog')}
        onGoApprovalPlaces={() => setView('approval-places')}
        onGoInspectionsAgenda={() => setView('inspections-agenda')}
        onGoInspectionsHistory={() => setView('inspections-history')}
        onGoReports={() => setView('reports')}
        onLogout={handleLogout}
        onOpenProductionDetail={(site) => {
          setSelectedSite(site);
          setView('production-detail');
        }}
      />
    );
  } else if (view === 'production-detail') {
    page = (
      <ProductionPlaceDetailPage
        sessionUser={sessionUser}
        site={selectedSite}
        onBackToAgricultural={() => setView('agricultural')}
        onGoLots={() => setView('production-lots')}
        onGoHome={() => setView('home')}
        onGoUsers={() => setView('users')}
        onGoRoles={() => setView('roles')}
        onGoApprovalPlaces={() => setView('approval-places')}
        onGoCatalog={() => setView('catalog')}
        onGoInspectionsAgenda={() => setView('inspections-agenda')}
        onGoInspectionsHistory={() => setView('inspections-history')}
        onGoReports={() => setView('reports')}
        onLogout={handleLogout}
      />
    );
  } else if (view === 'production-lots') {
    page = (
      <ProductionLotsPage
        sessionUser={sessionUser}
        site={selectedSite}
        onGoResumen={() => setView('production-detail')}
        onGoHome={() => setView('home')}
        onGoUsers={() => setView('users')}
        onGoRoles={() => setView('roles')}
        onGoApprovalPlaces={() => setView('approval-places')}
        onGoCatalog={() => setView('catalog')}
        onGoInspectionsAgenda={() => setView('inspections-agenda')}
        onGoInspectionsHistory={() => setView('inspections-history')}
        onGoReports={() => setView('reports')}
        onLogout={handleLogout}
      />
    );
  } else if (view === 'catalog') {
    page = (
      <CatalogManagementPage
        sessionUser={sessionUser}
        onGoHome={() => setView('home')}
        onGoUsers={() => setView('users')}
        onGoRoles={() => setView('roles')}
        onGoAgricultural={() => setView('agricultural')}
        onGoApprovalPlaces={() => setView('approval-places')}
        onGoInspectionsAgenda={() => setView('inspections-agenda')}
        onGoInspectionsHistory={() => setView('inspections-history')}
        onGoReports={() => setView('reports')}
        onLogout={handleLogout}
      />
    );
  } else if (view === 'inspections-agenda') {
    page = (
      <InspectionAgendaPage
        sessionUser={sessionUser}
        onGoHome={() => setView('home')}
        onGoUsers={() => setView('users')}
        onGoRoles={() => setView('roles')}
        onGoAgricultural={() => setView('agricultural')}
        onGoCatalog={() => setView('catalog')}
        onGoApprovalPlaces={() => setView('approval-places')}
        onGoInspectionHistory={() => setView('inspections-history')}
        onGoReports={() => setView('reports')}
        onStartInspectionProcess={() => setView('inspection-process')}
        onLogout={handleLogout}
      />
    );
  } else if (view === 'inspections-history') {
    page = (
      <InspectionHistoryPage
        sessionUser={sessionUser}
        onGoHome={() => setView('home')}
        onGoUsers={() => setView('users')}
        onGoRoles={() => setView('roles')}
        onGoAgricultural={() => setView('agricultural')}
        onGoCatalog={() => setView('catalog')}
        onGoApprovalPlaces={() => setView('approval-places')}
        onGoInspectionsAgenda={() => setView('inspections-agenda')}
        onGoReports={() => setView('reports')}
        onLogout={handleLogout}
      />
    );
  } else if (view === 'inspection-process') {
    page = (
      <InspectionProcessPage
        sessionUser={sessionUser}
        onGoHome={() => setView('home')}
        onGoUsers={() => setView('users')}
        onGoRoles={() => setView('roles')}
        onGoAgricultural={() => setView('agricultural')}
        onGoCatalog={() => setView('catalog')}
        onGoApprovalPlaces={() => setView('approval-places')}
        onGoInspectionsAgenda={() => setView('inspections-agenda')}
        onGoInspectionsHistory={() => setView('inspections-history')}
        onGoReports={() => setView('reports')}
        onLogout={handleLogout}
        onBack={() => setView('inspections-agenda')}
        onFinish={() => setView('inspections-history')}
      />
    );
  } else if (view === 'reports') {
    page = (
      <ReportsPage
        sessionUser={sessionUser}
        onGoHome={() => setView('home')}
        onGoUsers={() => setView('users')}
        onGoRoles={() => setView('roles')}
        onGoAgricultural={() => setView('agricultural')}
        onGoCatalog={() => setView('catalog')}
        onGoApprovalPlaces={() => setView('approval-places')}
        onGoInspectionsAgenda={() => setView('inspections-agenda')}
        onGoInspectionsHistory={() => setView('inspections-history')}
        onLogout={handleLogout}
      />
    );
  } else {
    page = (
      <AdminProductionApprovalPage
        sessionUser={sessionUser}
        onGoHome={() => setView('home')}
        onGoUsers={() => setView('users')}
        onGoRoles={() => setView('roles')}
        onGoAgricultural={() => setView('agricultural')}
        onGoCatalog={() => setView('catalog')}
        onGoApprovalPlaces={() => setView('approval-places')}
        onGoInspectionsAgenda={() => setView('inspections-agenda')}
        onGoInspectionsHistory={() => setView('inspections-history')}
        onGoReports={() => setView('reports')}
        onLogout={handleLogout}
      />
    );
  }

  return <>{page}</>;
}

export default App;
