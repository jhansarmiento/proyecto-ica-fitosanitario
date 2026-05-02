import { useState } from 'react';
import './App.css';
import HomePage from './pages/HomePage';
import UsersPage from './pages/UsersPage';

type View = 'home' | 'users';

function App() {
  const [view, setView] = useState<View>('users');

  if (view === 'home') {
    return <HomePage onGoUsers={() => setView('users')} />;
  }

  return <UsersPage onGoHome={() => setView('home')} />;
}

export default App;
