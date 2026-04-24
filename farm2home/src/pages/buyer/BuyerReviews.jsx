import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../../redux/slices/authSlice';
import { getBuyerOrders } from '../../api/orders';
import { getBuyerReviews } from '../../api/reviews';
import ReviewModal from '../../components/ReviewModal';
import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from 'react-i18next';

const UPLOADS_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5008';

const renderStars = (starCount) => '⭐'.repeat(starCount) + '☆'.repeat(5 - starCount);

const getInitials = (farmer) => {
    const first = farmer?.firstName?.[0] || '?';
    const last  = farmer?.lastName?.[0]  || '';
    return `${first}${last}`;
};

const BuyerReviews = () => {
    const navigate  = useNavigate();
    const location  = useLocation();
    const user      = useSelector(selectCurrentUser);
    const { isDarkMode } = useTheme();
    const { t } = useTranslation();

    const [farmers,   setFarmers]   = useState([]);
    const [myReviews, setMyReviews] = useState({});
    const [loading,   setLoading]   = useState(true);
    const [status,    setStatus]    = useState({ type: '', message: '' });

    const hasAutoOpened = useRef(false);

    const [isModalOpen,    setIsModalOpen]    = useState(false);
    const [selectedFarmer, setSelectedFarmer] = useState(null);

    const openReviewModal = useCallback((farmer) => {
        setSelectedFarmer(farmer);
        setIsModalOpen(true);
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const bId = user.id || user._id;
                const [ordersData, reviewsData] = await Promise.all([
                    getBuyerOrders(bId),
                    getBuyerReviews(bId)
                ]);

                const farmerMap = new Map();
                if (Array.isArray(ordersData)) {
                    ordersData.forEach(order => {
                        if (['Delivered', 'Out for Delivery', 'Confirmed'].includes(order.status)) {
                            order.items.forEach(item => {
                                const f = item.farmerId;
                                const fId = String(f?._id || f || '');
                                if (fId && !farmerMap.has(fId)) {
                                    farmerMap.set(
                                        fId,
                                        typeof f === 'object' && f !== null
                                            ? f
                                            : { _id: fId, firstName: 'Farmer', lastName: 'Partner' }
                                    );
                                }
                            });
                        }
                    });
                }
                setFarmers(Array.from(farmerMap.values()));

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
                console.error('BuyerReviews fetch error:', err);
                setStatus({ type: 'error', message: 'Failed to load your interaction history.' });
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [user]);

    useEffect(() => {
        if (!loading && location.state?.autoOpenFarmerId && farmers.length > 0 && !hasAutoOpened.current) {
            const fId = String(location.state.autoOpenFarmerId);
            const targetFarmer = farmers.find(f => String(f._id || f) === fId);
            if (targetFarmer) {
                hasAutoOpened.current = true;
                openReviewModal(targetFarmer);
            }
        }
    }, [loading, location.state, farmers, openReviewModal]);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] flex flex-col font-sans transition-colors duration-500 text-gray-900 dark:text-white">
            <nav className="flex items-center justify-between px-8 py-4 bg-white dark:bg-[#111111] border-b border-gray-100 dark:border-white/5 sticky top-0 z-50 shadow-sm transition-colors duration-500">
                <div
                    onClick={() => navigate('/buyer-portal')}
                    className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tighter cursor-pointer group flex items-center gap-2"
                >
                    <span className="text-2xl group-hover:scale-110 transition-transform">🌾</span>
                    <span>Farm<span className="text-[#fbbc05]">2</span>Home</span>
                </div>
                <div className="flex items-center gap-4">
                  <button
                      onClick={() => navigate('/buyer-portal')}
                      className="px-6 py-2.5 rounded-full border border-gray-100 dark:border-white/10 text-gray-400 dark:text-gray-500 text-[10px] font-black uppercase tracking-widest hover:text-gray-900 dark:hover:text-white hover:border-gray-900 dark:hover:border-white transition-all font-bold"
                  >
                      ← DASHBOARD
                  </button>
                </div>
            </nav>

            <div className="flex-1 max-w-5xl w-full mx-auto px-6 py-12">
                <div className="mb-12">
                    <h1 className="text-5xl font-black text-gray-900 dark:text-white uppercase tracking-tighter leading-none">{t('buyerReviews.pageTitle')}</h1>
                    <p className="text-gray-400 dark:text-gray-500 font-bold text-xs mt-3 uppercase tracking-[0.4em] flex items-center gap-3 px-1">
                        {t('buyerReviews.pageSubtitle')} <span className="w-2 h-2 rounded-full bg-[#fbbc05] animate-pulse inline-block"></span>
                    </p>
                </div>

                {status.type === 'error' && (
                  <div className="mb-10 p-6 rounded-[2rem] bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 text-red-600 dark:text-red-500 text-sm font-medium shadow-sm">
                    ⚠️ {status.message}
                  </div>
                )}

                {loading ? (
                  <div className="flex flex-col items-center justify-center py-32 space-y-8 animate-in fade-in duration-700">
                    <div className="w-16 h-16 border-4 border-amber-50 border-t-[#fbbc05] rounded-full animate-spin shadow-inner shadow-amber-900/5"></div>
                    <div className="text-gray-400 font-black tracking-[0.5em] text-[10px] uppercase animate-pulse">{t('buyerReviews.syncing')}</div>
                  </div>
                ) : farmers.length === 0 ? (
                    <div className="text-center py-40 bg-white dark:bg-[#111111] border border-dashed border-gray-200 dark:border-white/10 rounded-[4rem] group shadow-inner shadow-gray-900/5 transition-colors duration-500">
                        <div className="text-8xl mb-8 opacity-20 group-hover:scale-110 transition-transform duration-700 transform grayscale group-hover:grayscale-0 group-hover:opacity-100">🚜</div>
                        <h3 className="text-gray-900 dark:text-white font-black uppercase tracking-tighter text-2xl mb-3">{t('buyerReviews.noInteractions')}</h3>
                        <p className="text-gray-400 dark:text-gray-500 text-sm mt-3 mb-10 font-medium italic">{t('buyerReviews.noInteractionsDesc')}</p>
                        <button
                            onClick={() => navigate('/buyer/browse')}
                            className="px-12 py-5 rounded-2xl bg-gray-900 text-white font-black text-[10px] uppercase tracking-[0.3em] hover:bg-[#fbbc05] hover:shadow-amber-500/30 transition-all duration-300 active:scale-95 shadow-xl shadow-gray-900/10"
                        >
                            {t('buyerReviews.exploreProduce')}
                        </button>
                    </div>
                ) : (
                    <div className="grid gap-8">
                        {farmers.map(farmer => {
                            const fId = String(farmer._id || farmer);
                            const review = myReviews[fId];

                            return (
                                <div
                                    key={fId}
                                    className="bg-white dark:bg-[#111111] border border-gray-100 dark:border-white/5 rounded-[3rem] p-8 flex flex-col md:flex-row md:items-center justify-between gap-10 hover:border-[#fbbc05]/50 transition-all duration-500 shadow-sm hover:shadow-2xl group"
                                >
                                    <div className="flex items-center gap-6">
                                        <div className="w-20 h-20 rounded-[1.5rem] overflow-hidden bg-gray-50 dark:bg-white/10 border border-gray-100 dark:border-white/10 font-black text-gray-900 dark:text-white flex items-center justify-center shrink-0 text-2xl shadow-inner shadow-amber-900/5 group-hover:scale-110 transition-transform duration-500">
                                            {farmer.avatar
                                                ? <img src={`${UPLOADS_BASE}${farmer.avatar}`} alt="Avatar" className="w-full h-full object-cover" />
                                                : getInitials(farmer)
                                            }
                                        </div>
                                        <div>
                                            <div className="inline-flex px-3 py-1 bg-amber-50 dark:bg-amber-400/10 border border-amber-100 dark:border-amber-400/20 text-[#fbbc05] text-[9px] font-black uppercase tracking-widest rounded-full mb-2">{t('buyerReviews.verifiedProducer')}</div>
                                            <h3 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tighter leading-none">
                                                {farmer.firstName || 'Farmer'} {farmer.lastName || 'Partner'}
                                            </h3>
                                            {farmer.phone && (
                                                <div className="text-[10px] font-black uppercase text-gray-400 dark:text-gray-500 tracking-[0.3em] mt-2 opacity-60">
                                                  📞 {farmer.phone}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {review ? (
                                        <div className="flex flex-col items-start md:items-end">
                                            <div className="text-amber-400 text-lg tracking-widest mb-3 scale-110 origin-right">
                                                {renderStars(review.rating)}
                                            </div>
                                            <div className="text-gray-400 dark:text-gray-500 text-sm mb-6 italic max-w-sm font-medium">
                                                "{review.comment || 'No comment provided'}"
                                            </div>
                                            <button
                                                onClick={() => openReviewModal(farmer)}
                                                className="px-6 py-3 bg-gray-50 dark:bg-white/10 border border-gray-100 dark:border-white/10 text-[9px] font-black uppercase tracking-widest text-gray-900 dark:text-white rounded-xl hover:bg-gray-100 dark:hover:bg-white/20 transition-all active:scale-95 shadow-sm"
                                            >
                                                {t('buyerReviews.updateFeedback')}
                                            </button>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => openReviewModal(farmer)}
                                            className="px-10 py-4 bg-gray-900 dark:bg-white text-white dark:text-black shadow-xl shadow-gray-900/10 text-[10px] font-black uppercase tracking-[0.3em] rounded-2xl hover:bg-[#fbbc05] hover:shadow-amber-500/30 hover:-translate-y-1 transition-all duration-300 active:scale-95"
                                        >
                                            {t('buyerReviews.endorseProducer')}
                                        </button>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {selectedFarmer && (
                <ReviewModal
                    isOpen={isModalOpen}
                    onClose={() => { setIsModalOpen(false); setSelectedFarmer(null); }}
                    farmer={selectedFarmer}
                    buyerId={user.id || user._id}
                    existingReview={myReviews[String(selectedFarmer._id || selectedFarmer)]}
                    onSuccess={(newReview) => {
                        const fId = String(selectedFarmer._id || selectedFarmer);
                        setMyReviews(prev => ({ ...prev, [fId]: newReview }));
                        setIsModalOpen(false);
                        setSelectedFarmer(null);
                    }}
                />
            )}
        </div>
    );
};

export default BuyerReviews;