import { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../../redux/slices/authSlice';
import { getFarmerOrders, updateOrderStatus } from '../../api/orders';
import { selectUnreadCount } from '../../redux/slices/chatSlice';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-hot-toast';
import FarmerBuyerChatPanel from '../../components/farmer/FarmerBuyerChatPanel';

const FarmerOrders = () => {
  const navigate = useNavigate();
  const user = useSelector(selectCurrentUser);
  const unreadCount = useSelector(selectUnreadCount);
  const { isDarkMode } = useTheme();
  const { t } = useTranslation();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [chatBuyer, setChatBuyer] = useState(null);

  const UPLOADS_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5008';

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await getFarmerOrders(user.id || user._id);
        setOrders(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchOrders();
  }, [user]);

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      setOrders(orders.map(o => o._id === orderId ? { ...o, status: newStatus } : o));
      toast.success(`Order status updated to ${newStatus}!`);
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] flex flex-col font-sans transition-colors duration-500 text-gray-900 dark:text-white">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-8 py-4 bg-white dark:bg-[#111111] border-b border-gray-100 dark:border-white/5 sticky top-0 z-50 shadow-sm transition-colors duration-500">
        <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate('/farmer-portal')}>
          <span className="text-2xl group-hover:scale-110 transition-transform">🌾</span>
          <div className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tighter">
            Farm<span className="text-green-600">2</span>Home
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/farmer/messages')}
            className="p-2 text-gray-400 hover:text-green-600 transition-colors relative"
            title={t('common.messages')}
          >
            <span className="text-xl">💬</span>
            {unreadCount > 0 && (
              <span className="absolute top-0 right-0 bg-red-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full border border-white dark:border-[#111111]">
                {unreadCount}
              </span>
            )}
          </button>
          <button
            onClick={() => navigate('/farmer-portal')}
            className="px-6 py-2.5 rounded-full border border-gray-200 dark:border-white/10 text-gray-400 dark:text-gray-500 text-[10px] font-black uppercase tracking-widest hover:text-gray-900 dark:hover:text-white hover:border-gray-900 dark:hover:border-white transition-all"
          >
            ← {t('common.dashboard')}
          </button>
        </div>
      </nav>

      <div className="flex-1 max-w-6xl w-full mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-8">
          <div>
            <h1 className="text-5xl font-black text-gray-900 dark:text-white uppercase tracking-tighter leading-none">{t('farmerOrders.title')}</h1>
            <p className="text-gray-400 dark:text-gray-500 font-bold text-xs mt-3 uppercase tracking-[0.4em] flex items-center gap-3 px-1">
               {t('farmerOrders.subtitle')} <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse inline-block"></span>
            </p>
          </div>
          <div className="bg-white dark:bg-[#111111] border border-gray-100 dark:border-white/5 px-6 py-3 rounded-2xl text-[10px] font-black text-green-600 dark:text-green-500 tracking-widest uppercase shadow-sm transition-colors duration-500">
            {t('farmerOrders.pendingCount', { count: orders.filter(o => o.status === 'Pending').length })}
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-40 space-y-8 animate-in fade-in duration-700">
            <div className="w-16 h-16 border-4 border-green-50 border-t-green-600 rounded-full animate-spin shadow-inner shadow-green-900/5"></div>
            <div className="text-gray-400 font-black tracking-[0.5em] text-[10px] uppercase animate-pulse">{t('farmerOrders.loadingOrders')}</div>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-40 bg-white dark:bg-[#111111] border border-dashed border-gray-200 dark:border-white/10 rounded-[4rem] group shadow-inner shadow-gray-900/5 transition-colors duration-500">
            <div className="text-8xl mb-8 opacity-10 group-hover:scale-110 transition-transform duration-700 transform grayscale group-hover:grayscale-0 group-hover:opacity-100">📦</div>
            <h3 className="text-gray-900 dark:text-white font-black uppercase tracking-tighter text-2xl mb-3">{t('farmerOrders.emptyTitle')}</h3>
            <p className="text-gray-400 dark:text-gray-500 text-sm mt-2 font-medium italic">{t('farmerOrders.emptyDesc')}</p>
          </div>
        ) : (
          <div className="space-y-10">
            {orders.map((order) => (
              <div key={order._id} className="bg-white dark:bg-[#111111] border border-gray-100 dark:border-white/5 rounded-[3rem] overflow-hidden shadow-sm hover:border-green-500 transition-all duration-500 group">
                <div className="p-8 bg-gray-50/50 dark:bg-white/5 border-b border-gray-100 dark:border-white/10 flex items-center justify-between flex-wrap gap-6">
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 rounded-2xl bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 flex items-center justify-center text-2xl shadow-inner shadow-green-900/5">
                      👤
                    </div>
                    <div>
                      <div className="text-gray-900 dark:text-white font-black text-sm uppercase tracking-tighter">
                        {order.buyerId?.firstName} {order.buyerId?.lastName}
                      </div>
                      <div className="flex items-center gap-3 mt-1.5">
                        <a 
                          href={`tel:${order.buyerId?.phone}`} 
                          className="text-gray-400 dark:text-gray-500 hover:text-green-600 dark:hover:text-green-500 text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-2 transition-colors cursor-pointer"
                        >
                          📞 {order.buyerId?.phone || 'PRIVATE'}
                        </a>
                        <button
                          onClick={() => setChatBuyer(order.buyerId)}
                          className="bg-green-50 dark:bg-green-900/10 text-green-600 dark:text-green-500 hover:bg-green-600 hover:text-white dark:hover:bg-green-500 dark:hover:text-black text-[9px] px-3 py-1.5 rounded-full font-black uppercase tracking-[0.2em] transition-colors"
                        >
                          💬 Message Buyer
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] text-gray-400 dark:text-gray-500 font-black uppercase tracking-widest mb-2 opacity-60">{t('farmerOrders.revenue')}</div>
                    <div className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter">₹{parseFloat(order.totalAmount).toFixed(2)}</div>
                  </div>
                </div>

                <div className="p-10 grid md:grid-cols-2 gap-12">
                  <div>
                    <div className="text-[10px] text-gray-400 dark:text-gray-500 uppercase font-black tracking-[0.5em] mb-6 flex items-center gap-4">
                      {t('farmerOrders.logistics')} <div className="h-px flex-1 bg-gray-50 dark:bg-white/5"></div>
                    </div>
                    <div className="bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 p-6 rounded-[2rem] text-gray-600 dark:text-gray-400 text-sm leading-relaxed font-medium italic mb-6 shadow-inner">
                      "{order.deliveryAddress}"
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] text-gray-400 dark:text-gray-500 font-black uppercase tracking-widest bg-gray-100 dark:bg-white/5 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-white/10 shadow-sm">
                        Total Billing: {order.paymentMethod}
                      </span>
                    </div>
                  </div>

                  <div>
                    <div className="text-[10px] text-gray-400 dark:text-gray-500 uppercase font-black tracking-[0.5em] mb-6 flex items-center gap-4">
                      {t('farmerOrders.inventoryOut')} <div className="h-px flex-1 bg-gray-50 dark:bg-white/5"></div>
                    </div>
                    <div className="space-y-4">
                      {order.items
                        .filter(item => (item.farmerId?._id || item.farmerId) === (user.id || user._id))
                        .map((item, idx) => (
                          <div key={idx} className="flex items-center gap-5 bg-white dark:bg-[#1a1a1a] p-4 rounded-2xl border border-gray-100 dark:border-white/5 group/item hover:border-green-100 dark:hover:border-green-900/30 transition-all shadow-sm">
                            <div className="w-12 h-12 rounded-xl overflow-hidden border border-gray-50 dark:border-white/10">
                               <img src={item.product?.image?.startsWith('http') ? item.product.image : `${UPLOADS_BASE}${item.product?.image?.replace('/uploads', '')}`} className="w-full h-full object-cover" alt="" />
                            </div>
                            <div className="flex-1">
                              <div className="text-gray-900 dark:text-white font-black text-xs uppercase tracking-tight">{item.product?.name}</div>
                              <div className="text-gray-400 dark:text-gray-500 text-[10px] font-black uppercase tracking-widest mt-1 opacity-60">{t('farmerOrders.qty')}: {item.quantity} {item.product?.unit || 'kg'}</div>
                            </div>
                            <div className="text-right font-black text-green-600 dark:text-green-500 text-sm">₹{parseFloat(item.price).toFixed(2)}</div>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>

                <div className="px-10 py-8 bg-gray-50/50 dark:bg-white/5 border-t border-gray-100 dark:border-white/10 flex items-center justify-between transition-colors duration-500">
                  <div className="flex items-center gap-4">
                    <div className={`w-3 h-3 rounded-full animate-pulse shadow-sm ${
                      order.status === 'Pending' ? 'bg-orange-400' :
                      order.status === 'Delivered' ? 'bg-green-600' :
                      order.status === 'Cancelled' ? 'bg-red-500' : 'bg-blue-400'
                    }`}></div>
                    <span className="text-[11px] text-gray-900 dark:text-white font-black uppercase tracking-widest">{order.status}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-[10px] text-gray-400 dark:text-gray-500 uppercase font-black tracking-widest mr-2 hidden sm:block">{t('farmerOrders.updateStatus')}</div>
                    <select 
                      value={order.status}
                      onChange={(e) => handleStatusUpdate(order._id, e.target.value)}
                      className="bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-white/10 text-[10px] font-black text-gray-900 dark:text-white px-6 py-3 rounded-2xl focus:outline-none focus:border-green-500 transition-all uppercase tracking-widest shadow-sm cursor-pointer hover:border-green-200 dark:hover:border-green-900/30"
                    >
                      <option value="Pending" className="dark:bg-[#1a1a1a]">{t('farmerOrders.pending')}</option>
                      <option value="Confirmed" className="dark:bg-[#1a1a1a]">{t('farmerOrders.confirmed')}</option>
                      <option value="Out for Delivery" className="dark:bg-[#1a1a1a]">{t('farmerOrders.outForDelivery')}</option>
                      <option value="Delivered" className="dark:bg-[#1a1a1a]">{t('farmerOrders.delivered')}</option>
                      <option value="Cancelled" className="dark:bg-[#1a1a1a]">{t('farmerOrders.cancelled')}</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {chatBuyer && user && (user.id || user._id) && (
        <FarmerBuyerChatPanel
          buyer={chatBuyer}
          farmerId={user.id || user._id}
          onClose={() => setChatBuyer(null)}
        />
      )}
    </div>
  );
};

export default FarmerOrders;
