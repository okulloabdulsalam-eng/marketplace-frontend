import { useState, useEffect } from 'react';
import { API_URL } from './config';
import DynamicField from './components/DynamicField';

const CONDITIONS = ['Brand New', 'Like New', 'Excellent', 'Good', 'Fair', 'Used', 'Refurbished', 'For Parts'];

function NewListing({ token, onListingCreated }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [address, setAddress] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [condition, setCondition] = useState('');
  const [categories, setCategories] = useState([]);
  const [path, setPath] = useState([]); // array of chosen category objects, root to leaf
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

  // At each level, the options are: root categories, or the subcategories of the last chosen item
  const levelOptions = (levelIndex) => {
    if (levelIndex === 0) return categories;
    const parent = path[levelIndex - 1];
    return parent?.subcategories || [];
  };

  const handleSelectAtLevel = (levelIndex, categoryId) => {
    const options = levelOptions(levelIndex);
    const chosen = options.find((c) => c.id === Number(categoryId));
    const newPath = path.slice(0, levelIndex);
    if (chosen) newPath.push(chosen);
    setPath(newPath);
    setExtraFields({});
  };

  // The deepest chosen category determines which schema to show
  const currentCategory = path[path.length - 1];
  const attributeSchema = currentCategory?.attribute_schema || [];
  const finalCategoryId = currentCategory?.id || null;

  // How many dropdown levels to render: one for root, plus one per level that has subcategories
  const numLevels = path.length + (currentCategory?.subcategories?.length > 0 || path.length === 0 ? 1 : 0);


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

    if (path.length === 0) {
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
      setPath([]);
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

        {Array.from({ length: numLevels }).map((_, levelIndex) => {
          const options = levelOptions(levelIndex);
          if (!options || options.length === 0) return null;
          const currentValue = path[levelIndex]?.id || '';
          return (
            <select
              key={levelIndex}
              value={currentValue}
              onChange={(e) => handleSelectAtLevel(levelIndex, e.target.value)}
              required={levelIndex === 0}
            >
              <option value="">
                {levelIndex === 0 ? 'Select a category' : 'Choose subcategory (optional)'}
              </option>
              {options.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          );
        })}

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

        {attributeSchema.map((field) => (
          <DynamicField
            key={field.key}
            field={field}
            value={extraFields[field.key]}
            onChange={handleFieldChange}
          />
        ))}

        {attributeSchema.length > 0 && (
          <select value={condition} onChange={(e) => setCondition(e.target.value)}>
            <option value="">Condition</option>
            {CONDITIONS.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
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

