import { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { API_URL } from '../config';

function CategoryPage({ category, onBack, onSelectListing }) {
  const [listings, setListings] = useState([]);
  const [activeSubId, setActiveSubId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/api/v1/listings`)
      .then((r) => r.json())
      .then((data) => {
        setListings(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const relevantIds = category
    ? [category.id, ...(category.subcategories || []).map((s) => s.id)]
    : null;

  const filtered = listings.filter((l) => {
    if (activeSubId) return l.category_id === activeSubId;
    if (relevantIds) return relevantIds.includes(l.category_id);
    return true;
  });

  return (
    <div>
      <button className="back-btn" onClick={onBack}>
        <ArrowLeft size={20} /> Back
      </button>

      <h2 style={{ margin: '0 0 14px 0' }}>{category ? category.name : 'Trending'}</h2>

      {category && category.subcategories && category.subcategories.length > 0 && (
        <div className="category-chips">
          <button
            className={`chip ${activeSubId === null ? 'chip-active' : ''}`}
            onClick={() => setActiveSubId(null)}
          >
            All
          </button>
          {category.subcategories.map((sub) => (
            <button
              key={sub.id}
              className={`chip ${activeSubId === sub.id ? 'chip-active' : ''}`}
              onClick={() => setActiveSubId(sub.id)}
            >
              {sub.name}
            </button>
          ))}
        </div>
      )}

      {loading && <p className="empty-state">Loading...</p>}
      {!loading && filtered.length === 0 && (
        <p className="empty-state">No listings in this category yet.</p>
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

export default CategoryPage;
