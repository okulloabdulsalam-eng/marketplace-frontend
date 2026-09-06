import { Home, PlusSquare, User } from 'lucide-react';

function BottomNav({ activeTab, setActiveTab, canPost }) {
  return (
    <nav className="bottom-nav">
      <button
        className={`nav-item ${activeTab === 'home' ? 'active' : ''}`}
        onClick={() => setActiveTab('home')}
      >
        <Home size={22} />
        <span>Home</span>
      </button>

      {canPost && (
        <button
          className={`nav-item nav-item-post ${activeTab === 'post' ? 'active' : ''}`}
          onClick={() => setActiveTab('post')}
        >
          <PlusSquare size={26} />
          <span>Post</span>
        </button>
      )}

      <button
        className={`nav-item ${activeTab === 'account' ? 'active' : ''}`}
        onClick={() => setActiveTab('account')}
      >
        <User size={22} />
        <span>Account</span>
      </button>
    </nav>
  );
}

export default BottomNav;
