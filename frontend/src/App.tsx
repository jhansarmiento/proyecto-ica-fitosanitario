import { useEffect, useState } from 'react';
import './App.css';
import HomePage from './pages/HomePage';
import UsersPage from './pages/UsersPage';
import RolesPage from './pages/RolesPage';
import AgriculturalManagementPage, { type ProductionSite } from './pages/AgriculturalManagementPage';
import ProductionPlaceDetailPage from './pages/ProductionPlaceDetailPage';
import ProductionLotsPage from './pages/ProductionLotsPage';
import LoginPage from './pages/LoginPage';

type View = 'login' | 'home' | 'users' | 'roles' | 'agricultural' | 'production-detail' | 'production-lots';

export type SessionUser = {
  nombre: string;
  apellidos: string;
  rol: string;
};

function App() {
  const [view, setView] = useState<View>(() => {
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    return isAuthenticated ? 'home' : 'login';
  });
  const [sessionUser, setSessionUser] = useState<SessionUser>(() => {
    try {
      const stored = localStorage.getItem('sessionUser');
      return stored ? JSON.parse(stored) : { nombre: '', apellidos: '', rol: '' };
    } catch {
      return { nombre: '', apellidos: '', rol: '' };
    }
  });
  const [selectedSite, setSelectedSite] = useState<ProductionSite | null>(null);
  const [isVisible, setIsVisible] = useState(true);

  const handleLoginSuccess = (user: SessionUser) => {
    localStorage.setItem('isAuthenticated', 'true');
    localStorage.setItem('sessionUser', JSON.stringify(user));
    setSessionUser(user);
    setView('home');
  };

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('sessionUser');
    setSessionUser({ nombre: '', apellidos: '', rol: '' });
    setSelectedSite(null);
    setView('login');
  };

  useEffect(() => {
    setIsVisible(false);
    const timer = setTimeout(() => setIsVisible(true), 25);
    return () => clearTimeout(timer);
  }, [view]);

  let page: React.ReactNode;

  if (view === 'login') {
    page = <LoginPage onLoginSuccess={handleLoginSuccess} />;
  } else if (view === 'home') {
    page = (
      <HomePage
        sessionUser={sessionUser}
        onGoUsers={() => setView('users')}
        onGoRoles={() => setView('roles')}
        onGoAgricultural={() => setView('agricultural')}
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
        onLogout={handleLogout}
      />
    );
  } else {
    page = (
      <UsersPage
        sessionUser={sessionUser}
        onGoHome={() => setView('home')}
        onGoRoles={() => setView('roles')}
        onGoAgricultural={() => setView('agricultural')}
        onLogout={handleLogout}
      />
    );
  }

  return (
    <div className={`transition-opacity duration-100 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
      {page}
    </div>
  );
}

export default App;
