import { useState } from 'react';
import './App.css';
import HomePage from './pages/HomePage';
import UsersPage from './pages/UsersPage';
import RolesPage from './pages/RolesPage';

type View = 'home' | 'users' | 'roles';

function App() {
  const [view, setView] = useState<View>('users');

  if (view === 'home') {
    return <HomePage onGoUsers={() => setView('users')} onGoRoles={() => setView('roles')} />;
  }

  if (view === 'roles') {
    return <RolesPage onGoHome={() => setView('home')} onGoUsers={() => setView('users')} />;
  }

  return <UsersPage onGoHome={() => setView('home')} onGoRoles={() => setView('roles')} />;
}

export default App;
