import { useState } from 'react';
import Auth from './Auth';
import NewListing from './NewListing';
import Home from './pages/Home';
import Account from './pages/Account';
import BottomNav from './components/BottomNav';
import './App.css';

function App() {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [activeTab, setActiveTab] = useState('home');

  const handleLogin = (userData, userToken) => {
    setUser(userData);
    setToken(userToken);
    setActiveTab('home');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setToken(null);
  };

  const handleListingCreated = () => {
    setActiveTab('home');
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>🎓 Campus Marketplace</h1>
      </header>

      <main className="app-main">
        {!user && <Auth onLogin={handleLogin} />}

        {user && activeTab === 'home' && <Home />}

        {user && activeTab === 'post' && user.role === 'seller' && (
          <NewListing token={token} onListingCreated={handleListingCreated} />
        )}

        {user && activeTab === 'account' && (
          <Account user={user} onLogout={handleLogout} />
        )}
      </main>

      {user && (
        <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} canPost={user.role === 'seller'} />
      )}
    </div>
  );
}

export default App;
