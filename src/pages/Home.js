import { useState, useEffect } from 'react';
import {
  Search, MapPin, PlusCircle, Flame, Car, Building2, Smartphone,
  Tv, Sofa, Shirt, Wrench, UtensilsCrossed, Briefcase, Sparkles, Grid3x3
} from 'lucide-react';
import { API_URL } from '../config';

const ICONS = {
  'Vehicles': Car,
  'Property': Building2,
  'Phones & Tablets': Smartphone,
  'Electronics': Tv,
  'Home, Furniture & Appliances': Sofa,
  'Fashion': Shirt,
  'Services': Wrench,
  'Food & Restaurants': UtensilsCrossed,
  'Jobs': Briefcase,
  'Beauty & Personal Care': Sparkles,
};

function Home({ onSelectListing, onSelectCategory, onPostAd, canPost }) {
  const [listings, setListings] = useState([]);
  const [categories, setCategories] = useState([]);
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

  const filtered = query
    ? listings.filter((l) => l.title.toLowerCase().includes(query.toLowerCase()))
    : listings;

  return (
    <div>
      <div className="location-bar">
        <MapPin size={15} />
        <span>Kampala, Uganda</span>
      </div>

      <div className="search-bar">
        <Search size={18} className="search-icon" />
        <input
          type="text"
          placeholder="Search rooms, food, electronics..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {/* Jiji-style category grid */}
      <div className="jiji-grid">
        {canPost && (
          <button className="jiji-tile jiji-tile-post" onClick={onPostAd}>
            <div className="jiji-tile-icon jiji-tile-icon-post"><PlusCircle size={24} /></div>
            <span>Post Ad</span>
          </button>
        )}

        <button className="jiji-tile" onClick={() => onSelectCategory(null)}>
          <div className="jiji-tile-icon jiji-tile-icon-trending"><Flame size={22} /></div>
          <span>Trending</span>
        </button>

        {categories.map((cat) => {
          const Icon = ICONS[cat.name] || Grid3x3;
          return (
            <button key={cat.id} className="jiji-tile" onClick={() => onSelectCategory(cat)}>
              <div className="jiji-tile-icon"><Icon size={22} /></div>
              <span>{cat.name}</span>
            </button>
          );
        })}
      </div>

      <h3 className="section-title">
        {query ? `Results for "${query}"` : 'Trending ads'}
      </h3>

      {loading && <p className="empty-state">Loading listings...</p>}
      {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}
      {!loading && !error && filtered.length === 0 && (
        <p className="empty-state">No listings found.</p>
      )}

      <div className="listings-grid">
        {filtered.map((listing) => (
          <div key={listing.id} className="listing-card" onClick={() => onSelectListing(listing.id)}>
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
