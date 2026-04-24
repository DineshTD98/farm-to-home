import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../../redux/slices/authSlice';
import { getBuyerOrders } from '../../api/orders';
import { getBuyerReviews } from '../../api/reviews';
import { selectUnreadCount } from '../../redux/slices/chatSlice';
import ReviewModal from '../../components/ReviewModal';
import BuyerFarmerChatPanel from '../../components/buyer/BuyerFarmerChatPanel';
import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from 'react-i18next';

const UPLOADS_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5008';

const getImageUrl = (imagePath) => {
    if (!imagePath) return 'https://via.placeholder.com/100?text=Farm';
    if (imagePath.startsWith('http')) return imagePath;
    return `${UPLOADS_BASE}${imagePath.startsWith('/') ? '' : '/'}${imagePath}`;
};

const getItemTotal = (price, quantity) => {
    const p = parseFloat(price);
    const q = parseFloat(quantity);
    if (isNaN(p) || isNaN(q)) return '0.00';
    return (p * q).toFixed(2);
};

const OrderCard = ({ order, myReviews, onRate, onMessage }) => {
    const { t } = useTranslation();
    const firstItem = order.items[0];
    const firstFarmer = firstItem?.farmerId;
    const farmerId = String(firstFarmer?._id || firstFarmer || '');
    const hasReviewed = farmerId ? !!myReviews[farmerId] : false;

    return (
        <div className="bg-white dark:bg-[#111111] border border-gray-100 dark:border-white/5 rounded-[3rem] overflow-hidden shadow-sm hover:border-amber-200 transition-all mb-8 group">
            <div className="p-8 bg-gray-50/50 dark:bg-white/5 border-b border-gray-100 dark:border-white/5 flex items-center justify-between flex-wrap gap-6">
                <div className="flex items-center gap-5">
                    <div className="w-14 h-14 rounded-2xl bg-white dark:bg-white/10 border border-gray-100 dark:border-white/10 flex items-center justify-center text-2xl shadow-inner shadow-amber-900/5">
                        📦
                    </div>
                    <div>
                        <div className="text-gray-900 dark:text-white font-black text-sm uppercase tracking-tighter">
                            Order #{order._id.slice(-6).toUpperCase()}
                        </div>
                        <div className="text-gray-400 dark:text-gray-500 text-[10px] font-black uppercase tracking-[0.3em] mt-1.5">
                            {new Date(order.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-6 flex-wrap">
                    {order.status === 'Delivered' && farmerId && (
                        <button
                            onClick={() => onRate(firstFarmer)}
                            className="px-6 py-3 bg-white dark:bg-white/10 border border-amber-100 dark:border-amber-400/20 text-[#fbbc05] text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-[#fbbc05] dark:hover:bg-amber-400 hover:text-white hover:border-[#fbbc05] transition-all shadow-sm"
                        >
                            {hasReviewed ? '✏️ Edit Review' : '⭐ Rate Farmer'}
                        </button>
                    )}
                    {farmerId && (
                        <button
                            onClick={() => onMessage(firstFarmer)}
                            className="px-6 py-3 bg-white dark:bg-white/10 border border-gray-100 dark:border-white/10 text-gray-400 dark:text-gray-500 text-[10px] font-black uppercase tracking-widest rounded-2xl hover:text-[#fbbc05] hover:border-amber-100 transition-all shadow-sm flex items-center gap-2"
                        >
                            💬 Message
                        </button>
                    )}
                    <span className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-sm ${
                        order.status === 'Delivered'       ? 'bg-amber-50 dark:bg-amber-400/10 text-[#fbbc05] border-amber-100 dark:border-amber-400/20' :
                        order.status === 'Cancelled'       ? 'bg-red-50 dark:bg-red-900/10 text-red-500 border-red-100 dark:border-red-900/20' :
                        order.status === 'Out for Delivery'? 'bg-blue-50 dark:bg-blue-900/10 text-blue-500 border-blue-100 dark:border-blue-900/20' :
                        'bg-gray-50 dark:bg-white/5 text-gray-500 border-gray-100 dark:border-white/10'
                    }`}>
                        {order.status}
                    </span>
                    <div className="text-2xl font-black text-gray-900 dark:text-white bg-white dark:bg-white/10 border border-gray-100 dark:border-white/10 px-6 py-2 rounded-2xl shadow-inner shadow-amber-900/5">
                        ₹{parseFloat(order.totalAmount).toFixed(2)}
                    </div>
                </div>
            </div>

            <div className="p-10">
                <div className="text-[10px] text-gray-400 dark:text-gray-500 uppercase font-black tracking-[0.5em] mb-8 flex items-center gap-4">
                    {t('buyerOrders.orderDetails')} <div className="h-px flex-1 bg-gray-50 dark:bg-white/5"></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {order.items.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-5 bg-gray-50/50 dark:bg-white/5 p-5 rounded-[2rem] border border-transparent hover:border-amber-50 dark:hover:border-amber-400/20 hover:bg-white dark:hover:bg-white/10 transition-all group/item shadow-sm">
                            <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-md flex-shrink-0 border border-white dark:border-white/10">
                                <img
                                    src={getImageUrl(item.product?.image)}
                                    className="w-full h-full object-cover group-hover/item:scale-110 transition-transform duration-500"
                                    alt={item.product?.name || 'Product'}
                                    onError={(e) => { e.target.src = 'https://via.placeholder.com/100?text=Farm'; }}
                                />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="text-gray-900 dark:text-white font-black text-sm uppercase tracking-tighter truncate">
                                    {item.product?.name || 'Product'}
                                </div>
                                <div className="text-gray-400 dark:text-gray-500 text-[10px] font-black uppercase tracking-widest mt-1.5 opacity-60">
                                    {item.quantity} {item.product?.unit || 'kg'} &nbsp;×&nbsp; ₹{item.price}
                                </div>
                            </div>
                            <div className="text-right font-black text-gray-900 dark:text-white text-sm shrink-0">
                                ₹{getItemTotal(item.price, item.quantity)}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-10 pt-8 border-t border-gray-50 dark:border-white/5 flex items-start gap-4">
                    <div className="text-2xl opacity-60">📍</div>
                    <div className="flex-1">
                        <div className="text-[10px] text-gray-400 dark:text-gray-500 uppercase font-black tracking-widest mb-2 px-1">{t('buyerOrders.deliveryDest')}</div>
                        <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed font-medium max-w-2xl">{order.deliveryAddress}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

const BuyerOrders = () => {
    const navigate = useNavigate();
    const { isDarkMode } = useTheme();
    const { t } = useTranslation();
    const user = useSelector(selectCurrentUser);
    const unreadCount = useSelector(selectUnreadCount);
    const [orders, setOrders] = useState([]);
    const [myReviews, setMyReviews] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
    const [selectedFarmer, setSelectedFarmer] = useState(null);
    const [chatFarmer, setChatFarmer] = useState(null);

    const fetchData = useCallback(async () => {
        if (!user) return;
        setLoading(true);
        setError(null);
        try {
            const bId = user.id || user._id;
            const [ordersData, reviewsData] = await Promise.all([
                getBuyerOrders(bId),
                getBuyerReviews(bId)
            ]);

            setOrders(Array.isArray(ordersData) ? ordersData : []);

            const reviewMap = {};
            if (Array.isArray(reviewsData)) {
                reviewsData.forEach(rev => {
                    if (rev.farmer) {
                        const fId = String(rev.farmer._id || rev.farmer);
                        reviewMap[fId] = rev;
                    }
                });
            }
            setMyReviews(reviewMap);
        } catch (err) {
            console.error('Fetch Orders/Reviews Error:', err);
            setError('Failed to load your order history. Please try again later.');
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const openRating = (farmer) => {
        if (!farmer || typeof farmer === 'string') {
            setSelectedFarmer({ _id: farmer, firstName: 'Farmer', lastName: 'Partner' });
        } else {
            setSelectedFarmer(farmer);
        }
        setIsReviewModalOpen(true);
    };

    const openChat = (farmer) => {
        if (!farmer || typeof farmer === 'string') {
            setChatFarmer({ _id: farmer, firstName: 'Farmer', lastName: 'Partner' });
        } else {
            setChatFarmer(farmer);
        }
    };

    const currentOrders = orders.filter(o => ['Pending', 'Confirmed', 'Out for Delivery'].includes(o.status));
    const pastOrders    = orders.filter(o => ['Delivered', 'Cancelled'].includes(o.status));

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] flex flex-col font-sans transition-colors duration-500 text-gray-900 dark:text-white">
            <nav className="flex items-center justify-between px-8 py-4 bg-white dark:bg-[#111111] border-b border-gray-100 dark:border-white/5 sticky top-0 z-50 shadow-sm transition-colors duration-500">
                <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate('/buyer-portal')}>
                    <span className="text-2xl group-hover:scale-110 transition-transform">🌾</span>
                    <div className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tighter">
                        Farm<span className="text-[#fbbc05]">2</span>Home
                    </div>
                </div>
                <div className="flex items-center gap-4">
                  <button
                      onClick={() => navigate('/buyer/messages')}
                      className="p-2 text-gray-400 hover:text-[#fbbc05] transition-colors relative"
                      title={t('nav.messages')}
                  >
                      <span className="text-xl">💬</span>
                      {unreadCount > 0 && (
                          <span className="absolute top-0 right-0 bg-red-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full border border-white dark:border-[#111111]">
                              {unreadCount}
                          </span>
                      )}
                  </button>
                  <button
                      onClick={() => navigate('/buyer/browse')}
                      className="px-6 py-2.5 rounded-full border border-gray-200 dark:border-white/10 text-gray-400 dark:text-gray-500 text-[10px] font-black uppercase tracking-widest hover:text-gray-900 dark:hover:text-white hover:border-gray-900 dark:hover:border-white transition-all flex items-center gap-3"
                  >
                      {t('nav.addMoreProduce')}
                  </button>
                </div>
            </nav>

            <div className="flex-1 max-w-6xl w-full mx-auto px-6 py-12">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-8">
                    <div>
                        <h1 className="text-5xl font-black text-gray-900 dark:text-white uppercase tracking-tighter leading-none">{t('buyerOrders.pageTitle')}</h1>
                        <p className="text-gray-400 dark:text-gray-500 font-bold text-xs mt-3 uppercase tracking-[0.4em] flex items-center gap-3 px-1">
                             {t('buyerOrders.pageSubtitle')} <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse inline-block"></span>
                        </p>
                    </div>
                    <button
                        onClick={fetchData}
                        className="px-6 py-3 bg-white dark:bg-white/10 border border-gray-100 dark:border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:border-amber-200 text-gray-900 dark:text-white transition-all shadow-sm"
                    >
                        {t('buyerOrders.syncHistory')}
                    </button>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-40 space-y-8 animate-in fade-in duration-700">
                        <div className="w-16 h-16 border-4 border-amber-100 border-t-[#fbbc05] rounded-full animate-spin shadow-inner shadow-amber-900/5"></div>
                        <div className="text-gray-400 font-black tracking-[0.5em] text-[10px] uppercase animate-pulse">{t('buyerOrders.syncing')}</div>
                    </div>
                ) : error ? (
                    <div className="bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 rounded-[3rem] p-16 text-center max-w-3xl mx-auto shadow-sm">
                        <div className="text-6xl mb-6">⚠️</div>
                        <h2 className="text-red-600 dark:text-red-500 font-black uppercase tracking-tighter text-2xl mb-3">{t('buyerOrders.syncError')}</h2>
                        <p className="text-red-400 dark:text-red-700 text-sm font-medium mb-10 italic max-w-md mx-auto">{error}</p>
                        <button onClick={fetchData} className="px-12 py-4 bg-red-600 text-white font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-red-700 hover:-translate-y-1 transition-all shadow-xl shadow-red-600/20">
                            Retry Connection
                        </button>
                    </div>
                ) : (
                    <div className="space-y-20">

                        {/* ── Active Orders ── */}
                        <section>
                            <div className="flex items-center gap-6 mb-10 px-1">
                                <span className="bg-amber-50 dark:bg-amber-400/10 text-[#fbbc05] w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm border border-amber-100 dark:border-amber-400/20 shadow-inner">01</span>
                                <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">{t('buyerOrders.inProgress')}</h2>
                                <div className="h-px flex-1 bg-gray-100 dark:bg-white/5"></div>
                                <span className="text-[10px] text-gray-400 dark:text-gray-500 font-black tracking-[0.4em]">{currentOrders.length} {t('buyerOrders.shipments')}</span>
                            </div>
                            {currentOrders.length === 0 ? (
                                <div className="bg-white dark:bg-[#111111] border border-dashed border-gray-200 dark:border-white/10 rounded-[3rem] p-20 text-center group hover:border-amber-200 transition-all shadow-sm">
                                    <div className="text-6xl mb-6 opacity-20 group-hover:scale-110 transition-transform duration-500 transform grayscale group-hover:grayscale-0 group-hover:opacity-100">🛒</div>
                                    <h3 className="text-gray-400 dark:text-gray-500 font-black uppercase tracking-[0.3em] text-xs">{t('buyerOrders.noActive')}</h3>
                                    <button onClick={() => navigate('/buyer/browse')} className="mt-10 text-[#fbbc05] text-[11px] font-black uppercase tracking-widest hover:text-amber-600 transition-colors border-b-2 border-[#fbbc05]/20 pb-1">
                                        {t('buyerOrders.exploreMarketplace')}
                                    </button>
                                </div>
                            ) : (
                                currentOrders.map(order => (
                                    <OrderCard key={order._id} order={order} myReviews={myReviews} onRate={openRating} onMessage={openChat} />
                                ))
                            )}
                        </section>

                        {/* ── Order History ── */}
                        <section>
                            <div className="flex items-center gap-6 mb-10 px-1">
                                <span className="bg-gray-100 dark:bg-white/5 text-gray-400 dark:text-gray-500 w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm border border-gray-200 dark:border-gray-800 shadow-inner">02</span>
                                <h2 className="text-2xl font-black text-gray-400 dark:text-gray-500 uppercase tracking-tighter">{t('buyerOrders.pastPurchases')}</h2>
                                <div className="h-px flex-1 bg-gray-100 dark:bg-white/5"></div>
                                <span className="text-[10px] text-gray-300 dark:text-gray-600 font-black tracking-[0.4em]">{pastOrders.length} {t('buyerOrders.records')}</span>
                            </div>
                            {pastOrders.length === 0 ? (
                                <div className="bg-white/50 dark:bg-white/5 border border-dashed border-gray-100 dark:border-white/5 rounded-[3rem] p-16 text-center shadow-inner">
                                    <h3 className="text-gray-300 dark:text-gray-600 font-black uppercase tracking-[0.5em] text-[10px]">{t('buyerOrders.historyEmpty')}</h3>
                                </div>
                            ) : (
                                <div className="opacity-80 hover:opacity-100 transition-opacity duration-500">
                                    {pastOrders.map(order => (
                                        <OrderCard key={order._id} order={order} myReviews={myReviews} onRate={openRating} onMessage={openChat} />
                                    ))}
                                </div>
                            )}
                        </section>

                    </div>
                )}
            </div>

            {/* Review Modal */}
            {selectedFarmer && (
                <ReviewModal
                    isOpen={isReviewModalOpen}
                    onClose={() => { setIsReviewModalOpen(false); setSelectedFarmer(null); }}
                    farmer={selectedFarmer}
                    buyerId={user.id || user._id}
                    existingReview={myReviews[String(selectedFarmer._id || selectedFarmer)]}
                    onSuccess={(newReview) => {
                        const fId = String(selectedFarmer._id || selectedFarmer);
                        setMyReviews(prev => ({ ...prev, [fId]: newReview }));
                        setIsReviewModalOpen(false);
                        setSelectedFarmer(null);
                    }}
                />
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

export default BuyerOrders;