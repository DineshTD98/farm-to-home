import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import AdminNavbar from '../../components/admin/AdminNavbar';

const AdminPortal = () => {
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);

  const cards = [
    { icon: '👥', title: 'All Users', desc: 'Manage farmers, buyers and delivery agents', path: '/admin/users' },
    { icon: '📦', title: 'All Orders', desc: 'Monitor and manage all platform orders', path: '/admin/orders' },
    { icon: '📊', title: 'Analytics', desc: 'Platform-wide analytics and reports', path: '/admin/analytics' },
    { icon: '🏷️', title: 'Listings', desc: 'Review and moderate crop listings', path: '/admin/listings' },
    { icon: '💳', title: 'Payments', desc: 'Oversee all transactions and payouts', path: '/admin/payments' },
    { icon: '⚙️', title: 'Settings', desc: 'Platform configuration and settings', path: '/admin/settings' },
  ];

  return (
    <div className="portal-wrapper !p-0">
      <AdminNavbar />

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
