import { useState, useEffect } from 'react';
import { getCurrentUser } from './services/auth';
import LoginPage from './pages/LoginPage';
import ChatPage from './pages/ChatPage';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    getCurrentUser()
      .then(() => setIsAuthenticated(true))
      .catch(() => setIsAuthenticated(false))
      .finally(() => setChecking(false));
  }, []);

  if (checking) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-blue-400 text-xl animate-pulse">Loading AI Security Platform...</div>
      </div>
    );
  }

  return isAuthenticated
    ? <ChatPage onLogout={() => setIsAuthenticated(false)} />
    : <LoginPage onLogin={() => setIsAuthenticated(true)} />;
}

export default App;
