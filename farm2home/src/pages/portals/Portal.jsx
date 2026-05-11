import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useTheme } from '../../context/ThemeContext';
import { selectCurrentUser, logout } from '../../redux/slices/authSlice';
import { selectCartItems } from '../../redux/slices/cartSlice';
import { selectUnreadCount } from '../../redux/slices/chatSlice';
import { getNotifications, markNotificationRead } from '../../api/notifications';
import { useTranslation } from 'react-i18next';
import { getUserAvatarUrl } from '../../utils/avatarUrl';
import i18n from '../../i18n';

const portalConfig = {
  farmer: {
    emoji: '🧑‍🌾',
    label: 'Farmer',
    welcome: 'Manage your crops, track orders, and grow your farming business.',
    avatarGradient: 'from-green-400 to-emerald-600',
    accentColor: '#16a34a', // Fresh Green
    cards: [
      { icon: '🌾', title: 'My Crops', desc: 'Manage crop listings and inventory' },
      { icon: '📦', title: 'Orders', desc: 'View and manage incoming buyer orders' },
      { icon: '💰', title: 'Earnings', desc: 'Track your sales and payment history' },
      { icon: '📊', title: 'Analytics', desc: 'Insights on your farm performance' },
      { icon: '⭐', title: 'My Reviews', desc: 'See what buyers are saying about you' },
      { icon: '⚙️', title: 'Settings', desc: 'Manage your profile and account' },
    ],
  },
  buyer: {
    emoji: '🛒',
    label: 'Buyer',
    welcome: 'Discover fresh produce directly from local farmers. Order with confidence.',
    avatarGradient: 'from-amber-400 to-amber-600',
    accentColor: '#fbbc05', // Amber
    cards: [
      { icon: '🛒', title: 'Browse Produce', desc: 'Explore fresh farm produce listings' },
      { icon: '📋', title: 'My Orders', desc: 'Track your current and past orders' },
      { icon: '🔔', title: 'Notifications', desc: 'Delivery updates & alerts' },
      { icon: '💳', title: 'Payments', desc: 'Manage payment methods and history' },
      { icon: '⭐', title: 'Reviews', desc: 'Rate and review your purchases' },
      { icon: '⚙️', title: 'Settings', desc: 'Manage your profile and account' },
    ],
  },
  delivery: {
    emoji: '🚚',
    label: 'Delivery Agent',
    welcome: 'Manage your deliveries, track routes, and keep customers happy.',
    avatarGradient: 'from-amber-400 to-amber-600',
    accentColor: '#fbbc05',
    cards: [
      { icon: '📍', title: 'Active Deliveries', desc: 'Your current assigned deliveries' },
      { icon: '🗺️', title: 'Route Map', desc: 'Optimised route for pickups & drops' },
      { icon: '✅', title: 'Completed', desc: 'History of all completed deliveries' },
      { icon: '💰', title: 'Earnings', desc: 'Track earnings and bonuses' },
      { icon: '📞', title: 'Contact Buyer', desc: 'Reach buyers for delivery updates' },
      { icon: '⭐', title: 'Ratings', desc: 'Customer ratings and feedback' },
    ],
  },
  admin: {
    emoji: '⚙️',
    label: 'Administrator',
    welcome: 'Full control of the Farm2Home platform — users, orders, and analytics.',
    avatarGradient: 'from-amber-400 to-amber-600',
    accentColor: '#fbbc05',
    cards: [
      { icon: '👥', title: 'All Users', desc: 'Manage farmers, buyers and agents' },
      { icon: '📦', title: 'All Orders', desc: 'Monitor and manage all orders' },
      { icon: '📊', title: 'Analytics', desc: 'Platform-wide analytics & reports' },
      { icon: '🏷️', title: 'Listings', desc: 'Review and moderate crop listings' },
      { icon: '💳', title: 'Payments', desc: 'Oversee transactions and payouts' },
      { icon: '⚙️', title: 'Settings', desc: 'Platform configuration & settings' },
    ],
  },
};

const Portal = ({ role }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector(selectCurrentUser) || {};
  const cartItems = useSelector(selectCartItems);
  const unreadChatCount = useSelector(selectUnreadCount);
  const { isDarkMode } = useTheme();
  const { t } = useTranslation();

  const portalConfig = {
    farmer: {
      emoji: '🧑‍🌾',
      label: t('portal.farmer.label'),
      welcome: t('portal.farmer.welcome'),
      avatarGradient: 'from-green-400 to-emerald-600',
      accentColor: '#16a34a',
      cards: [
        { id: 'myCrops', icon: '🌾', title: t('portal.farmer.cards.myCrops.title'), desc: t('portal.farmer.cards.myCrops.desc') },
        { id: 'orders', icon: '📦', title: t('portal.farmer.cards.orders.title'), desc: t('portal.farmer.cards.orders.desc') },
        { id: 'earnings', icon: '💰', title: t('portal.farmer.cards.earnings.title'), desc: t('portal.farmer.cards.earnings.desc') },
        { id: 'analytics', icon: '📊', title: t('portal.farmer.cards.analytics.title'), desc: t('portal.farmer.cards.analytics.desc') },
        { id: 'myReviews', icon: '⭐', title: t('portal.farmer.cards.myReviews.title'), desc: t('portal.farmer.cards.myReviews.desc') },
        { id: 'settings', icon: '⚙️', title: t('portal.farmer.cards.settings.title'), desc: t('portal.farmer.cards.settings.desc') },
      ],
    },
    buyer: {
      emoji: '🛒',
      label: t('portal.buyer.label'),
      welcome: t('portal.buyer.welcome'),
      avatarGradient: 'from-amber-400 to-amber-600',
      accentColor: '#fbbc05',
      cards: [
        { id: 'browseProduce', icon: '🛒', title: t('portal.buyer.cards.browseProduce.title'), desc: t('portal.buyer.cards.browseProduce.desc') },
        { id: 'myOrders', icon: '📋', title: t('portal.buyer.cards.myOrders.title'), desc: t('portal.buyer.cards.myOrders.desc') },
        { id: 'payments', icon: '💳', title: t('portal.buyer.cards.payments.title'), desc: t('portal.buyer.cards.payments.desc') },
        { id: 'reviews', icon: '⭐', title: t('portal.buyer.cards.reviews.title'), desc: t('portal.buyer.cards.reviews.desc') },
        { id: 'settings', icon: '⚙️', title: t('portal.buyer.cards.settings.title'), desc: t('portal.buyer.cards.settings.desc') },
      ],
    },
    delivery: {
      emoji: '🚚',
      label: 'Delivery Agent',
      welcome: 'Manage your deliveries, track routes, and keep customers happy.',
      avatarGradient: 'from-blue-400 to-blue-600',
      accentColor: '#2563eb', // Blue
      cards: [
        { id: 'active', icon: '📍', title: 'Active Deliveries', desc: 'Your current assigned deliveries' },
        { id: 'map', icon: '🗺️', title: 'Route Map', desc: 'Optimised route for pickups & drops' },
        { id: 'history', icon: '✅', title: 'Completed', desc: 'History of all completed deliveries' },
        { id: 'earnings', icon: '💰', title: 'Earnings', desc: 'Track earnings and bonuses' },
        { id: 'contact', icon: '📞', title: 'Contact Buyer', desc: 'Reach buyers for delivery updates' },
        { id: 'ratings', icon: '⭐', title: 'Ratings', desc: 'Customer ratings and feedback' },
      ],
    },
    admin: {
      emoji: '⚙️',
      label: 'Administrator',
      welcome: 'Full control of the Farm2Home platform — users, orders, and analytics.',
      avatarGradient: 'from-purple-400 to-purple-600',
      accentColor: '#7c3aed', // Purple
      cards: [
        { id: 'users', icon: '👥', title: 'All Users', desc: 'Manage farmers, buyers and agents' },
        { id: 'orders', icon: '📦', title: 'All Orders', desc: 'Monitor and manage all orders' },
        { id: 'analytics', icon: '📊', title: 'Analytics', desc: 'Platform-wide analytics & reports' },
        { id: 'listings', icon: '🏷️', title: 'Listings', desc: 'Review and moderate crop listings' },
        { id: 'payments', icon: '💳', title: 'Payments', desc: 'Oversee transactions and payouts' },
        { id: 'settings', icon: '⚙️', title: 'Settings', desc: 'Platform configuration & settings' },
      ],
    },
  };

  const config = portalConfig[role] || portalConfig.buyer;

  const [latestStockAlert, setLatestStockAlert] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    if (role === 'admin' && i18n.language !== 'en') {
      i18n.changeLanguage('en');
    }
  }, [role]);

  useEffect(() => {
    const fetchAlerts = async () => {
      const userId = user?.id || user?._id;
      if (userId) {
        try {
          const notifications = await getNotifications(userId);
          
          if (role === 'buyer') {
            const stockAlert = notifications.find(n => n.type === 'Stock Update' && !n.isRead);
            if (stockAlert) {
              setLatestStockAlert(stockAlert);
            }
          }
          
          setUnreadCount(notifications.filter(n => !n.isRead).length);
        } catch (err) {
          console.error('Error fetching portal alerts:', err);
        }
      }
    };
    fetchAlerts();
  }, [role, user]);

  const dismissAlert = async () => {
    if (latestStockAlert) {
      try {
        await markNotificationRead(latestStockAlert._id);
        setLatestStockAlert(null);
      } catch (err) {
        console.error('Dismiss alert error:', err);
      }
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  const handleProfileSettingsClick = () => {
    if (role === 'farmer') navigate('/farmer/settings');
    if (role === 'buyer') navigate('/buyer/settings');
    setIsMenuOpen(false);
  };

  const isFarmer = role === 'farmer';
  const navAvatarUrl = getUserAvatarUrl(user);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-900 transition-colors duration-500 dark:bg-[#0a0a0a] dark:text-white">
      {/* Navbar */}
      <nav className="bg-white dark:bg-[#111111] border-b border-gray-100 dark:border-white/5 sticky top-0 z-50 shadow-sm transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 h-16 sm:h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
              <span className="text-2xl transition-transform hover:scale-110">🌾</span>
              <div className="text-lg font-black tracking-tighter text-gray-900 uppercase dark:text-white">
                  Farm<span style={{ color: config.accentColor }}>2</span>Home
              </div>
          </div>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-4">

            {role === 'buyer' && (
              <>
                {cartItems.length > 0 && (
                  <button
                    type="button"
                    onClick={() => navigate('/buyer/cart')}
                    className="relative p-2.5 rounded-xl transition-all bg-[#fbbc05] text-white shadow-lg shadow-amber-500/30"
                    title="Cart"
                  >
                    <span className="text-2xl" aria-hidden>🛒</span>
                    <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-500 text-white text-[9px] leading-[18px] font-black px-1 rounded-full border-2 border-white dark:border-[#111111]">
                      {cartItems.length}
                    </span>
                  </button>
                )}
                {/* <button
                  type="button"
                  onClick={() => navigate('/buyer/browse?view=feed')}
                  className="flex items-center gap-2.5 pl-2.5 pr-5 py-2 rounded-2xl border border-gray-200 dark:border-white/15 bg-white dark:bg-white/5 text-gray-700 dark:text-gray-200 hover:border-amber-400/60 hover:text-amber-600 dark:hover:text-amber-300 hover:bg-amber-50/60 dark:hover:bg-amber-500/10 transition-all"
                  title="Farm Feed"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-50 dark:bg-white/10 text-lg border border-gray-200 dark:border-white/10" aria-hidden>🌾</span>
                  <span className="text-[11px] font-black uppercase tracking-[0.14em]">{t('portal.navFarmFeed')}</span>
                </button> */}
                <button
                  type="button"
                  onClick={() => navigate('/buyer/messages')}
                  className="relative p-2 text-gray-300 hover:text-[#fbbc05] transition-colors"
                  title={t('portal.navMessages')}
                >
                  <span className="text-2xl" aria-hidden>💬</span>
                  {unreadChatCount > 0 && (
                    <span className="absolute top-1 right-1 bg-red-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full border-2 border-white dark:border-[#111111]">
                      {unreadChatCount}
                    </span>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/buyer/notifications')}
                  className="relative p-2 text-gray-300 hover:text-[#fbbc05] transition-colors"
                  title="Notifications"
                >
                  <span className="text-2xl" aria-hidden>🔔</span>
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 bg-red-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full border-2 border-white dark:border-[#111111]">
                      {unreadCount}
                    </span>
                  )}
                </button>
              </>
            )}
            
            {role === 'farmer' && (
              <>
                {/* <button
                  type="button"
                  onClick={() => navigate('/farmer/feed')}
                  className="flex items-center gap-2.5 pl-2.5 pr-5 py-2 rounded-2xl border border-gray-200 dark:border-white/15 bg-white dark:bg-white/5 text-gray-700 dark:text-gray-200 hover:border-green-500/60 hover:text-green-700 dark:hover:text-green-300 hover:bg-green-50/60 dark:hover:bg-green-500/10 transition-all"
                  title="Farm Feed"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-50 dark:bg-white/10 text-lg border border-gray-200 dark:border-white/10" aria-hidden>🌾</span>
                  <span className="text-[11px] font-black uppercase tracking-[0.14em]">{t('portal.navFarmFeed')}</span>
                </button> */}
                <button
                  type="button"
                  onClick={() => navigate('/farmer/messages')}
                  className="relative p-2 text-gray-300 hover:text-green-500 transition-colors"
                  title={t('portal.navMessages')}
                >
                  <span className="text-2xl" aria-hidden>💬</span>
                  {unreadChatCount > 0 && (
                    <span className="absolute top-1 right-1 bg-red-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full border-2 border-white dark:border-[#111111]">
                      {unreadChatCount}
                    </span>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/farmer/notifications')}
                  className="relative p-2 text-gray-300 hover:text-green-500 transition-colors"
                  title="Notifications"
                >
                  <span className="text-2xl" aria-hidden>🔔</span>
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 bg-red-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full border-2 border-white dark:border-[#111111]">
                      {unreadCount}
                    </span>
                  )}
                </button>
              </>
            )}

            <div className="h-8 w-px bg-gray-100 dark:bg-white/10 mx-2"></div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-sm font-black text-gray-900 dark:text-white">{user.firstName} {user.lastName}</div>
                <div className="text-[10px] font-black uppercase tracking-widest" style={{ color: config.accentColor }}>{config.label}</div>
              </div>
              <button
                type="button"
                onClick={handleProfileSettingsClick}
                className={`w-10 h-10 rounded-full overflow-hidden flex items-center justify-center font-black text-xs text-white shadow-lg ring-2 ring-offset-2 ring-offset-white dark:ring-offset-[#111111] cursor-pointer ${navAvatarUrl ? '' : `bg-gradient-to-br ${config.avatarGradient}`}`}
                title="Go to settings"
                aria-label="Go to settings"
              >
                {navAvatarUrl ? <img src={navAvatarUrl} alt="" className="w-full h-full object-cover" /> : <>{user.firstName?.[0]}{user.lastName?.[0]}</>}
              </button>
            </div>

            <button
              onClick={handleLogout}
              className="px-6 py-2.5 rounded-full bg-gray-900 text-white text-[10px] font-black uppercase tracking-widest hover:brightness-110 transition-all shadow-xl shadow-gray-900/10"
              style={{ backgroundColor: isDarkMode ? config.accentColor : 'rgb(17, 24, 39)' }}
            >
              {t('common.signOut')}
            </button>
          </div>

          {/* Mobile Nav Actions */}
          <div className="flex lg:hidden items-center gap-3">
            {role === 'buyer' && cartItems.length > 0 && (
              <button
                onClick={() => navigate('/buyer/cart')}
                className="relative flex items-center gap-2 px-3 py-2 rounded-xl bg-[#fbbc05] text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-amber-500/30"
                title="Cart"
              >
                <span className="text-base">🛒</span>
                Cart
                <span className="min-w-[18px] h-[18px] bg-red-500 text-white text-[9px] leading-[18px] text-center font-black px-1 rounded-full border-2 border-white/80">
                  {cartItems.length}
                </span>
              </button>
            )}
            {role === 'buyer' && (
              <button onClick={() => navigate('/buyer/notifications')} className="relative p-2 text-gray-300" title="Notifications">
                <span className="text-2xl">🔔</span>
                {unreadCount > 0 && <span className="absolute top-1 right-1 bg-red-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full border-2 border-white">{unreadCount}</span>}
              </button>
            )}
            {role === 'farmer' && (
              <button onClick={() => navigate('/farmer/notifications')} className="relative p-2 text-gray-300" title="Notifications">
                <span className="text-2xl">🔔</span>
                {unreadCount > 0 && <span className="absolute top-1 right-1 bg-red-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full border-2 border-white">{unreadCount}</span>}
              </button>
            )}
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2.5 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 text-gray-900 dark:text-white"
              title={isMenuOpen ? 'Close menu' : 'Open menu'}
            >
              <span className="text-xl">{isMenuOpen ? '✕' : '☰'}</span>
            </button>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        {isMenuOpen && (
          <div className="lg:hidden absolute top-full left-0 w-full bg-white dark:bg-[#111111] border-b border-gray-100 dark:border-white/10 shadow-2xl animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="p-6 flex flex-col gap-4">
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5">
                <button
                  type="button"
                  onClick={handleProfileSettingsClick}
                  className={`w-12 h-12 rounded-full overflow-hidden flex items-center justify-center font-black text-white cursor-pointer ${navAvatarUrl ? '' : `bg-gradient-to-br ${config.avatarGradient}`}`}
                  title="Go to settings"
                  aria-label="Go to settings"
                >
                  {navAvatarUrl ? <img src={navAvatarUrl} alt="" className="w-full h-full object-cover" /> : <>{user.firstName?.[0]}{user.lastName?.[0]}</>}
                </button>
                <div>
                  <div className="text-base font-black text-gray-900 dark:text-white">{user.firstName} {user.lastName}</div>
                  <div className="text-[10px] font-black uppercase tracking-widest" style={{ color: config.accentColor }}>{config.label}</div>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                {/* <button 
                  onClick={() => { navigate(role === 'buyer' ? '/buyer/browse?view=feed' : '/farmer/feed'); setIsMenuOpen(false); }}
                  className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white font-bold"
                >
                  <span className="text-xl">🌾</span> {t('portal.navFarmFeed')}
                </button> */}
                <button 
                  onClick={() => { navigate(role === 'buyer' ? '/buyer/messages' : '/farmer/messages'); setIsMenuOpen(false); }}
                  className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white font-bold"
                >
                  <div className="flex items-center gap-4"><span className="text-xl">💬</span> {t('portal.navMessages')}</div>
                  {unreadChatCount > 0 && <span className="bg-red-500 text-white text-[8px] font-black px-2 py-0.5 rounded-full">{unreadChatCount}</span>}
                </button>
                {role === 'buyer' && (
                  <button
                    onClick={() => { navigate('/buyer/cart'); setIsMenuOpen(false); }}
                    className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white font-bold"
                  >
                    <div className="flex items-center gap-4"><span className="text-xl">🛒</span> Cart</div>
                    {cartItems.length > 0 && <span className="bg-red-500 text-white text-[8px] font-black px-2 py-0.5 rounded-full">{cartItems.length}</span>}
                  </button>
                )}
                {role === 'buyer' && (
                  <button onClick={() => { navigate('/buyer/notifications'); setIsMenuOpen(false); }} className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white font-bold">
                    <div className="flex items-center gap-4"><span className="text-xl">🔔</span> Notifications</div>
                    {unreadCount > 0 && <span className="bg-red-500 text-white text-[8px] font-black px-2 py-0.5 rounded-full">{unreadCount}</span>}
                  </button>
                )}
                {role === 'farmer' && (
                  <button onClick={() => { navigate('/farmer/notifications'); setIsMenuOpen(false); }} className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white font-bold">
                    <div className="flex items-center gap-4"><span className="text-xl">🔔</span> Notifications</div>
                    {unreadCount > 0 && <span className="bg-red-500 text-white text-[8px] font-black px-2 py-0.5 rounded-full">{unreadCount}</span>}
                  </button>
                )}
              </div>

              <button 
                onClick={handleLogout}
                className="w-full py-5 rounded-2xl bg-red-500 text-white text-[12px] font-black uppercase tracking-widest shadow-lg shadow-red-500/20 mt-2"
              >
                {t('common.signOut')}
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Main content */}
      <div className="flex-1 max-w-6xl w-full mx-auto px-6 py-10">
        {/* Welcome banner */}
        <div className="flex flex-col sm:flex-row items-center gap-8 bg-white dark:bg-[#111111] border border-gray-100 dark:border-white/5 rounded-[3rem] p-10 mb-12 relative overflow-hidden shadow-sm">
          <div className={`absolute top-0 right-0 w-40 h-40 ${isFarmer ? 'bg-green-50/20' : 'bg-amber-50/20'} rounded-bl-full -mr-16 -mt-16`}></div>
          <div className="text-7xl relative z-10 transition-transform hover:scale-110 duration-500">{config.emoji}</div>
          <div className="relative z-10 flex-1 text-center sm:text-left">
            <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter uppercase leading-none mb-3">
              {t('portal.welcomeBack')} <br/><span style={{ color: config.accentColor }}>{user.firstName}</span>!
            </h1>
            <p className="text-gray-400 dark:text-gray-500 text-sm font-medium italic opacity-80">"{config.welcome}"</p>
          </div>
        </div>

        {/* Stock Alert Pop-up */}
        {latestStockAlert && (
          <div className="mb-12 animate-in slide-in-from-top duration-500">
            <div className="bg-[#fbbc05] text-white p-6 rounded-[2.5rem] shadow-2xl flex items-center justify-between border-b-4 border-amber-600">
              <div className="flex items-center gap-5">
                <span className="text-4xl animate-bounce">📦</span>
                <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/70 mb-1">Stock Update</span>
                  <p className="text-base font-black tracking-tight">{latestStockAlert.message}</p>
                </div>
              </div>
              <button 
                onClick={dismissAlert} 
                className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-all text-sm font-black"
                title="Dismiss"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Action Header */}
        <div className="flex items-center gap-4 mb-10">
            <h2 className="text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.5em]">{t('portal.commandDashboard')}</h2>
            <div className="h-px bg-gray-100 dark:bg-white/5 flex-1"></div>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {config.cards.map((card) => (
            <div
              key={card.id}
              onClick={() => {
                // Farmer Routes
                if (role === 'farmer') {
                  const routes = {
                    myCrops: '/farmer/products',
                    orders: '/farmer/orders',
                    earnings: '/farmer/earnings',
                    analytics: '/farmer/analytics',
                    myReviews: '/farmer/reviews',
                    settings: '/farmer/settings'
                  };
                  if (routes[card.id]) navigate(routes[card.id]);
                }
                
                // Buyer Routes
                if (role === 'buyer') {
                  const routes = {
                    browseProduce: '/buyer/browse',
                    myOrders: '/buyer/orders',
                    payments: '/buyer/payments',
                    reviews: '/buyer/reviews',
                    settings: '/buyer/settings'
                  };
                  if (routes[card.id]) navigate(routes[card.id]);
                }

                // Delivery Agent Routes (Placeholders)
                if (role === 'delivery') {
                  navigate(`/delivery/${card.id}`);
                }

                // Admin Routes (Placeholders)
                if (role === 'admin') {
                  navigate(`/admin/${card.id}`);
                }
              }}
              className={`bg-white dark:bg-[#111111] border border-gray-100 dark:border-white/5 rounded-[2.5rem] p-10 cursor-pointer hover:-translate-y-2 transition-all duration-500 relative overflow-hidden group shadow-sm hover:shadow-2xl`}
              style={{ '--hover-accent': config.accentColor }}
              onMouseOver={(e) => e.currentTarget.style.borderColor = config.accentColor}
              onMouseOut={(e) => e.currentTarget.style.borderColor = isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgb(243, 244, 246)'}
            >
              <div className={`absolute top-0 right-0 w-24 h-24 rounded-bl-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-700 opacity-20`} style={{ backgroundColor: config.accentColor }}></div>
              <div className="text-6xl mb-8 relative z-10 transform group-hover:scale-110 transition-transform duration-500">{card.icon}</div>
              <div className="text-xl font-black text-gray-900 dark:text-white mb-3 uppercase tracking-tighter relative z-10 transition-colors group-hover:text-gray-950 dark:group-hover:text-white">{card.title}</div>
              <div className="text-gray-400 dark:text-gray-500 text-sm leading-relaxed font-medium relative z-10 group-hover:text-gray-500 dark:group-hover:text-gray-300">{card.desc}</div>
              
              <div className="mt-8 pt-6 border-t border-gray-50 dark:border-white/5 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-2 group-hover:translate-y-0">
                  <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: config.accentColor }}>{t('portal.enterInside')}</span>
                  <span style={{ color: config.accentColor }}>→</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Portal;
