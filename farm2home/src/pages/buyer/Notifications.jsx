import { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../../redux/slices/authSlice';
import { getNotifications, markNotificationRead } from '../../api/notifications';
import { useTranslation } from 'react-i18next';

const Notifications = () => {
  const navigate = useNavigate();
  const user = useSelector(selectCurrentUser);
  const { isDarkMode } = useTheme();
  const { t } = useTranslation();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedNotification, setSelectedNotification] = useState(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const data = await getNotifications(user.id || user._id);
        setNotifications(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchNotifications();
  }, [user]);

  const handleOpenNotification = async (notif) => {
    setSelectedNotification(notif);
    if (!notif.isRead) {
      try {
        await markNotificationRead(notif._id);
        setNotifications(notifications.map(n => n._id === notif._id ? { ...n, isRead: true } : n));
      } catch (err) {
        console.error('Mark read error:', err);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] flex flex-col relative overflow-hidden font-sans transition-colors duration-500 text-gray-900 dark:text-white">
      {/* Decorative Glow */}
      <div className="absolute w-[800px] h-[800px] rounded-full bg-amber-100/20 dark:bg-amber-400/5 -top-40 -left-40 blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute w-[600px] h-[600px] rounded-full bg-amber-50/50 dark:bg-white/5 bottom-0 right-0 blur-3xl pointer-events-none animate-pulse duration-[6000ms]" />

      <nav className="flex items-center justify-between px-4 sm:px-8 py-4 bg-white dark:bg-[#111111] border-b border-gray-100 dark:border-white/5 sticky top-0 z-50 shadow-sm transition-colors duration-500">
        <div className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tighter cursor-pointer group flex items-center gap-2" onClick={() => navigate('/buyer-portal')}>
          <span className="text-2xl group-hover:scale-110 transition-transform">🌾</span>
          <span>Farm<span className="text-[#fbbc05]">2</span>Home</span>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/buyer-portal')}
            className="px-4 sm:px-6 py-2.5 rounded-full border border-gray-100 dark:border-white/10 text-gray-500 dark:text-gray-400 text-[10px] font-black uppercase tracking-widest hover:text-gray-900 dark:hover:text-white hover:border-gray-900 dark:hover:border-white transition-all font-bold"
          >
            ← Portal
          </button>
        </div>
      </nav>

      <div className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12 relative z-10 overflow-x-hidden">
        <div className="mb-12">
          <h1 className="text-3xl sm:text-5xl font-black text-gray-900 dark:text-white uppercase tracking-tighter leading-none">{t('notifications.pageTitle')}</h1>
          <p className="text-gray-400 dark:text-gray-500 font-bold text-xs mt-3 uppercase tracking-[0.4em] flex items-center gap-3 px-1">
             {t('notifications.pageSubtitle')} <span className="w-2 h-2 rounded-full bg-[#fbbc05] animate-pulse inline-block"></span>
          </p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-8 animate-in fade-in duration-700">
            <div className="w-16 h-16 border-4 border-amber-50 border-t-[#fbbc05] rounded-full animate-spin shadow-inner shadow-amber-900/5"></div>
            <div className="text-gray-400 font-black tracking-[0.5em] text-[10px] uppercase animate-pulse">{t('notifications.syncing')}</div>
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-40 bg-white dark:bg-[#111111] border border-dashed border-gray-200 dark:border-white/10 rounded-[4rem] group shadow-inner shadow-gray-900/5 transition-colors duration-500">
            <div className="text-8xl mb-8 opacity-20 group-hover:scale-110 transition-transform duration-700 transform grayscale group-hover:grayscale-0 group-hover:opacity-100">🔔</div>
            <h3 className="text-gray-900 dark:text-white font-black uppercase tracking-tighter text-2xl mb-3">{t('notifications.allClear')}</h3>
            <p className="text-gray-400 dark:text-gray-500 text-sm mt-3 font-medium italic">{t('notifications.noNotifications')}</p>
          </div>
        ) : (
          <div className="space-y-6">
            {notifications.map((n) => (
              <div 
                key={n._id} 
                onClick={() => handleOpenNotification(n)}
                className={`p-5 sm:p-8 rounded-[2rem] sm:rounded-[3rem] border transition-all duration-500 cursor-pointer group hover:-translate-y-2 shadow-sm hover:shadow-2xl ${
                  n.isRead 
                    ? 'bg-white dark:bg-[#111111] border-gray-100 dark:border-white/5' 
                    : 'bg-white dark:bg-[#111111] border-[#fbbc05]/30 dark:border-[#fbbc05]/20 shadow-xl shadow-amber-500/5 ring-1 ring-amber-500/10'
                }`}
              >
                <div className="flex items-start sm:items-center gap-4 sm:gap-8">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl transition-transform duration-500 group-hover:scale-110 shadow-sm border border-gray-50 dark:border-white/10 ${
                    n.type === 'Order Placed' ? 'bg-blue-50 dark:bg-blue-900/10' : 'bg-amber-50 dark:bg-amber-400/10'
                  }`}>
                    {n.type === 'Order Placed' ? '🛍️' : 
                     n.type === 'Stock Update' ? '🌟' : '🚚'}
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2.5 gap-2">
                      <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#fbbc05] pb-0.5 border-b border-amber-500/10 dark:border-amber-400/10">{n.type}</span>
                      <span className="text-[10px] text-gray-400 dark:text-gray-500 font-black uppercase tracking-widest opacity-60 px-3 py-1 bg-gray-50 dark:bg-white/5 rounded-lg">{new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <p className={`text-base leading-snug tracking-tight ${n.isRead ? 'text-gray-400 dark:text-gray-500' : 'text-gray-900 dark:text-white font-black uppercase'}`}>
                      {n.message.length > 80 ? n.message.substring(0, 80) + '...' : n.message}
                    </p>
                    {!n.isRead && (
                      <div className="mt-4 flex items-center gap-3">
                        <span className="w-2 h-2 rounded-full bg-[#fbbc05] animate-pulse"></span>
                        <span className="text-[9px] text-[#fbbc05] font-black uppercase tracking-[0.3em]">PRIORITY TRANSMISSION</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Immersive Detail Overlay */}
      {selectedNotification && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-500">
          <div className="absolute inset-0 bg-white/40 dark:bg-black/40 backdrop-blur-2xl" onClick={() => setSelectedNotification(null)} />
          
          <div className="relative w-full max-w-xl bg-white dark:bg-[#111111] border border-gray-100 dark:border-white/5 rounded-[2.5rem] sm:rounded-[4.5rem] p-6 sm:p-16 overflow-hidden shadow-2xl shadow-gray-900/5 animate-in zoom-in-95 fade-in slide-in-from-bottom-12 duration-700">
            {/* Background Accent */}
            <div className={`absolute -top-32 -right-32 w-80 h-80 rounded-full blur-[120px] opacity-20 ${
              selectedNotification.type === 'Stock Update' ? 'bg-amber-400' : 'bg-blue-400'
            }`} />

            <div className="flex flex-col items-center text-center relative z-10">
              <div className={`w-28 h-28 rounded-[2.5rem] flex items-center justify-center text-6xl mb-10 shadow-2xl border border-white/50 dark:border-white/10 ${
                selectedNotification.type === 'Order Placed' ? 'bg-blue-50 dark:bg-blue-900/10 text-blue-500' : 'bg-amber-50 dark:bg-amber-400/10 text-[#fbbc05]'
              }`}>
                {selectedNotification.type === 'Order Placed' ? '🛍️' : 
                 selectedNotification.type === 'Stock Update' ? '🌟' : '🚚'}
              </div>

              <span className="text-[10px] font-black uppercase tracking-[0.6em] text-[#fbbc05] mb-6 px-6 py-2.5 rounded-full bg-amber-50/50 dark:bg-amber-400/10 border border-amber-100 dark:border-amber-400/20 shadow-sm leading-none">
                {selectedNotification.type}
              </span>

              <h2 className="text-2xl sm:text-4xl font-black text-gray-900 dark:text-white leading-tight tracking-tighter mb-8 uppercase break-words">
                {selectedNotification.message}
              </h2>

              <p className="text-gray-400 dark:text-gray-500 text-[10px] font-black uppercase tracking-[0.4em] mb-12 opacity-60">
                Logged {new Date(selectedNotification.createdAt).toLocaleDateString()} • {new Date(selectedNotification.createdAt).toLocaleTimeString()}
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-4 w-full">
                <button
                  onClick={() => setSelectedNotification(null)}
                  className="w-full sm:flex-1 py-5 rounded-2xl border border-gray-100 dark:border-white/10 text-gray-400 dark:text-gray-500 text-[10px] font-black uppercase tracking-widest hover:text-gray-900 dark:hover:text-white hover:border-gray-900 dark:hover:border-white/20 transition-all duration-300 active:scale-95 shadow-sm"
                >
                  {t('common.cancel')}
                </button>
                {selectedNotification.type === 'Stock Update' && (
                  <button
                    onClick={() => {
                      setSelectedNotification(null);
                      navigate('/buyer/browse');
                    }}
                    className="w-full sm:flex-1 py-5 rounded-2xl bg-gray-900 dark:bg-white text-white dark:text-black font-black text-[10px] uppercase tracking-[0.3em] shadow-2xl shadow-gray-900/10 hover:bg-[#fbbc05] hover:shadow-amber-500/30 hover:-translate-y-1 transition-all duration-300 active:scale-95"
                  >
                    {t('notifications.exploreMarketplace')}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Notifications;
