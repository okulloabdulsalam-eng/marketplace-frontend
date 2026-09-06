import { useState, useEffect } from 'react';
import Auth from './Auth';
import NewListing from './NewListing';
import './App.css';
import { API_URL } from './config';

function App() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('token'));

  const loadListings = () => {
    setLoading(true);
    fetch(`${API_URL}/api/v1/listings`)
      .then((res) => res.json())
      .then((data) => {
        setListings(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError('Could not load listings. Is the backend running?');
        setLoading(false);
      });
  };

  useEffect(() => {
    loadListings();
  }, []);

  const handleLogin = (userData, userToken) => {
    setUser(userData);
    setToken(userToken);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setToken(null);
  };

  const handleListingCreated = () => {
    loadListings();
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>🎓 Campus Marketplace</h1>
        {user && (
          <div style={{ textAlign: 'right' }}>
            <p>Logged in as {user.name || user.email} ({user.role})</p>
            <button onClick={handleLogout}>Log Out</button>
          </div>
        )}
      </header>

      {!user && <Auth onLogin={handleLogin} />}

      {user && user.role === 'seller' && (
        <NewListing token={token} onListingCreated={handleListingCreated} />
      )}

      <main>
        {loading && <p className="empty-state">Loading listings...</p>}
        {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}

        {!loading && !error && listings.length === 0 && (
          <p className="empty-state">No listings yet. Be the first to post one!</p>
        )}

        <div className="listings-grid">
          {listings.map((listing) => (
            <div key={listing.id} className="listing-card">
              <div className="listing-image">
                {listing.image_url ? (
                  <img src={listing.image_url} alt={listing.title} />
                ) : (
                  <span>No Photo</span>
                )}
              </div>
              <div className="listing-card-body">
                <h3>{listing.title}</h3>
                <p className="listing-price">UGX {Number(listing.price).toLocaleString()}</p>
                <p className="listing-address">📍 {listing.address}</p>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

export default App;
