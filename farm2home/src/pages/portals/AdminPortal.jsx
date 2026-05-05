import { useNavigate } from 'react-router-dom';

const AdminPortal = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  const cards = [
    { icon: '👥', title: 'All Users', desc: 'Manage farmers, buyers and delivery agents', path: '/admin/users' },
    { icon: '📦', title: 'All Orders', desc: 'Monitor and manage all platform orders', path: '/admin/orders' },
    { icon: '📊', title: 'Analytics', desc: 'Platform-wide analytics and reports', path: '/admin/analytics' },
    { icon: '🏷️', title: 'Listings', desc: 'Review and moderate crop listings', path: '/admin/listings' },
    { icon: '💳', title: 'Payments', desc: 'Oversee all transactions and payouts', path: '/admin/payments' },
    { icon: '⚙️', title: 'Settings', desc: 'Platform configuration and settings', path: '/admin/settings' },
  ];

  return (
    <div className="portal-wrapper">
      <nav className="portal-nav">
        <div className="logo">🌾 Farm2Home</div>
        <div className="user-info">
          <div>
            <div className="user-name">{user.firstName} {user.lastName}</div>
            <div className="user-role">Administrator</div>
          </div>
          <div className="user-avatar" style={{ background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)' }}>
            {user.firstName?.[0]}{user.lastName?.[0]}
          </div>
        </div>
        <button className="logout-btn" onClick={handleLogout}>Sign Out</button>
      </nav>

      <div className="portal-content">
        <div className="welcome-banner">
          <div className="welcome-icon">⚙️</div>
          <div>
            <h1 className="welcome-title">Admin Dashboard, {user.firstName}</h1>
            <p className="welcome-subtitle">
              Full control of the Farm2Home platform — users, orders, and analytics.
            </p>
          </div>
        </div>

        <div className="portal-cards">
          {cards.map((card) => (
            <div 
              className="portal-card cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all" 
              key={card.title}
              onClick={() => card.path && navigate(card.path)}
            >
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

export default AdminPortal;
