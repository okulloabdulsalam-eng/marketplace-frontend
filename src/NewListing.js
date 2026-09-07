import { useState, useEffect } from 'react';
import { API_URL } from './config';

const CATEGORY_FIELDS = {
  'Phones & Tablets': ['brand', 'storage', 'ram'],
  'Smartphones': ['brand', 'storage', 'ram'],
  'Tablets': ['brand', 'storage', 'ram'],
  'Phone Accessories': ['brand'],
  'Vehicles': ['make', 'model', 'year', 'mileage'],
  'Cars': ['make', 'model', 'year', 'mileage'],
  'Motorcycles': ['make', 'model', 'year', 'mileage'],
  'Bicycles': ['brand'],
  'Property': ['bedrooms', 'bathrooms', 'furnished'],
  'Rooms for Rent': ['bedrooms', 'bathrooms', 'furnished'],
  'Apartments': ['bedrooms', 'bathrooms', 'furnished'],
  'Hostels': ['bedrooms', 'furnished'],
  'Land': ['size_acres'],
  'Electronics': ['brand'],
  'Laptops & Computers': ['brand', 'storage', 'ram'],
  'TVs': ['brand', 'screen_size'],
  'Audio & Speakers': ['brand'],
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
  size_acres: 'Land size (acres)',
  screen_size: 'Screen size (inches)',
};

function NewListing({ token, onListingCreated }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [address, setAddress] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [condition, setCondition] = useState('');
  const [categories, setCategories] = useState([]);
  const [mainCategoryId, setMainCategoryId] = useState('');
  const [subCategoryId, setSubCategoryId] = useState('');
  const [extraFields, setExtraFields] = useState({});
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    fetch(`${API_URL}/api/v1/categories`)
      .then((r) => r.json())
      .then(setCategories)
      .catch(() => {});
  }, []);

  const selectedMainCategory = categories.find((c) => c.id === Number(mainCategoryId));
  const subcategories = selectedMainCategory?.subcategories || [];

  const effectiveCategoryName = subCategoryId
    ? subcategories.find((s) => s.id === Number(subCategoryId))?.name
    : selectedMainCategory?.name;

  const dynamicFields = CATEGORY_FIELDS[effectiveCategoryName] || [];
  const finalCategoryId = subCategoryId || mainCategoryId || null;

  const handleMainCategoryChange = (value) => {
    setMainCategoryId(value);
    setSubCategoryId('');
    setExtraFields({});
  };

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

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const uploadImageToCloudinary = async () => {
    const formData = new FormData();
    formData.append('file', imageFile);
    formData.append('upload_preset', 'marketplace_unsigned');

    const res = await fetch('https://api.cloudinary.com/v1_1/hp4lwn53/image/upload', {
      method: 'POST',
      body: formData,
    });

    const data = await res.json();
    return data.secure_url;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    if (!title || !price || !latitude || !longitude) {
      setMessage('Title, price, and location are required');
      return;
    }

    if (!mainCategoryId) {
      setMessage('Please select a category');
      return;
    }

    setLoading(true);

    let uploadedImageUrl = null;
    if (imageFile) {
      setUploadingImage(true);
      try {
        uploadedImageUrl = await uploadImageToCloudinary();
      } catch (err) {
        console.error(err);
        setMessage('Image upload failed, posting without photo');
      }
      setUploadingImage(false);
    }

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
          category_id: finalCategoryId,
          condition: condition || null,
          attributes: extraFields,
          image_url: uploadedImageUrl,
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
      setMainCategoryId('');
      setSubCategoryId('');
      setExtraFields({});
      setImageFile(null);
      setImagePreview(null);
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

        <select value={mainCategoryId} onChange={(e) => handleMainCategoryChange(e.target.value)} required>
          <option value="">1. Select a category</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>

        {subcategories.length > 0 && (
          <select value={subCategoryId} onChange={(e) => setSubCategoryId(e.target.value)}>
            <option value="">2. Choose a subcategory (optional)</option>
            {subcategories.map((sub) => (
              <option key={sub.id} value={sub.id}>{sub.name}</option>
            ))}
          </select>
        )}

        <div>
          <label style={{ fontSize: '14px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
            Photo
          </label>
          {imagePreview && (
            <img
              src={imagePreview}
              alt="preview"
              style={{ width: '100%', height: '160px', objectFit: 'cover', borderRadius: '10px', marginBottom: '8px' }}
            />
          )}
          <input type="file" accept="image/*" onChange={handleImageChange} />
        </div>

        <input
          type="text"
          placeholder="Title (e.g. Single Room Near Campus)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

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
          {uploadingImage ? 'Uploading photo...' : loading ? 'Posting...' : 'Post Listing'}
        </button>
      </form>

      {message && <p style={{ marginTop: '10px' }}>{message}</p>}
    </div>
  );
}

export default NewListing;
