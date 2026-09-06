import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { API_URL } from '../config';

function Home() {
  const [listings, setListings] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`${API_URL}/api/v1/categories`)
      .then((r) => r.json())
      .then(setCategories)
      .catch(() => {});

    fetch(`${API_URL}/api/v1/listings`)
      .then((r) => r.json())
      .then((data) => {
        setListings(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError('Could not load listings.');
        setLoading(false);
      });
  }, []);

  const filtered = listings.filter((l) => {
    const matchesCategory = activeCategory ? l.category_id === activeCategory : true;
    const matchesQuery = query ? l.title.toLowerCase().includes(query.toLowerCase()) : true;
    return matchesCategory && matchesQuery;
  });

  return (
    <div>
      <div className="search-bar">
        <Search size={18} className="search-icon" />
        <input
          type="text"
          placeholder="Search rooms, food, electronics..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <div className="category-chips">
        <button
          className={`chip ${activeCategory === null ? 'chip-active' : ''}`}
          onClick={() => setActiveCategory(null)}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            className={`chip ${activeCategory === cat.id ? 'chip-active' : ''}`}
            onClick={() => setActiveCategory(cat.id)}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {loading && <p className="empty-state">Loading listings...</p>}
      {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}
      {!loading && !error && filtered.length === 0 && (
        <p className="empty-state">No listings found. Try a different search.</p>
      )}

      <div className="listings-grid">
        {filtered.map((listing) => (
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
    </div>
  );
}

export default Home;
