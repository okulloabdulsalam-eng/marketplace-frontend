import { useState, useEffect } from 'react';
import { API_URL } from './config';

const CATEGORY_FIELDS = {
  'Phones & Tablets': ['brand', 'storage', 'ram'],
  'Smartphones': ['brand', 'storage', 'ram'],
  'Tablets': ['brand', 'storage', 'ram'],
  'Vehicles': ['make', 'model', 'year', 'mileage'],
  'Cars': ['make', 'model', 'year', 'mileage'],
  'Motorcycles': ['make', 'model', 'year', 'mileage'],
  'Property': ['bedrooms', 'bathrooms', 'furnished'],
  'Rooms for Rent': ['bedrooms', 'bathrooms', 'furnished'],
  'Apartments': ['bedrooms', 'bathrooms', 'furnished'],
};

const FIELD_LABELS = {
  brand: 'Brand (e.g. Samsung, Apple)',
  storage: 'Storage (e.g. 128GB)',
  ram: 'RAM (e.g. 8GB)',
  make: 'Make (e.g. Toyota)',
  model: 'Model (e.g. Corolla)',
  year: 'Year',
  mileage: 'Mileage (km)',
  bedrooms: 'Bedrooms',
  bathrooms: 'Bathrooms',
  furnished: 'Furnished? (Yes/No)',
};

function NewListing({ token, onListingCreated }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [address, setAddress] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [condition, setCondition] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [categories, setCategories] = useState([]);
  const [extraFields, setExtraFields] = useState({});
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch(`${API_URL}/api/v1/categories`)
      .then((r) => r.json())
      .then(setCategories)
      .catch(() => {});
  }, []);

  const flatCategories = categories.flatMap((main) => [
    { id: main.id, name: main.name, isMain: true },
    ...(main.subcategories || []).map((sub) => ({ id: sub.id, name: `— ${sub.name}`, isMain: false })),
  ]);

  const selectedCategoryName = (() => {
    const found = flatCategories.find((c) => c.id === Number(categoryId));
    return found ? found.name.replace('— ', '') : null;
  })();

  const dynamicFields = CATEGORY_FIELDS[selectedCategoryName] || [];

  const useMyLocation = () => {
    if (!navigator.geolocation) {
      setMessage('Geolocation not supported by your browser');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLatitude(pos.coords.latitude.toFixed(6));
        setLongitude(pos.coords.longitude.toFixed(6));
        setMessage('Location captured!');
      },
      () => setMessage('Could not get your location — enter it manually')
    );
  };

  const handleFieldChange = (key, value) => {
    setExtraFields((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    if (!title || !price || !latitude || !longitude) {
      setMessage('Title, price, and location are required');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/v1/listings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          description,
          price: Number(price),
          address,
          latitude: Number(latitude),
          longitude: Number(longitude),
          category_id: categoryId || null,
          condition: condition || null,
          attributes: extraFields,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error || 'Something went wrong');
        setLoading(false);
        return;
      }

      setMessage('Listing posted successfully!');
      setTitle('');
      setDescription('');
      setPrice('');
      setAddress('');
      setLatitude('');
      setLongitude('');
      setCondition('');
      setCategoryId('');
      setExtraFields({});
      setLoading(false);

      if (onListingCreated) onListingCreated(data);
    } catch (err) {
      console.error(err);
      setMessage('Could not connect to server');
      setLoading(false);
    }
  };

  return (
    <div className="card-panel">
      <h2>Post a New Listing</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} required>
          <option value="">Select a category</option>
          {flatCategories.map((cat) => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>

        <input
          type="text"
          placeholder="Title (e.g. Single Room Near Campus)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        {/* Category-specific fields appear here automatically */}
        {dynamicFields.map((field) => (
          <input
            key={field}
            type="text"
            placeholder={FIELD_LABELS[field] || field}
            value={extraFields[field] || ''}
            onChange={(e) => handleFieldChange(field, e.target.value)}
          />
        ))}

        {dynamicFields.length > 0 && (
          <select value={condition} onChange={(e) => setCondition(e.target.value)}>
            <option value="">Condition</option>
            <option value="new">New</option>
            <option value="used">Used</option>
            <option value="refurbished">Refurbished</option>
          </select>
        )}

        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
        />
        <input
          type="number"
          placeholder="Price (UGX)"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Address (e.g. Wandegeya, Kampala)"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        />

        <button type="button" onClick={useMyLocation} className="btn-secondary">
          📍 Use My Current Location
        </button>

        <div style={{ display: 'flex', gap: '10px' }}>
          <input
            type="number"
            step="any"
            placeholder="Latitude"
            value={latitude}
            onChange={(e) => setLatitude(e.target.value)}
            required
          />
          <input
            type="number"
            step="any"
            placeholder="Longitude"
            value={longitude}
            onChange={(e) => setLongitude(e.target.value)}
            required
          />
        </div>

        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? 'Posting...' : 'Post Listing'}
        </button>
      </form>

      {message && <p style={{ marginTop: '10px' }}>{message}</p>}
    </div>
  );
}

export default NewListing;
