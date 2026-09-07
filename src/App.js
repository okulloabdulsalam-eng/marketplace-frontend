import { useState } from 'react';
import Auth from './Auth';
import NewListing from './NewListing';
import Home from './pages/Home';
import Account from './pages/Account';
import ListingDetail from './pages/ListingDetail';
import CategoryPage from './pages/CategoryPage';
import BottomNav from './components/BottomNav';
import './App.css';

function App() {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [activeTab, setActiveTab] = useState('home');
  const [selectedListingId, setSelectedListingId] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(undefined); // undefined = not browsing a category

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
    setSelectedCategory(undefined);
  };

  const goToTab = (tab) => {
    setSelectedListingId(null);
    setSelectedCategory(undefined);
    setActiveTab(tab);
  };

  const showHome = activeTab === 'home' && selectedCategory === undefined && !selectedListingId;
  const showCategory = activeTab === 'home' && selectedCategory !== undefined && !selectedListingId;
  const showDetail = activeTab === 'home' && !!selectedListingId;

  return (
    <div className="App">
      <header className="App-header">
        <h1>🎓 Campus Marketplace</h1>
      </header>

      <main className="app-main">
        {!user && <Auth onLogin={handleLogin} />}

        {user && showHome && (
          <Home
            onSelectListing={setSelectedListingId}
            onSelectCategory={setSelectedCategory}
            onPostAd={() => setActiveTab('post')}
            canPost={user.role === 'seller'}
          />
        )}

        {user && showCategory && (
          <CategoryPage
            category={selectedCategory}
            onBack={() => setSelectedCategory(undefined)}
            onSelectListing={setSelectedListingId}
          />
        )}

        {user && showDetail && (
          <ListingDetail listingId={selectedListingId} onBack={() => setSelectedListingId(null)} />
        )}

        {user && activeTab === 'post' && user.role === 'seller' && (
          <NewListing token={token} onListingCreated={handleListingCreated} />
        )}

        {user && activeTab === 'account' && (
          <Account user={user} onLogout={handleLogout} />
        )}
      </main>

      {user && (
        <BottomNav activeTab={activeTab} setActiveTab={goToTab} canPost={user.role === 'seller'} />
      )}
    </div>
  );
}

export default App;
