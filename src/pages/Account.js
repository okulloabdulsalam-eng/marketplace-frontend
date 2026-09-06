import { LogOut, Mail, Phone } from 'lucide-react';

function Account({ user, onLogout }) {
  const initial = (user.name || user.email || '?')[0].toUpperCase();

  return (
    <div className="account-page">
      <div className="account-avatar">{initial}</div>
      <h2>{user.name || 'User'}</h2>
      <span className="account-role-badge">
        {user.role === 'seller' ? '🏪 Seller' : '🛍️ Buyer'}
      </span>

      <div className="account-info-box">
        <div className="account-info-row">
          <Mail size={16} />
          <span>{user.email}</span>
        </div>
        {user.phone && (
          <div className="account-info-row">
            <Phone size={16} />
            <span>{user.phone}</span>
          </div>
        )}
      </div>

      <button className="btn-primary logout-btn" onClick={onLogout}>
        <LogOut size={18} /> Log Out
      </button>
    </div>
  );
}

export default Account;
