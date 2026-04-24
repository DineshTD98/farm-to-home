import { useNavigate } from 'react-router-dom';

const DeliveryPortal = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  const cards = [
    { icon: '📍', title: 'Active Deliveries', desc: 'View your current assigned deliveries' },
    { icon: '🗺️', title: 'Route Map', desc: 'Optimised route navigation for pickups & drops' },
    { icon: '✅', title: 'Completed', desc: 'History of all completed deliveries' },
    { icon: '💵', title: 'Earnings', desc: 'Track your delivery earnings and bonuses' },
    { icon: '📞', title: 'Contact Buyer', desc: 'Reach out to buyers for delivery updates' },
    { icon: '⭐', title: 'Ratings', desc: 'Your customer ratings and feedback' },
  ];

  return (
    <div className="portal-wrapper">
      <nav className="portal-nav">
        <div className="logo">🌾 Farm2Home</div>
        <div className="user-info">
          <div>
            <div className="user-name">{user.firstName} {user.lastName}</div>
            <div className="user-role">Delivery Agent</div>
          </div>
          <div className="user-avatar" style={{ background: 'linear-gradient(135deg, #f97316, #c2410c)' }}>
            {user.firstName?.[0]}{user.lastName?.[0]}
          </div>
        </div>
        <button className="logout-btn" onClick={handleLogout}>Sign Out</button>
      </nav>

      <div className="portal-content">
        <div className="welcome-banner">
          <div className="welcome-icon">🚚</div>
          <div>
            <h1 className="welcome-title">Ready to deliver, {user.firstName}!</h1>
            <p className="welcome-subtitle">
              Manage your deliveries, track routes, and keep customers happy.
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

export default DeliveryPortal;
