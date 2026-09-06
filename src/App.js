import { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('http://localhost:5000/api/v1/listings')
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
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <h1>Campus Marketplace</h1>
      </header>

      <main style={{ padding: '20px' }}>
        {loading && <p>Loading listings...</p>}
        {error && <p style={{ color: 'red' }}>{error}</p>}

        {!loading && !error && listings.length === 0 && (
          <p>No listings yet. Be the first to post one!</p>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '16px' }}>
          {listings.map((listing) => (
            <div
              key={listing.id}
              style={{
                border: '1px solid #ddd',
                borderRadius: '8px',
                padding: '16px',
                textAlign: 'left',
              }}
            >
              <h3>{listing.title}</h3>
              <p>{listing.description}</p>
              <p><strong>UGX {Number(listing.price).toLocaleString()}</strong></p>
              <p style={{ fontSize: '14px', color: '#666' }}>{listing.address}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

export default App;
