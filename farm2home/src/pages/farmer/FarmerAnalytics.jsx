import { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../../redux/slices/authSlice';
import { getFarmerOrders } from '../../api/orders';

const FarmerAnalytics = () => {
  const navigate = useNavigate();
  const user = useSelector(selectCurrentUser);
  const { isDarkMode } = useTheme();
  const [stats, setStats] = useState({
    totalRevenue: 0,
    deliveredOrders: 0,
    pendingOrders: 0,
    productSales: {},
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const orders = await getFarmerOrders(user.id || user._id);
        const delivered = orders.filter(o => o.status === 'Delivered');
        const revenue = delivered.reduce((sum, o) => sum + parseFloat(o.totalAmount || 0), 0);
        
        const salesByProduct = {};
        delivered.forEach(o => {
          o.items.forEach(item => {
            if ((item.farmerId?._id || item.farmerId) === (user.id || user._id)) {
              const name = item.product?.name || 'Unknown';
              salesByProduct[name] = (salesByProduct[name] || 0) + 1;
            }
          });
        });

        setStats({
          totalRevenue: revenue,
          deliveredOrders: delivered.length,
          pendingOrders: orders.filter(o => o.status !== 'Delivered' && o.status !== 'Cancelled').length,
          productSales: salesByProduct,
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchStats();
  }, [user]);

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
        <div className="mb-12">
          <h1 className="text-5xl font-black text-gray-900 dark:text-white uppercase tracking-tighter leading-none">Yield Intelligence</h1>
          <p className="text-gray-400 dark:text-gray-500 font-bold text-xs mt-3 uppercase tracking-[0.4em] flex items-center gap-3 px-1">
             Financial & Market Analysis <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse inline-block"></span>
          </p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-40 space-y-8 animate-in fade-in duration-700">
            <div className="w-16 h-16 border-4 border-green-50 dark:border-green-900/20 border-t-green-600 rounded-full animate-spin shadow-inner shadow-green-900/5"></div>
            <div className="text-gray-400 dark:text-gray-500 font-black tracking-[0.5em] text-[10px] uppercase animate-pulse">Computing Seasonal Data...</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            <div className="bg-white dark:bg-[#111111] border border-green-500/20 dark:border-green-500/10 p-10 rounded-[3rem] shadow-2xl shadow-green-500/5 relative overflow-hidden group transition-colors duration-500">
              <div className="absolute top-0 right-0 w-32 h-32 bg-green-50/30 dark:bg-green-400/5 rounded-bl-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-700"></div>
              <div className="text-[10px] text-green-600 dark:text-green-500 font-black uppercase tracking-[0.3em] mb-4 relative z-10">Total Gross Revenue</div>
              <div className="text-5xl font-black text-gray-900 dark:text-white tracking-tighter leading-none relative z-10 transition-colors duration-500">₹{stats.totalRevenue}</div>
            </div>
            
            <div className="bg-white dark:bg-[#111111] border border-gray-100 dark:border-white/5 p-10 rounded-[3rem] shadow-sm relative overflow-hidden transition-colors duration-500">
               <div className="text-[10px] text-gray-400 dark:text-gray-500 font-black uppercase tracking-[0.3em] mb-4 relative z-10">Deliveries Completed</div>
               <div className="text-5xl font-black text-gray-900 dark:text-white tracking-tighter leading-none relative z-10">{stats.deliveredOrders}</div>
               <div className="absolute bottom-[-20%] right-[-10%] text-9xl opacity-[0.03] dark:opacity-[0.01] rotate-12 pointer-events-none">✅</div>
            </div>

            <div className="bg-white dark:bg-[#111111] border border-gray-100 dark:border-white/5 p-10 rounded-[3rem] shadow-sm relative overflow-hidden transition-colors duration-500">
               <div className="text-[10px] text-gray-400 dark:text-gray-500 font-black uppercase tracking-[0.3em] mb-4 relative z-10">Active Pipeline</div>
               <div className="text-5xl font-black text-gray-900 dark:text-white tracking-tighter leading-none relative z-10">{stats.pendingOrders}</div>
               <div className="absolute bottom-[-20%] right-[-10%] text-9xl opacity-[0.03] dark:opacity-[0.01] rotate-12 pointer-events-none">📦</div>
            </div>
          </div>
        )}

        {!loading && (
          <div className="bg-white dark:bg-[#111111] border border-gray-100 dark:border-white/5 rounded-[4rem] p-12 shadow-sm transition-colors duration-500">
            <div className="flex items-center gap-6 mb-12">
               <div className="w-12 h-12 rounded-2xl bg-green-50 dark:bg-white/5 flex items-center justify-center text-2xl border border-green-100 dark:border-white/10 shadow-inner">📊</div>
               <h3 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">Market Penetration</h3>
               <div className="h-px flex-1 bg-gray-50 dark:bg-white/5"></div>
            </div>
            
            <div className="space-y-10">
              {Object.entries(stats.productSales).length === 0 ? (
                <div className="text-center py-20 border border-dashed border-gray-100 dark:border-white/10 rounded-[2.5rem] italic text-gray-400 dark:text-gray-500 font-medium">Insufficient sales volume to generate insights...</div>
              ) : (
                Object.entries(stats.productSales).map(([name, count]) => {
                  const maxSold = Math.max(...Object.values(stats.productSales));
                  const percentage = (count / maxSold) * 100;
                  return (
                    <div key={name} className="group">
                      <div className="flex justify-between items-center mb-4 px-2">
                        <span className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tighter group-hover:text-green-600 dark:group-hover:text-green-500 transition-colors duration-300">{name}</span>
                        <div className="text-right">
                           <span className="text-[10px] text-gray-400 dark:text-gray-500 font-black uppercase tracking-widest block mb-1">Volume</span>
                           <span className="text-sm text-green-600 dark:text-green-500 font-black">{count} Units Sold</span>
                        </div>
                      </div>
                      <div className="h-4 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-full overflow-hidden shadow-inner">
                        <div 
                          className="h-full bg-green-600 rounded-full transition-all duration-1000 ease-out shadow-lg shadow-green-500/20" 
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FarmerAnalytics;
