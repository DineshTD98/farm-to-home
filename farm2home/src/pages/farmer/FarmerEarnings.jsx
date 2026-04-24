import { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../../redux/slices/authSlice';
import { getFarmerOrders } from '../../api/orders';

const FarmerEarnings = () => {
  const navigate = useNavigate();
  const user = useSelector(selectCurrentUser);
  const { isDarkMode } = useTheme();
  const [earnings, setEarnings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchEarnings = async () => {
      try {
        const orders = await getFarmerOrders(user.id || user._id);
        
        // Transform orders into earnings list
        const processedEarnings = orders.map(order => {
          // Find items in this order sold by this farmer
          const farmerItems = order.items.filter(item => (item.farmerId?._id || item.farmerId) === (user.id || user._id));
          
          // Calculate earnings from this order
          const orderEarning = farmerItems.reduce((sum, item) => sum + parseFloat(item.price || 0), 0);
          
          return {
            ...order,
            farmerItems,
            orderEarning
          };
        }).filter(order => order.farmerItems.length > 0);
        
        setEarnings(processedEarnings);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchEarnings();
  }, [user]);

  const totalEarnings = earnings.reduce((sum, earning) => sum + earning.orderEarning, 0);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] flex flex-col font-sans transition-colors duration-500 text-gray-900 dark:text-white">
      <nav className="flex items-center justify-between px-8 py-4 bg-white dark:bg-[#111111] border-b border-gray-100 dark:border-white/5 sticky top-0 z-50 shadow-sm transition-colors duration-500">
        <div className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tighter cursor-pointer group flex items-center gap-2" onClick={() => navigate('/farmer-portal')}>
          <span className="text-2xl group-hover:scale-110 transition-transform">🌾</span>
          <span>Farm<span className="text-green-600">2</span>Home</span>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/farmer-portal')}
            className="px-6 py-2.5 rounded-full border border-gray-100 dark:border-white/10 text-gray-400 dark:text-gray-500 text-[10px] font-black uppercase tracking-widest hover:text-gray-900 dark:hover:text-white hover:border-gray-900 dark:hover:border-white transition-all font-bold"
          >
            ← DASHBOARD
          </button>
        </div>
      </nav>

      <div className="flex-1 max-w-6xl w-full mx-auto px-6 py-12">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-12 gap-8">
          <div>
            <h1 className="text-5xl font-black text-gray-900 dark:text-white uppercase tracking-tighter leading-none">Settlement Log</h1>
            <p className="text-gray-400 dark:text-gray-500 font-bold text-xs mt-3 uppercase tracking-[0.4em] flex items-center gap-3 px-1">
               Transactional Revenue History <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse inline-block"></span>
            </p>
          </div>
          <div className="bg-white dark:bg-[#111111] border border-green-500/20 dark:border-green-500/10 px-8 py-6 rounded-[2.5rem] shadow-2xl shadow-green-500/5 text-right min-w-[240px] relative overflow-hidden group transition-colors duration-500">
            <div className="absolute top-0 right-0 w-24 h-24 bg-green-50/50 dark:bg-green-400/5 rounded-bl-full -mr-12 -mt-12 transition-transform group-hover:scale-110"></div>
            <div className="text-[10px] text-green-600 dark:text-green-500 font-black uppercase tracking-[0.3em] mb-2 relative z-10">Total Aggregate</div>
            <div className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter relative z-10 transition-colors duration-500">₹{totalEarnings.toFixed(2)}</div>
          </div>
        </div>

        {loading ? (
           <div className="flex flex-col items-center justify-center py-40 space-y-8 animate-in fade-in duration-700">
             <div className="w-16 h-16 border-4 border-green-50 dark:border-green-900/20 border-t-green-600 rounded-full animate-spin shadow-inner shadow-green-900/5"></div>
             <div className="text-gray-400 dark:text-gray-500 font-black tracking-[0.5em] text-[10px] uppercase animate-pulse">Auditing Transmissions...</div>
           </div>
        ) : error ? (
           <div className="p-10 rounded-[3rem] bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 text-red-600 dark:text-red-500 font-black text-sm uppercase tracking-widest text-center shadow-sm">⚠️ {error}</div>
        ) : earnings.length === 0 ? (
          <div className="text-center py-40 bg-white dark:bg-[#111111] border border-dashed border-gray-200 dark:border-white/10 rounded-[4rem] group shadow-inner shadow-gray-900/5 transition-colors duration-500">
            <div className="text-8xl mb-8 opacity-20 group-hover:scale-110 transition-transform duration-700 transform grayscale group-hover:grayscale-0 group-hover:opacity-100">💰</div>
            <h3 className="text-gray-900 dark:text-white font-black uppercase tracking-tighter text-2xl mb-3">Revenue Cycle Inactive</h3>
            <p className="text-gray-400 dark:text-gray-500 text-sm mt-3 font-medium italic">Broadcast your harvest to initiate transactional flow within the ecosystem.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {earnings.map((earning) => (
              <div key={earning._id} className="bg-white dark:bg-[#111111] border border-gray-100 dark:border-white/5 rounded-[3rem] p-8 flex flex-col lg:flex-row items-start lg:items-center justify-between hover:border-green-500/50 transition-all duration-500 gap-10 shadow-sm hover:shadow-2xl group transition-colors duration-500">
                <div className="flex items-center gap-8 w-full lg:w-auto">
                   <div className="w-20 h-20 rounded-[1.5rem] bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 flex items-center justify-center text-3xl shadow-inner group-hover:scale-110 transition-transform duration-500">
                     💳
                   </div>
                   <div>
                     <div className="text-gray-900 dark:text-white font-black text-sm uppercase tracking-tighter">
                        Log #{earning._id.slice(-8).toUpperCase()}
                     </div>
                     <div className="text-gray-400 dark:text-gray-500 text-[10px] font-black uppercase tracking-[0.3em] mt-2 opacity-60">
                        {new Date(earning.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                     </div>
                   </div>
                </div>

                <div className="flex-1 w-full lg:w-auto bg-gray-50/50 dark:bg-white/5 p-8 rounded-[2.5rem] border border-gray-100 dark:border-white/10 border-dashed group-hover:border-green-500/20 group-hover:bg-green-50/20 dark:group-hover:bg-green-400/5 transition-all">
                   <div className="text-[10px] text-gray-400 dark:text-gray-500 font-black uppercase tracking-[0.4em] mb-6 px-1">Inventory Exchange</div>
                   <div className="space-y-4">
                     {earning.farmerItems.map((item, idx) => (
                       <div key={idx} className="flex justify-between items-center text-sm border-b border-gray-100/50 dark:border-white/5 pb-4 last:border-0 last:pb-0">
                          <div className="text-gray-900 dark:text-white font-black flex items-center gap-4 transition-all group-hover:pl-2">
                            <span className="w-2 h-2 rounded-full bg-green-500 opacity-40 block"></span>
                            <span className="uppercase tracking-tight text-xs">{item.product?.name || 'Archived Harvest'}</span>
                            <span className="text-[9px] bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 px-3 py-1 rounded-full text-gray-400 dark:text-gray-500 font-black tracking-widest ml-4 shadow-sm">BATCH × {item.quantity}</span>
                          </div>
                          <span className="text-gray-900 dark:text-white font-black text-xs tracking-tight">₹{parseFloat(item.price || 0).toFixed(2)}</span>
                       </div>
                     ))}
                   </div>
                   <div className="mt-8 pt-6 border-t border-gray-100 dark:border-white/10 flex justify-between items-center">
                     <span className="text-[10px] text-gray-400 dark:text-gray-500 font-black uppercase tracking-[0.3em]">RECIPIENT: {earning.buyerId?.firstName} {earning.buyerId?.lastName}</span>
                     <span className={`text-[10px] uppercase font-black tracking-[0.3em] px-4 py-1.5 rounded-full shadow-sm ${earning.status === 'Delivered' ? 'bg-green-50 dark:bg-green-900/10 text-green-600 dark:text-green-500 border border-green-100 dark:border-green-900/20' : 'bg-gray-100 dark:bg-white/5 text-gray-400 dark:text-gray-500 border border-gray-200 dark:border-white/10'}`}>
                        {earning.status}
                     </span>
                   </div>
                </div>

                <div className="text-left flex flex-row items-center justify-between w-full lg:text-right lg:block lg:w-auto pt-6 lg:pt-0 border-t lg:border-t-0 border-gray-100 dark:border-white/10 shrink-0">
                   <div className="text-[10px] text-gray-400 dark:text-gray-500 font-black uppercase tracking-tighter lg:mb-2 opacity-60">Yield Outcome</div>
                   <div className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter leading-none group-hover:text-green-600 dark:group-hover:text-green-500 transition-colors duration-500">₹{earning.orderEarning.toFixed(2)}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FarmerEarnings;
