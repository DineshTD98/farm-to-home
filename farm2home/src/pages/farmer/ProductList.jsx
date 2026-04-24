import { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../../redux/slices/authSlice';
import { getFarmerProducts, deleteProduct } from '../../api/products';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-hot-toast';

const ProductList = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const user = useSelector(selectCurrentUser) || {};
  const { isDarkMode } = useTheme();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const getImageUrl = (imagePath) => {
    if (!imagePath) return '';
    if (imagePath.startsWith('http')) return imagePath;

    // Use absolute URL from environment or local base
    const UPLOADS_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5008';
    return `${UPLOADS_BASE}${imagePath.startsWith('/') ? '' : '/'}${imagePath.replace('/uploads', '')}`;
  };

  const fetchProducts = async () => {
    try {
      const data = await getFarmerProducts(user.id || user._id);
      setProducts(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user.id || user._id) fetchProducts();
  }, [user.id, user._id]);

  const handleDelete = async (id) => {
    if (!window.confirm(t('farmerProducts.deleteConfirm'))) return;
    try {
      await deleteProduct(id);
      setProducts(products.filter(p => p._id !== id));
      toast.success(t('common.deleted') || 'Product deleted successfully');
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] flex flex-col font-sans transition-colors duration-500 text-gray-900 dark:text-white">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-8 py-4 bg-white dark:bg-[#111111] border-b border-gray-100 dark:border-white/5 sticky top-0 z-50 shadow-sm transition-colors duration-500">
        <div className="flex items-center gap-2 cursor-pointer group" onClick={() => navigate('/farmer-portal')}>
          <span className="text-2xl group-hover:scale-110 transition-transform">🌾</span>
          <div className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tighter">
            Farm<span className="text-green-600">2</span>Home
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/farmer/add-product')}
            className="px-6 py-2.5 rounded-full bg-gray-900 dark:bg-white text-white dark:text-black text-[10px] font-black uppercase tracking-widest hover:bg-green-600 transition-all shadow-lg shadow-gray-900/10"
          >
            + {t('farmerProducts.addProduct')}
          </button>
          <button
            onClick={() => navigate('/farmer-portal')}
            className="px-6 py-2.5 rounded-full border border-gray-200 dark:border-white/10 text-gray-400 dark:text-gray-500 text-[10px] font-black uppercase tracking-widest hover:text-gray-900 dark:hover:text-white hover:border-gray-900 dark:hover:border-white transition-all"
          >
            {t('common.dashboard')}
          </button>
        </div>
      </nav>

      <div className="flex-1 max-w-6xl w-full mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-8">
          <div>
            <h1 className="text-5xl font-black text-gray-900 dark:text-white uppercase tracking-tighter leading-none">{t('farmerProducts.title')}</h1>
            <p className="text-gray-400 dark:text-gray-500 font-bold text-xs mt-3 uppercase tracking-[0.4em] flex items-center gap-3 px-1">
               {t('farmerProducts.subtitle')} <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse inline-block"></span>
            </p>
          </div>
          <div className="text-gray-400 dark:text-gray-500 text-[10px] font-black uppercase tracking-[0.2em] bg-white dark:bg-[#111111] border border-gray-100 dark:border-white/5 px-6 py-3 rounded-2xl shadow-sm transition-colors duration-500">
            {t('farmerProducts.inStock')}: <span className="text-green-600 dark:text-green-500 text-sm ml-2">{products.length}</span>
          </div>
        </div>

        {error && (
          <div className="p-6 rounded-[2rem] bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 text-red-600 dark:text-red-500 text-sm font-medium mb-10 shadow-sm animate-in fade-in slide-in-from-top duration-500 relative z-10 transition-colors duration-500">
            ⚠️ {error}
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 relative z-10">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white dark:bg-[#111111] border border-gray-100 dark:border-white/5 rounded-[3rem] h-[28rem] animate-pulse"></div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-32 bg-white dark:bg-[#111111] border border-dashed border-gray-200 dark:border-white/10 rounded-[4rem] shadow-inner shadow-gray-900/5 group relative z-10 transition-colors duration-500">
            <div className="text-7xl mb-8 opacity-20 group-hover:scale-110 transition-transform duration-700 transform grayscale group-hover:grayscale-0 group-hover:opacity-100">🚜</div>
            <h3 className="text-gray-900 dark:text-white font-black uppercase tracking-tighter text-2xl mb-3">{t('farmerProducts.emptyTitle')}</h3>
            <p className="text-gray-400 dark:text-gray-500 text-sm mt-2 mb-12 font-medium italic">{t('farmerProducts.emptyDesc')}</p>
            <button
              onClick={() => navigate('/farmer/add-product')}
              className="px-12 py-5 rounded-2xl bg-gray-900 dark:bg-white text-white dark:text-black font-black text-xs uppercase tracking-[0.2em] hover:bg-green-600 hover:-translate-y-1 transition-all shadow-xl shadow-gray-900/10 hover:shadow-green-500/20"
            >
              + {t('farmerProducts.addProduct')}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 relative z-10">
            {products.map((product) => (
              <div key={product._id} className="bg-white dark:bg-[#111111] border border-gray-100 dark:border-white/5 rounded-[3rem] overflow-hidden hover:border-green-500 hover:-translate-y-2 transition-all duration-500 group shadow-sm hover:shadow-2xl">
                <div className="h-60 overflow-hidden relative">
                  <img src={getImageUrl(product.image)} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  <div className="absolute top-6 right-6 px-5 py-2 bg-white/90 dark:bg-black/80 backdrop-blur-md rounded-full text-gray-900 dark:text-white text-[10px] font-black uppercase tracking-widest shadow-xl border border-white/50 dark:border-white/10">
                    ₹{product.pricePerUnit || product.pricePerItem} / {product.unit || 'UNIT'}
                  </div>
                </div>
                <div className="p-8">
                  <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-3 uppercase tracking-tighter leading-none">{product.name}</h3>
                  <div className="flex items-center justify-between p-4 bg-gray-50/50 dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/10 mb-8 border-dashed group-hover:border-green-500/20 group-hover:bg-green-50/20 transition-all">
                    <span className="text-gray-400 dark:text-gray-500 uppercase tracking-widest text-[9px] font-black">{t('farmerProducts.quantity')}</span>
                    <span className="text-green-600 dark:text-green-400 font-black text-lg">{product.quantity} <span className="text-[10px] uppercase">{product.unit || 'kg'}</span></span>
                  </div>
                  <div className="flex gap-4">
                    <button 
                      onClick={() => navigate(`/farmer/edit-product/${product._id}`)}
                      className="flex-1 py-4 text-[10px] font-black uppercase tracking-widest text-gray-900 dark:text-white bg-gray-50 dark:bg-white/10 rounded-2xl hover:bg-gray-100 dark:hover:bg-white/20 transition-all border border-gray-100 dark:border-white/10 shadow-sm"
                    >
                      ✏️ {t('farmerProducts.edit')}
                    </button>
                    <button 
                      onClick={() => handleDelete(product._id)}
                      className="flex-1 py-4 text-[10px] font-black uppercase tracking-widest text-red-500 dark:text-red-400 bg-red-50/50 dark:bg-red-900/10 rounded-2xl hover:bg-red-500 hover:text-white transition-all border border-red-50 dark:border-red-900/20 shadow-sm"
                    >
                      🗑️ {t('farmerProducts.delete')}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductList;
