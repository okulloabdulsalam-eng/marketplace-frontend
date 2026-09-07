import { useState, useEffect } from 'react';
import { ArrowLeft, MapPin, Phone, Mail, MessageCircle } from 'lucide-react';
import { API_URL } from '../config';

function ListingDetail({ listingId, onBack }) {
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`${API_URL}/api/v1/listings/${listingId}`)
      .then((res) => res.json())
      .then((data) => {
        setListing(data);
        setLoading(false);
      })
      .catch(() => {
        setError('Could not load this listing.');
        setLoading(false);
      });
  }, [listingId]);

  if (loading) return <p className="empty-state">Loading...</p>;
  if (error || !listing) return <p className="empty-state">{error || 'Listing not found.'}</p>;

  const cleanPhone = listing.seller_phone ? listing.seller_phone.replace(/\D/g, '') : '';
  const whatsappLink = 'https://wa.me/' + cleanPhone;
  const callLink = 'tel:' + listing.seller_phone;
  const emailLink = 'mailto:' + listing.seller_email;

  return (
    <div className="detail-page">
      <button className="back-btn" onClick={onBack}>
        <ArrowLeft size={20} /> Back
      </button>

      <div className="detail-image">
        {listing.image_url ? (
          <img src={listing.image_url} alt={listing.title} />
        ) : (
          <span>No Photo</span>
        )}
      </div>

      <div className="detail-body">
        <h2>{listing.title}</h2>
        <p className="detail-price">UGX {Number(listing.price).toLocaleString()}</p>

        <div className="detail-row">
          <MapPin size={16} />
          <span>{listing.address}</span>
        </div>

        {listing.description && (
          <div className="detail-section">
            <h4>Description</h4>
            <p>{listing.description}</p>
          </div>
        )}

        <div className="detail-section">
          <h4>Seller</h4>
          <p style={{ fontWeight: 600 }}>{listing.seller_name}</p>
        </div>

        <div className="contact-buttons">
          {listing.seller_phone && (
            <a href={callLink} className="btn-primary contact-btn">
              <Phone size={18} /> Call Seller
            </a>
          )}
          {listing.seller_phone && (
            <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="btn-secondary contact-btn">
              <MessageCircle size={18} /> WhatsApp
            </a>
          )}
          <a href={emailLink} className="contact-btn-outline">
            <Mail size={18} /> Email Seller
          </a>
        </div>
      </div>
    </div>
  );
}

export default ListingDetail;
