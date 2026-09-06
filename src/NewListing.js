import { useState } from 'react';

function NewListing({ token, onListingCreated }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [address, setAddress] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    if (!title || !price || !latitude || !longitude) {
      setMessage('Title, price, and location are required');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/v1/listings', {
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
      setLoading(false);

      if (onListingCreated) onListingCreated(data);
    } catch (err) {
      console.error(err);
      setMessage('Could not connect to server');
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '20px auto', padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
      <h2>Post a New Listing</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <input
          type="text"
          placeholder="Title (e.g. Single Room Near Campus)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
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

        <button type="button" onClick={useMyLocation}>
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

        <button type="submit" disabled={loading}>
          {loading ? 'Posting...' : 'Post Listing'}
        </button>
      </form>

      {message && <p style={{ marginTop: '10px' }}>{message}</p>}
    </div>
  );
}

export default NewListing;
