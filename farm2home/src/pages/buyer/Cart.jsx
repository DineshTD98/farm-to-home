import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { selectCartItems, selectCartTotal, updateQuantity, removeFromCart, clearCart } from '../../redux/slices/cartSlice';
import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from 'react-i18next';

const Cart = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const cartItems = useSelector(selectCartItems);
  const total = useSelector(selectCartTotal);
  const { isDarkMode } = useTheme();
  const { t } = useTranslation();

  const UPLOADS_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5008';

  const getImageUrl = (imagePath) => {
    if (!imagePath) return '';
    if (imagePath.startsWith('http')) return imagePath;
    return `${UPLOADS_BASE}${imagePath.startsWith('/') ? '' : '/'}${imagePath.replace('/uploads', '')}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] flex flex-col font-sans transition-colors duration-500 text-gray-900 dark:text-white overflow-x-hidden">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-4 sm:px-8 py-4 bg-white dark:bg-[#111111] border-b border-gray-100 dark:border-white/5 sticky top-0 z-50 shadow-sm transition-colors duration-500">
        <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate('/buyer-portal')}>
          <span className="text-2xl group-hover:scale-110 transition-transform">🌾</span>
          <div className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tighter">
            Farm<span className="text-[#fbbc05]">2</span>Home
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/buyer/browse')}
            className="hidden sm:flex px-6 py-2.5 rounded-full border border-gray-200 dark:border-white/10 text-gray-400 dark:text-gray-500 text-[10px] font-black uppercase tracking-widest hover:text-gray-900 dark:hover:text-white hover:border-gray-900 dark:hover:border-white transition-all items-center gap-3"
          >
            {t('nav.addMoreProduce')}
          </button>
        </div>
      </nav>

      <div className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-8">
          <div>
            <h1 className="text-4xl font-black text-gray-900 dark:text-white uppercase tracking-tighter leading-none">{t('cart.title')}</h1>
            <p className="text-gray-400 dark:text-gray-500 font-bold text-xs mt-3 uppercase tracking-[0.4em] flex items-center gap-3 px-1">
               {t('cart.subtitle')} <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse inline-block"></span>
            </p>
          </div>
          {cartItems.length > 0 && (
            <button 
              onClick={() => {
                if (window.confirm(t('cart.clearConfirm'))) {
                  dispatch(clearCart());
                }
              }}
              className="text-[10px] font-black text-red-400 hover:text-red-600 transition-all uppercase tracking-[0.3em] pb-1 border-b border-red-500/10 hover:border-red-500 dark:text-red-300 dark:border-red-900"
            >
              {t('cart.emptyAll')}
            </button>
          )}
        </div>

        {cartItems.length === 0 ? (
          <div className="text-center py-40 bg-white dark:bg-[#111111] border border-dashed border-gray-200 dark:border-white/10 rounded-[4rem] group shadow-inner shadow-gray-900/5 transition-colors duration-500">
            <div className="text-8xl mb-8 opacity-20 group-hover:scale-110 transition-transform duration-700 transform grayscale group-hover:grayscale-0 group-hover:opacity-100">🛒</div>
            <h3 className="text-gray-900 dark:text-white font-black uppercase tracking-tighter text-2xl mb-3">{t('cart.emptyTitle')}</h3>
            <p className="text-gray-400 dark:text-gray-500 text-sm mt-3 mb-12 font-medium italic">{t('cart.emptyDesc')}</p>
            <button
              onClick={() => navigate('/buyer/browse')}
              className="px-12 py-5 rounded-2xl bg-gray-900 dark:bg-white text-white dark:text-black font-black text-xs uppercase tracking-[0.2em] hover:bg-[#fbbc05] hover:-translate-y-1 transition-all shadow-xl shadow-gray-900/10 hover:shadow-amber-500/20 active:scale-95"
            >
              {t('cart.exploreProduce')}
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {cartItems.map((item) => (
              <div key={item.product._id} className="bg-white dark:bg-[#111111] border border-gray-100 dark:border-white/5 rounded-[2.5rem] p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center gap-5 sm:gap-8 group hover:border-[#fbbc05] transition-all duration-500 shadow-sm hover:shadow-2xl">
                <div className="w-24 h-24 rounded-3xl overflow-hidden flex-shrink-0 border border-gray-50 dark:border-white/10 shadow-md">
                  <img src={getImageUrl(item.product.image)} alt={item.product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[10px] text-[#fbbc05] font-black uppercase tracking-[0.3em] mb-1.5 px-0.5">{t('cart.farmFresh')}</div>
                  <h3 className="font-black text-gray-900 dark:text-white text-2xl uppercase tracking-tighter leading-none mb-2">{item.product.name}</h3>
                  <p className="text-gray-400 dark:text-gray-500 text-[10px] font-black uppercase tracking-widest opacity-60">{t('cart.unitPrice')}: ₹{item.price} / {item.product.unit || 'kg'}</p>
                </div>
                <div className="flex flex-col sm:items-end gap-4 w-full sm:w-auto sm:min-w-[140px]">
                  {/* Subtotal */}
                  <div className="text-2xl font-black text-gray-900 dark:text-white tracking-tighter">
                    ₹{(parseFloat(item.price) * item.quantity).toFixed(2)}
                  </div>
                  {/* Quantity stepper */}
                  <div className="flex items-center gap-0 border border-gray-100 dark:border-white/10 rounded-2xl overflow-hidden shadow-sm bg-gray-50 dark:bg-white/5">
                    <button
                      onClick={() => {
                        const step = (item.product.unit === 'kg' || item.product.unit === 'litre') ? 0.25 : 1;
                        dispatch(updateQuantity({ productId: item.product._id, quantity: Math.max(step, Math.round((item.quantity - step) * 100) / 100) }));
                      }}
                      disabled={item.quantity <= ((item.product.unit === 'kg' || item.product.unit === 'litre') ? 0.25 : 1)}
                      className="w-10 h-9 flex items-center justify-center text-gray-500 dark:text-gray-400 font-black text-lg hover:bg-gray-100 dark:hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      −
                    </button>
                    <span className="w-16 text-center text-[11px] font-black text-gray-900 dark:text-white select-none">
                      {item.quantity} <span className="text-[8px] uppercase">{item.product.unit || 'kg'}</span>
                    </span>
                    <button
                      onClick={() => {
                        const step = (item.product.unit === 'kg' || item.product.unit === 'litre') ? 0.25 : 1;
                        dispatch(updateQuantity({ productId: item.product._id, quantity: Math.round((item.quantity + step) * 100) / 100 }));
                      }}
                      className="w-10 h-9 flex items-center justify-center text-gray-500 dark:text-gray-400 font-black text-lg hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                    >
                      +
                    </button>
                  </div>
                  {/* Remove */}
                  <button
                    onClick={() => {
                      if (window.confirm(t('cart.removeConfirm', { name: item.product.name }))) {
                        dispatch(removeFromCart(item.product._id));
                      }
                    }}
                    className="text-[9px] font-black text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-950/20 h-8 px-4 rounded-xl border border-red-100 dark:border-red-900/40 hover:bg-red-500 hover:text-white dark:hover:bg-red-500 transition-all uppercase tracking-widest shadow-sm"
                  >
                    {t('common.remove')}
                  </button>
                </div>
              </div>
            ))}

            <div className="mt-12 p-10 bg-white dark:bg-[#111111] border border-[#fbbc05]/20 dark:border-[#fbbc05]/10 rounded-[3.5rem] shadow-2xl shadow-amber-500/5 relative overflow-hidden group/total transition-colors duration-500">
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-50/30 dark:bg-amber-400/5 rounded-bl-full -mr-16 -mt-16 group-hover/total:scale-150 transition-transform duration-700"></div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-10 relative z-10">
                <span className="text-gray-400 dark:text-gray-500 font-bold uppercase tracking-[0.4em] text-xs">{t('cart.checkoutTotal')}</span>
                <span className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter leading-none">₹{total.toFixed(2)}</span>
              </div>
              <button
                onClick={() => navigate('/buyer/checkout')}
                className="w-full py-6 bg-gray-900 dark:bg-white text-white dark:text-black font-black text-xs uppercase tracking-[0.3em] rounded-2xl hover:bg-[#fbbc05] transition-all shadow-xl shadow-gray-900/10 hover:shadow-amber-500/30 transform hover:-translate-y-1 active:scale-95 duration-300 relative z-10"
              >
                {t('cart.continueTo')}
              </button>
              <p className="text-center text-[10px] text-gray-400 dark:text-gray-500 mt-6 uppercase tracking-[0.25em] sm:tracking-[0.5em] font-black opacity-40">Guaranteed Fresh • Direct From Roots • Secure Chain</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
