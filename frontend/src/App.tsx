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

function App() {
  const [view, setView] = useState<View>(() => {
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    return isAuthenticated ? 'home' : 'login';
  });
  const [selectedSite, setSelectedSite] = useState<ProductionSite | null>(null);
  const [isVisible, setIsVisible] = useState(true);

  const handleLoginSuccess = () => {
    localStorage.setItem('isAuthenticated', 'true');
    setView('home');
  };

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
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
        onGoUsers={() => setView('users')}
        onGoRoles={() => setView('roles')}
        onGoAgricultural={() => setView('agricultural')}
        onLogout={handleLogout}
      />
    );
  } else if (view === 'roles') {
    page = (
      <RolesPage
        onGoHome={() => setView('home')}
        onGoUsers={() => setView('users')}
        onGoAgricultural={() => setView('agricultural')}
        onLogout={handleLogout}
      />
    );
  } else if (view === 'agricultural') {
    page = (
      <AgriculturalManagementPage
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
