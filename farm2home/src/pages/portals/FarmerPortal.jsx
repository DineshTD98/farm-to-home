import { useNavigate } from 'react-router-dom';

const FarmerPortal = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  const cards = [
    { icon: '🌾', title: 'My Products', desc: 'Manage your crop listings and inventory' },
    { icon: '📦', title: 'Orders', desc: 'View and manage incoming buyer orders' },
    { icon: '💰', title: 'Earnings', desc: 'Track your sales and payment history' },
    { icon: '📊', title: 'Analytics', desc: 'Insights on your farm performance' },
    { icon: '🌤️', title: 'Weather', desc: 'Local weather forecasts for your farm' },
    { icon: '🤝', title: 'Support', desc: 'Get help and connect with experts' },
  ];

  return (
    <div className="portal-wrapper">
      <nav className="portal-nav">
        <div className="logo">🌾 Farm2Home</div>
        <div className="user-info">
          <div>
            <div className="user-name">{user.firstName} {user.lastName}</div>
            <div className="user-role">Farmer</div>
          </div>
          <button
            type="button"
            className="user-avatar"
            onClick={() => navigate('/farmer/settings')}
            title="Go to settings"
            aria-label="Go to settings"
          >
            {user.firstName?.[0]}{user.lastName?.[0]}
          </button>
        </div>
        <button className="logout-btn" onClick={handleLogout}>Sign Out</button>
      </nav>

      <div className="portal-content">
        <div className="welcome-banner">
          <div className="welcome-icon">🧑‍🌾</div>
          <div>
            <h1 className="welcome-title">Welcome back, {user.firstName}!</h1>
            <p className="welcome-subtitle">
              Manage your crops, track orders, and grow your farming business.
            </p>
          </div>
        </div>

        <div className="portal-cards">
          {cards.map((card) => (
            <div className="portal-card" key={card.title}>
              <span className="card-icon">{card.icon}</span>
              <div className="card-title">{card.title}</div>
              <div className="card-desc">{card.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FarmerPortal;
