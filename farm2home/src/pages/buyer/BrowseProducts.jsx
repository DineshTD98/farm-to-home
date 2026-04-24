import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { selectCurrentUser } from '../../redux/slices/authSlice';
import { getAllProducts, UPLOADS_BASE } from '../../api/products';
import { getNotifications } from '../../api/notifications';
import { addToCart, selectCartItems } from '../../redux/slices/cartSlice';
import { selectUnreadCount } from '../../redux/slices/chatSlice';
import MapPicker from '../../components/MapPicker';
import axios from 'axios';
import { checkProductSubscription, subscribeToProduct, unsubscribeFromProduct } from '../../api/subscriptions';
import { getFarmFeed } from '../../api/farmPosts';
import FarmFeedStream from '../../components/buyer/FarmFeedStream';
import BuyerFarmerChatPanel from '../../components/buyer/BuyerFarmerChatPanel';
import { markNotificationRead } from '../../api/notifications';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-hot-toast';

const BrowseProducts = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const dispatch = useDispatch();
  const { t } = useTranslation();

  // Helper to parse quantity string (e.g., "100 kg" -> 100)
  const parseQty = (qtyStr) => {
    if (!qtyStr) return 0;
    const match = String(qtyStr).match(/(\d+(\.\d+)?)/);
    return match ? parseFloat(match[1]) : 0;
  };

  const cartItems = useSelector(selectCartItems);
  const user = useSelector(selectCurrentUser);
  const unreadChatCount = useSelector(selectUnreadCount);
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [numQuantity, setNumQuantity] = useState(1);
  const [unreadCount, setUnreadCount] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [appliedSearchQuery, setAppliedSearchQuery] = useState('');
  const [radius, setRadius] = useState(50); // Default 50km
  const [buyerLocation, setBuyerLocation] = useState(null);
  const [locationStatus, setLocationStatus] = useState('idle'); // idle, loading, success, error
  const [showMap, setShowMap] = useState(false);
  const [pincode, setPincode] = useState(user?.pincode || '');
  const [latestStockAlert, setLatestStockAlert] = useState(null);
  const [subscriptions, setSubscriptions] = useState({}); // { productId: true/false }
  const [buyerView, setBuyerView] = useState(() =>
    searchParams.get('view') === 'feed' ? 'feed' : 'marketplace'
  );
  const [feedPosts, setFeedPosts] = useState([]);
  const [feedLoading, setFeedLoading] = useState(false);
  const [chatFarmer, setChatFarmer] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const detectLocation = () => {
      if (user && user.location && user.location.coordinates && user.location.coordinates[0] !== 0) {
        setBuyerLocation({
          lat: user.location.coordinates[1],
          lng: user.location.coordinates[0]
        });
        setLocationStatus('success');
        return;
      }

      if (navigator.geolocation) {
        setLocationStatus('loading');
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setBuyerLocation({
              lat: position.coords.latitude,
              lng: position.coords.longitude
            });
            setLocationStatus('success');
          },
          () => {
            setLocationStatus('error');
          }
        );
      }
    };
    detectLocation();
  }, [user]);

  const handlePincodeChange = async (e) => {
    const code = e.target.value;
    setPincode(code);
    if (code.length === 6) {
      try {
        const response = await axios.get(`https://nominatim.openstreetmap.org/search?postalcode=${code}&country=India&format=json`);
        if (response.data && response.data.length > 0) {
          const { lat, lon } = response.data[0];
          setBuyerLocation({
            lat: parseFloat(lat),
            lng: parseFloat(lon)
          });
          setLocationStatus('success');
        }
      } catch (err) {
        console.error('Geocoding error:', err);
      }
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const params = {
          category: selectedCategory === 'All' ? undefined : selectedCategory,
          lat: buyerLocation?.lat,
          lng: buyerLocation?.lng,
          radius: buyerLocation ? radius : undefined
        };

        const [rawProdData, notifData] = await Promise.all([
          getAllProducts(params),
          getNotifications(user.id || user._id)
        ]);
        
        // Filter out orphaned products whose farmer account no longer exists
        const prodData = rawProdData.filter(p => p.farmerId && (p.farmerId._id || typeof p.farmerId === 'string'));
        
        setProducts(prodData);
        setUnreadCount(notifData.filter(n => !n.isRead).length);

        // Check for latest stock alert
        const stockAlert = notifData.find(n => n.type === 'Stock Update' && !n.isRead);
        if (stockAlert) {
          setLatestStockAlert(stockAlert);
        }

        // Check subscriptions for out of stock items
        const outOfStockIds = prodData.filter(p => parseQty(p.quantity) <= 0).map(p => p._id);
        const subStatus = {};
        for (const id of outOfStockIds) {
          subStatus[id] = await checkProductSubscription(user.id || user._id, id);
        }
        setSubscriptions(subStatus);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchData();
  }, [user, selectedCategory, buyerLocation, radius]);

  useEffect(() => {
    if (searchParams.get('view') === 'feed') {
      setBuyerView('feed');
    } else {
      setBuyerView('marketplace');
    }
  }, [searchParams]);

  const viewerId = user?.id || user?._id;

  const loadFeed = useCallback(async () => {
    if (!viewerId) return;
    setFeedLoading(true);
    try {
      const data = await getFarmFeed(viewerId);
      setFeedPosts(data);
    } catch (err) {
      console.error(err);
      setFeedPosts([]);
    } finally {
      setFeedLoading(false);
    }
  }, [viewerId]);

  useEffect(() => {
    if (!user || buyerView !== 'feed') return;
    loadFeed();
  }, [user, buyerView, loadFeed]);

  const handleNotifyMe = async (productId) => {
    try {
      if (subscriptions[productId]) {
        await unsubscribeFromProduct(user.id || user._id, productId);
        setSubscriptions({ ...subscriptions, [productId]: false });
        toast.success('Unsubscribed from stock notifications');
      } else {
        await subscribeToProduct(user.id || user._id, productId);
        setSubscriptions({ ...subscriptions, [productId]: true });
        toast.success('You will be notified when this product is back in stock! 🌾');
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  const dismissAlert = async () => {
    if (latestStockAlert) {
      try {
        await markNotificationRead(latestStockAlert._id);
        setLatestStockAlert(null);
        setUnreadCount(prev => Math.max(0, prev - 1));
      } catch (err) {
        console.error('Dismiss alert error:', err);
      }
    }
  };

  const getDistanceStr = (farmerLoc) => {
    if (!buyerLocation || !farmerLoc?.coordinates) return null;
    const lat1 = buyerLocation.lat;
    const lon1 = buyerLocation.lng;
    const lat2 = farmerLoc.coordinates[1];
    const lon2 = farmerLoc.coordinates[0];
    
    const R = 6371; // km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * (Math.PI/180)) * Math.cos(lat2 * (Math.PI/180)) * 
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const d = R * c;
    return d < 1 ? '< 1 km' : `${d.toFixed(1)} km`;
  };

  const handleAddToCart = (product) => {
    dispatch(addToCart({
      product,
      quantity: numQuantity,
      price: (product.pricePerUnit || product.pricePerItem).toString(),
      farmerId: product.farmerId?._id || product.farmerId
    }));
    setSelectedProduct(null);
    setNumQuantity(1);
    toast.success(t('browse.addedAlert') || 'Added to cart!', { icon: '🛒' });
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return '/placeholder.jpg';
    if (imagePath.startsWith('http')) return imagePath;
    return `${UPLOADS_BASE}${imagePath.replace('/uploads', '')}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] flex flex-col font-sans transition-colors duration-500 text-gray-900 dark:text-white overflow-x-hidden">
      {/* Navbar */}
      <nav className="bg-white dark:bg-[#111111] border-b border-gray-100 dark:border-white/5 sticky top-0 z-50 shadow-sm transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Logo */}
            <div 
              className="text-lg sm:text-xl font-black tracking-tighter text-gray-900 dark:text-white uppercase cursor-pointer flex items-center gap-2" 
              onClick={() => navigate('/buyer-portal')}
            >
              <span className="text-2xl">🌾</span>
              <span className="hidden xs:block">Farm<span className="text-[#fbbc05]">2</span>Home</span>
            </div>

            {/* Desktop Actions */}
            <div className="hidden lg:flex items-center gap-4">
              <div className="flex bg-gray-50 dark:bg-white/5 p-1 rounded-xl border border-gray-100 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => { setBuyerView('feed'); setSearchParams({ view: 'feed' }); }}
                  className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${buyerView === 'feed' ? 'bg-[#fbbc05] text-white shadow-md' : 'text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
                >
                  {t('browse.feedTab')}
                </button>
                <button
                  type="button"
                  onClick={() => { setBuyerView('marketplace'); setSearchParams({}); }}
                  className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${buyerView === 'marketplace' ? 'bg-[#fbbc05] text-white shadow-md' : 'text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
                >
                  {t('browse.marketplaceTab')}
                </button>
              </div>
              
              <div className="flex items-center gap-1">
                {buyerView === 'feed' && (
                  <button
                    onClick={() => navigate('/buyer/messages')}
                    className="p-2 text-gray-400 hover:text-[#fbbc05] transition-colors relative"
                    title={t('browse.messages')}
                  >
                    <span className="text-xl">💬</span>
                    {unreadChatCount > 0 && (
                      <span className="absolute top-0 right-0 bg-red-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full border border-white dark:border-[#111111]">
                        {unreadChatCount}
                      </span>
                    )}
                  </button>
                )}
                <button
                  onClick={() => navigate('/buyer/cart')}
                  className={`relative p-2.5 rounded-xl transition-all ${
                    cartItems.length > 0
                      ? 'bg-[#fbbc05] text-white shadow-lg shadow-amber-500/30'
                      : 'text-gray-400 hover:text-[#fbbc05]'
                  }`}
                  title="Cart"
                >
                  <span className="text-xl">🛒</span>
                  {cartItems.length > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-500 text-white text-[9px] leading-[18px] font-black px-1 rounded-full border-2 border-white dark:border-[#111111]">
                      {cartItems.length}
                    </span>
                  )}
                </button>
                <button onClick={() => navigate('/buyer/notifications')} className="relative p-2 text-gray-400 hover:text-[#fbbc05] transition-colors" title="Notifications">
                  <span className="sr-only">Notifications</span>
                  <span className="text-xl">🔔</span>
                  {unreadCount > 0 && <span className="absolute top-0 right-0 bg-red-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full">{unreadCount}</span>}
                </button>
              </div>

              <div className="h-6 w-px bg-gray-100 dark:bg-white/10 mx-2"></div>

              <button onClick={() => navigate('/buyer/orders')} className="px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                My Orders
              </button>
              <button onClick={() => navigate('/buyer-portal')} className="px-5 py-2 rounded-lg bg-gray-900 dark:bg-[#fbbc05] text-white dark:text-black text-[10px] font-black uppercase tracking-widest hover:brightness-110 transition-all">
                Portal
              </button>
            </div>

            {/* Mobile Actions Container */}
            <div className="flex lg:hidden items-center gap-3">
              {cartItems.length > 0 && (
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
              <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 text-gray-900 dark:text-white"
                title={isMenuOpen ? 'Close menu' : 'Open menu'}
              >
                <span className="text-xl">{isMenuOpen ? '✕' : '☰'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        {isMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-[70]">
            <button
              type="button"
              aria-label="Close menu backdrop"
              onClick={() => setIsMenuOpen(false)}
              className="absolute inset-0 bg-black/30 backdrop-blur-[1px]"
            />
            <div className="absolute right-0 top-0 h-full w-[88vw] max-w-sm overflow-y-auto bg-white dark:bg-[#111111] border-l border-gray-100 dark:border-white/10 shadow-2xl animate-in slide-in-from-right duration-300">
              <div className="p-6 flex flex-col gap-4">
                <div className="flex items-center justify-between mb-1">
                  <div className="text-[11px] font-black uppercase tracking-widest text-gray-400">Menu</div>
                  <button
                    type="button"
                    onClick={() => setIsMenuOpen(false)}
                    className="w-9 h-9 rounded-full bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 text-gray-900 dark:text-white"
                  >
                    ✕
                  </button>
                </div>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => { setBuyerView('feed'); setSearchParams({ view: 'feed' }); setIsMenuOpen(false); }}
                  className={`flex flex-col items-center justify-center p-4 rounded-2xl border ${buyerView === 'feed' ? 'bg-amber-50 border-amber-200 dark:bg-amber-500/10 dark:border-amber-500/20' : 'border-gray-100 dark:border-white/5'}`}
                >
                  <span className="text-2xl mb-1">🌾</span>
                  <span className={`text-[10px] font-black uppercase tracking-widest ${buyerView === 'feed' ? 'text-[#fbbc05]' : 'text-gray-400'}`}>{t('browse.feedTab')}</span>
                </button>
                <button
                  onClick={() => { setBuyerView('marketplace'); setSearchParams({}); setIsMenuOpen(false); }}
                  className={`flex flex-col items-center justify-center p-4 rounded-2xl border ${buyerView === 'marketplace' ? 'bg-amber-50 border-amber-200 dark:bg-amber-500/10 dark:border-amber-500/20' : 'border-gray-100 dark:border-white/5'}`}
                >
                  <span className="text-2xl mb-1">🛒</span>
                  <span className={`text-[10px] font-black uppercase tracking-widest ${buyerView === 'marketplace' ? 'text-[#fbbc05]' : 'text-gray-400'}`}>{t('browse.marketplaceTab')}</span>
                </button>
              </div>

              <div className="flex flex-col gap-2">
                <button onClick={() => { navigate('/buyer/cart'); setIsMenuOpen(false); }} className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white font-bold">
                  <div className="flex items-center gap-4">
                    <span className="text-xl">🛒</span> Cart
                  </div>
                  {cartItems.length > 0 && <span className="bg-[#fbbc05] text-white text-[10px] font-black px-2 py-0.5 rounded-full">{cartItems.length}</span>}
                </button>
                {buyerView === 'feed' && (
                  <button onClick={() => { navigate('/buyer/messages'); setIsMenuOpen(false); }} className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white font-bold w-full">
                    <div className="flex items-center gap-4">
                      <span className="text-xl">💬</span> {t('browse.messages')}
                    </div>
                    {unreadChatCount > 0 && <span className="bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full">{unreadChatCount}</span>}
                  </button>
                )}
                <button onClick={() => { navigate('/buyer/orders'); setIsMenuOpen(false); }} className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white font-bold">
                  <span className="text-xl">📋</span> My Orders
                </button>
              </div>

              <button onClick={() => { navigate('/buyer-portal'); setIsMenuOpen(false); }} className="w-full py-5 rounded-[1.5rem] bg-[#fbbc05] text-white text-[12px] font-black uppercase tracking-widest shadow-lg shadow-amber-500/20">
                Go to Portal
              </button>
            </div>
          </div>
          </div>
        )}
      </nav>

      <div className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-10 overflow-x-hidden">
        {buyerView === 'feed' ? (
          <div className="space-y-8">
            <div className="relative overflow-hidden rounded-[2rem] border border-amber-200/60 dark:border-amber-500/25 bg-gradient-to-br from-amber-50/90 via-white to-orange-50/70 dark:from-[#1c1814] dark:via-[#141414] dark:to-[#1a140e] p-8 sm:p-10 shadow-sm">
              <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-amber-400/20 blur-3xl dark:bg-amber-500/10 pointer-events-none" />
              <div className="relative flex flex-col sm:flex-row sm:items-center gap-6">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-600 text-3xl shadow-lg shadow-amber-900/15">
                  🌾
                </div>
                <div>
                  <h1 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white uppercase tracking-tighter leading-tight">
                    {t('browse.feedTitle')}
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mt-2 font-medium max-w-xl">
                    {t('browse.feedSubtitle')}
                  </p>
                </div>
              </div>
            </div>
            <FarmFeedStream
              posts={feedPosts}
              loading={feedLoading}
              emptyHint={t('browse.feedEmpty')}
              viewerId={viewerId}
              onRefresh={loadFeed}
            />
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-6 mb-12">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <h1 className="text-4xl font-black text-gray-900 dark:text-white uppercase tracking-tighter leading-none">Marketplace</h1>
                  <p className="text-gray-500 dark:text-gray-400 text-sm mt-2 font-medium italic">Directly from farm to your table</p>
                </div>
                <div className="w-full md:max-w-md">
                  <label className="block text-[10px] text-gray-400 dark:text-gray-500 font-black uppercase tracking-[0.2em] mb-2 px-1">Search Produce</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && setAppliedSearchQuery(searchQuery)}
                      placeholder="Search by produce, farmer, or category"
                      className="w-full bg-white dark:bg-[#111111] border border-gray-100 dark:border-white/10 rounded-2xl pl-4 pr-12 py-3 text-gray-900 dark:text-white text-sm font-medium placeholder-gray-400 focus:outline-none focus:border-[#fbbc05] focus:ring-4 focus:ring-amber-500/10 transition-all shadow-sm"
                    />
                    <button 
                      onClick={() => setAppliedSearchQuery(searchQuery)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-xl text-gray-400 hover:text-[#fbbc05] hover:bg-amber-50 dark:hover:bg-amber-500/10 transition-all"
                      title="Search"
                    >
                      <span className="text-xl">🔍</span>
                    </button>
                  </div>
                </div>
                <div className="w-full md:w-48">
                  <label className="block text-[10px] text-gray-400 dark:text-gray-500 font-black uppercase tracking-[0.2em] mb-2 px-1">
                    {t('browse.categories')}
                  </label>
                  <div className="relative group">
                    <select 
                      value={selectedCategory} 
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full bg-white dark:bg-[#111111] border border-gray-100 dark:border-white/10 rounded-2xl px-5 py-3.5 text-gray-900 dark:text-white text-[11px] font-black uppercase tracking-widest appearance-none cursor-pointer focus:outline-none focus:border-[#fbbc05] focus:ring-4 focus:ring-amber-500/5 transition-all shadow-sm pr-10"
                    >
                      {['All', 'Vegetables', 'Fruits', 'Grains', 'Dairy', 'Poultry', 'Others'].map(cat => (
                        <option key={cat} value={cat} className="dark:bg-[#111111] py-2">
                          {cat}
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#fbbc05] group-hover:scale-110 transition-transform">
                      <span className="text-[10px]">▼</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-[#111111] border border-gray-100 dark:border-white/5 p-8 rounded-[3rem] flex flex-col items-center gap-8 shadow-sm">
                <div className="flex flex-col md:flex-row items-center gap-10 w-full">
                  <div className="flex items-center gap-5 flex-1 w-full">
                    <div className="w-14 h-14 rounded-[1.5rem] bg-amber-50 dark:bg-white/5 flex items-center justify-center text-2xl shadow-inner shadow-amber-900/5">📍</div>
                    <div className="flex-1">
                      <div className="text-[10px] text-gray-400 dark:text-gray-500 font-black uppercase tracking-[0.2em] mb-2 px-1">Search Radius</div>
                      <div className="flex items-center gap-6">
                        <input 
                          type="range" 
                          min="1" 
                          max="500" 
                          value={radius} 
                          onChange={(e) => setRadius(parseInt(e.target.value))}
                          className="flex-1 h-2 bg-gray-100 dark:bg-white/10 rounded-full appearance-none cursor-pointer accent-[#fbbc05]"
                        />
                        <span className="text-gray-900 dark:text-white font-black text-sm min-w-[70px] bg-amber-50 dark:bg-white/10 px-3 py-1 rounded-lg text-center">{radius} km</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="h-10 w-px bg-gray-100 dark:bg-white/10 hidden md:block"></div>
                  
                  <div className="flex items-center gap-5 w-full md:w-auto">
                    <div className="flex-1 md:w-40">
                      <div className="text-[10px] text-gray-400 dark:text-gray-500 font-black uppercase tracking-[0.2em] mb-2 px-1">Pincode</div>
                      <input 
                        type="text" 
                        value={pincode}
                        onChange={handlePincodeChange}
                        placeholder="600001"
                        maxLength={6}
                        className="w-full bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl px-4 py-2.5 text-gray-900 dark:text-white text-xs font-bold focus:outline-none focus:border-[#fbbc05] focus:ring-4 focus:ring-amber-500/5 transition-all"
                      />
                    </div>
                    <button 
                      onClick={() => setShowMap(!showMap)}
                      className="px-6 py-3 rounded-2xl bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 text-[10px] text-gray-400 dark:text-gray-500 font-black uppercase tracking-widest hover:text-gray-900 dark:hover:text-white hover:border-gray-900 dark:hover:border-white transition-all shadow-sm"
                    >
                      {showMap ? 'Hide Map' : 'Set on Map'}
                    </button>
                    <div className={`px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border shadow-sm ${
                      locationStatus === 'success' ? 'bg-amber-50 dark:bg-amber-400/10 border-amber-100 dark:border-amber-400/20 text-[#fbbc05]' : 
                      locationStatus === 'loading' ? 'bg-blue-50 border-blue-100 text-blue-500' :
                      'bg-red-50 border-red-100 text-red-500'
                    }`}>
                      {locationStatus === 'success' ? '📍 ACTIVE' : 
                       locationStatus === 'loading' ? '⌛ DETECTING' : '⚠️ GPS'}
                    </div>
                  </div>
                </div>

                {showMap && (
                  <div className="w-full animate-in slide-in-from-top duration-300">
                    <div className="border border-gray-100 dark:border-white/10 rounded-[2.5rem] overflow-hidden shadow-inner">
                      <MapPicker 
                        lat={buyerLocation?.lat} 
                        lng={buyerLocation?.lng} 
                        onChange={(pos) => {
                          setBuyerLocation(pos);
                          setLocationStatus('success');
                        }}
                      />
                    </div>
                    <p className="text-[10px] text-gray-400 mt-4 text-center uppercase font-black tracking-widest">Selected location will be used to filter fresh products automatically</p>
                  </div>
                )}
              </div>
            </div>

            {error && (
              <div className="mb-8 p-4 rounded-2xl bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 text-red-600 dark:text-red-400 text-sm font-medium">
                {error}
              </div>
            )}
            {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <div key={i} className="bg-white dark:bg-[#111111] border border-gray-100 dark:border-white/5 rounded-[2.5rem] h-80 animate-pulse"></div>
            ))}
          </div>
        ) : (
          <div className="relative">
            {latestStockAlert && (
              <div className="fixed bottom-10 left-1/2 -translate-x-1/2 w-full max-w-md z-[60] animate-in slide-in-from-bottom duration-500">
                <div className="bg-[#fbbc05] text-white p-6 rounded-[2rem] shadow-2xl flex items-center justify-between border-b-4 border-amber-600">
                  <div className="flex items-center gap-4">
                    <span className="text-3xl animate-bounce">🌟</span>
                    <div>
                      <div className="text-[10px] font-black uppercase tracking-widest opacity-80 mb-0.5">Quick Update</div>
                      <p className="text-sm font-black tracking-tight">{latestStockAlert.message}</p>
                    </div>
                  </div>
                  <button onClick={dismissAlert} className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-all text-sm font-black">✕</button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {products
                .filter((p) => {
                  const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
                  if (!matchesCategory) return false;
                  const query = appliedSearchQuery.trim().toLowerCase();
                  if (!query) return true;
                  const farmerName = `${p.farmerId?.firstName || ''} ${p.farmerId?.lastName || ''}`.toLowerCase();
                  const searchableText = `${p.name || ''} ${p.category || ''} ${p.description || ''} ${farmerName}`.toLowerCase();
                  return searchableText.includes(query);
                })
                .map((product) => {
                  const isOutOfStock = parseQty(product.quantity) <= 0;
                  return (
                    <div 
                      key={product._id} 
                      className={`bg-white dark:bg-[#111111] border border-gray-100 dark:border-white/5 rounded-[2.5rem] overflow-hidden group hover:border-[#fbbc05] hover:-translate-y-1.5 transition-all duration-500 cursor-pointer shadow-sm hover:shadow-2xl relative ${isOutOfStock ? 'opacity-50 grayscale-[0.2]' : ''}`}
                      onClick={() => !isOutOfStock && setSelectedProduct(product)}
                    >
                      {isOutOfStock && (
                        <div className="absolute top-5 right-5 z-20">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleNotifyMe(product._id);
                            }}
                            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all shadow-xl ${subscriptions[product._id] ? 'bg-[#fbbc05] text-white' : 'bg-white/90 dark:bg-white/10 text-gray-400 hover:text-[#fbbc05]'}`}
                            title={subscriptions[product._id] ? 'Subscribed to stock updates' : 'Notify me when back in stock'}
                          >
                            <span className="text-xl">{subscriptions[product._id] ? '🔔' : '🔕'}</span>
                          </button>
                        </div>
                      )}
                      <div className="h-56 overflow-hidden relative">
                        <img 
                          src={getImageUrl(product.image)} 
                          alt={product.name} 
                          onError={(e) => { e.target.src = '/placeholder.jpg'; }}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                        />
                        <div className="absolute top-5 left-5">
                          <span className={`px-4 py-1.5 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm ${isOutOfStock ? 'bg-red-500 text-white' : 'bg-white/80 dark:bg-[#111111]/80 text-gray-900 dark:text-white border border-white/20'}`}>
                            {isOutOfStock ? 'Sold Out' : product.category}
                          </span>
                        </div>
                      </div>
                      <div className="p-8">
                        <div className="flex justify-between items-start mb-4">
                          <h3 className="text-xl font-black text-gray-900 dark:text-white tracking-tight uppercase leading-none">{product.name}</h3>
                          <div className="text-lg font-black text-[#fbbc05]">₹{product.pricePerUnit || product.pricePerItem}/{product.unit || 'kg'}</div>
                        </div>
                        <div className="flex items-center justify-between mb-8">
                          <div className="flex items-center gap-3">
                            <div className="w-6 h-6 rounded-full bg-gray-50 dark:bg-white/10 flex items-center justify-center text-[11px] border border-gray-100 dark:border-white/10 shadow-inner">🧑‍🌾</div>
                            <span className="text-gray-400 dark:text-gray-500 text-[10px] font-black uppercase tracking-widest">{product.farmerId?.firstName} {product.farmerId?.lastName}</span>
                          </div>
                          {buyerLocation && product.farmerId?.location && (
                            <span className="text-[#fbbc05] text-[10px] font-black uppercase tracking-widest bg-amber-50 dark:bg-amber-400/10 px-2 py-0.5 rounded-lg">{getDistanceStr(product.farmerId.location)}</span>
                          )}
                        </div>
                        <button className={`w-full py-4 border rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-sm ${isOutOfStock ? 'bg-red-50 dark:bg-red-900/10 border-red-100 dark:border-red-900/20 text-red-500 cursor-not-allowed' : 'bg-gray-900 dark:bg-white text-white dark:text-black group-hover:bg-[#fbbc05] group-hover:border-[#fbbc05] shadow-lg shadow-gray-900/10 group-hover:shadow-amber-500/20'}`}>
                          {isOutOfStock ? 'Out of Stock' : 'View Harvest'}
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}
          </>
        )}
      </div>

      {/* Product Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-white/40 dark:bg-black/40 backdrop-blur-md" onClick={() => setSelectedProduct(null)}></div>
          <div className="relative w-full max-w-5xl bg-white dark:bg-[#111111] border border-gray-100 dark:border-white/5 rounded-[4rem] overflow-hidden shadow-2xl animate-in zoom-in duration-300">
            <div className="flex flex-col md:flex-row h-full max-h-[90vh]">
              <div className="w-full md:w-[45%] h-72 md:h-auto relative overflow-hidden">
                <img 
                  src={getImageUrl(selectedProduct.image)} 
                  className="w-full h-full object-cover" 
                  alt="" 
                  onError={(e) => { e.target.src = '/placeholder.jpg'; }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20"></div>
                <div className="absolute top-8 left-8">
                  <span className="px-5 py-2 bg-[#fbbc05] text-white text-[11px] font-black uppercase tracking-[0.25em] rounded-full shadow-xl flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span> Certified Fresh
                  </span>
                </div>
              </div>
              <div className="w-full md:w-[55%] p-10 md:p-16 flex flex-col overflow-y-auto bg-white dark:bg-[#111111]">
                <button 
                  onClick={() => setSelectedProduct(null)}
                  className="absolute top-10 right-10 w-12 h-12 rounded-full bg-gray-50 dark:bg-white/5 flex items-center justify-center text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition-all rotate-45 text-3xl font-light shadow-sm"
                >
                  +
                </button>
                
                <div className="mb-10">
                  <div className="text-[11px] text-[#fbbc05] font-black uppercase tracking-[0.4em] mb-4">Direct from Farm</div>
                  <h2 className="text-5xl font-black text-gray-900 dark:text-white uppercase tracking-tighter leading-none mb-6">{selectedProduct.name}</h2>
                  <p className="text-gray-500 dark:text-gray-400 text-base leading-relaxed mb-8 font-medium italic">"{selectedProduct.description || 'Grown with traditional methods, harvested daily. We bring the pure taste of agriculture directly from our fields to your family table with absolute transparency and care.'}"</p>
                  
                  <div className="flex items-center justify-between p-6 bg-gray-50 dark:bg-white/5 rounded-[2rem] border border-gray-100 dark:border-white/10 mb-8 shadow-inner">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-white dark:bg-white/10 flex items-center justify-center text-2xl border border-gray-100 dark:border-white/10 shadow-sm">👨‍🌾</div>
                      <div>
                        <div className="text-[10px] text-gray-400 dark:text-gray-500 uppercase font-black tracking-widest mb-0.5">Producer</div>
                        <div className="text-gray-900 dark:text-white font-bold text-lg">{selectedProduct.farmerId?.firstName} {selectedProduct.farmerId?.lastName}</div>
                      </div>
                    </div>
                    {buyerLocation && selectedProduct.farmerId?.location && (
                      <div className="text-right">
                        <div className="text-[10px] text-gray-400 dark:text-gray-500 uppercase font-black tracking-widest mb-0.5">Location</div>
                        <div className="text-[#fbbc05] font-black text-lg">{getDistanceStr(selectedProduct.farmerId.location)} away</div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6 mb-10">
                  <div className="bg-white dark:bg-white/5 p-6 rounded-3xl border border-gray-100 dark:border-white/10 shadow-sm">
                    <div className="text-[10px] text-gray-400 dark:text-gray-500 uppercase font-black tracking-widest mb-2 px-1">Available Harvest</div>
                    <div className="text-2xl font-black text-gray-900 dark:text-white">{selectedProduct.quantity} <span className="text-sm font-medium text-gray-300 dark:text-gray-600">{selectedProduct.unit || 'Units'}</span></div>
                  </div>
                  <div className="bg-white dark:bg-white/5 p-6 rounded-3xl border border-gray-100 dark:border-white/10 shadow-sm">
                    <div className="text-[10px] text-gray-400 dark:text-gray-500 uppercase font-black tracking-widest mb-2 px-1">Price per {selectedProduct.unit || 'Unit'}</div>
                    <div className="text-2xl font-black text-gray-900 dark:text-white">₹{selectedProduct.pricePerUnit || selectedProduct.pricePerItem}</div>
                  </div>
                </div>

                <div className="mb-10 p-8 bg-amber-50/50 dark:bg-amber-400/5 border border-amber-100 dark:border-amber-400/10 rounded-[2.5rem] shadow-inner shadow-amber-900/5">
                  <div className="text-[10px] text-[#fbbc05] uppercase font-black tracking-widest mb-4">Quantity Select</div>
                  <div className="flex items-center gap-8">
                    <div className="flex items-center bg-white dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/10 overflow-hidden shadow-sm">
                      <button 
                        onClick={() => {
                          const step = (selectedProduct.unit === 'kg' || selectedProduct.unit === 'litre') ? 0.25 : 1;
                          setNumQuantity(Math.max(step, Math.round((numQuantity - step) * 100) / 100));
                        }}
                        className="w-12 h-12 text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5 transition-all font-light text-2xl"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        min="0.1"
                        step={ (selectedProduct.unit === 'kg' || selectedProduct.unit === 'litre') ? "0.25" : "1" }
                        max={Number(selectedProduct.quantity)}
                        value={numQuantity}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value);
                          const max = Number(selectedProduct.quantity);
                          if (isNaN(val) || val < 0.01) {
                            setNumQuantity(0.25);
                          } else if (val > max) {
                            toast.error(`Only ${max} ${selectedProduct.unit} available in stock!`);
                            setNumQuantity(max);
                          } else {
                            setNumQuantity(val);
                          }
                        }}
                        className="w-20 bg-transparent text-gray-900 dark:text-white font-black text-center focus:outline-none border-x border-gray-50 dark:border-white/5 py-3 text-lg [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                      <button 
                        onClick={() => {
                          const step = (selectedProduct.unit === 'kg' || selectedProduct.unit === 'litre') ? 0.25 : 1;
                          const max = Number(selectedProduct.quantity);
                          if (numQuantity + step <= max) {
                            setNumQuantity(Math.round((numQuantity + step) * 100) / 100);
                          } else {
                            toast.error(`Maximum stock limit reached (${max} ${selectedProduct.unit})!`);
                          }
                        }}
                        className="w-12 h-12 text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5 transition-all font-light text-2xl"
                      >
                        +
                      </button>
                    </div>
                    <div className="flex-1 text-right">
                      <div className="text-[10px] text-gray-400 dark:text-gray-500 uppercase font-black tracking-widest mb-1">Estimated Total</div>
                      <div className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter">₹{( (parseFloat(selectedProduct.pricePerUnit || selectedProduct.pricePerItem) * numQuantity) || 0).toFixed(2)}</div>
                    </div>
                  </div>
                </div>

                <div className="mt-auto grid grid-cols-1 gap-4">
                  <button 
                    onClick={() => handleAddToCart(selectedProduct)}
                    className="w-full py-6 bg-gray-900 dark:bg-[#fbbc05] rounded-[1.5rem] text-white dark:text-black text-[12px] font-black uppercase tracking-[0.25em] shadow-xl shadow-gray-900/10 hover:bg-[#fbbc05] hover:shadow-amber-500/30 hover:-translate-y-1 active:translate-y-0 transition-all duration-300"
                  >
                    Add to Cart
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const f = selectedProduct.farmerId;
                      if (f && (f._id || f)) {
                        setSelectedProduct(null);
                        setChatFarmer(f);
                      }
                    }}
                    className="w-full py-4 rounded-[1.5rem] border-2 border-gray-200 dark:border-white/15 text-gray-900 dark:text-white text-[11px] font-black uppercase tracking-widest hover:border-[#fbbc05] hover:text-[#fbbc05] transition-colors"
                  >
                    {t('browse.messageFarmer')}
                  </button>
                  <button 
                    onClick={() => {
                      handleAddToCart(selectedProduct);
                      navigate('/buyer/cart');
                    }}
                    className="w-full py-4 text-gray-400 dark:text-gray-500 text-[10px] font-black uppercase tracking-widest hover:text-gray-900 dark:hover:text-white transition-colors"
                  >
                    Quick Checkout
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {chatFarmer && user && (user.id || user._id) && (
        <BuyerFarmerChatPanel
          farmer={chatFarmer}
          buyerId={user.id || user._id}
          onClose={() => setChatFarmer(null)}
        />
      )}
    </div>
  );
};

export default BrowseProducts;
