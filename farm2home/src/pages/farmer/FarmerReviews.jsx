import { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../../redux/slices/authSlice';
import { getFarmerReviews } from '../../api/reviews';

const FarmerReviews = () => {
    const navigate = useNavigate();
    const user = useSelector(selectCurrentUser);
    const { isDarkMode } = useTheme();
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const UPLOADS_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5008';

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                const data = await getFarmerReviews(user.id || user._id);
                setReviews(data);
            } catch (err) {
                setError(err.message || 'Failed to load reviews');
            } finally {
                setLoading(false);
            }
        };
        if (user) fetchReviews();
    }, [user]);

    const averageRating = reviews.length > 0 
        ? (reviews.reduce((acc, rev) => acc + rev.rating, 0) / reviews.length).toFixed(1)
        : 0;

    const renderStars = (starCount) => {
        return "⭐".repeat(starCount) + "☆".repeat(5 - starCount);
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] flex flex-col font-sans transition-colors duration-500 text-gray-900 dark:text-white">
            <nav className="flex items-center justify-between px-8 py-4 bg-white dark:bg-[#111111] border-b border-gray-100 dark:border-white/5 sticky top-0 z-50 shadow-sm transition-colors duration-500">
                <div onClick={() => navigate('/farmer-portal')} className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tighter cursor-pointer group flex items-center gap-2">
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

            <div className="flex-1 max-w-4xl w-full mx-auto px-6 py-12">
                <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-8">
                    <div>
                        <h1 className="text-5xl font-black text-gray-900 dark:text-white uppercase tracking-tighter leading-none">Reputation Feed</h1>
                        <p className="text-gray-400 dark:text-gray-500 font-bold text-xs mt-3 uppercase tracking-[0.4em] flex items-center gap-3 px-1">
                           Consumer Sentiment Analysis <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse inline-block"></span>
                        </p>
                    </div>
                    
                    {reviews.length > 0 && (
                        <div className="bg-white dark:bg-[#111111] border border-green-500/20 dark:border-green-500/10 rounded-[2.5rem] p-8 flex flex-col items-center shadow-2xl shadow-green-500/5 relative overflow-hidden group transition-colors duration-500">
                            <div className="absolute top-0 right-0 w-16 h-16 bg-green-50 dark:bg-green-400/5 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-150 duration-700"></div>
                            <div className="text-5xl font-black text-gray-900 dark:text-white tracking-tighter mb-2 relative z-10 transition-colors duration-500">
                                {averageRating} <span className="text-3xl text-green-600 dark:text-green-500">⭐</span>
                            </div>
                            <div className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-400 dark:text-gray-500 relative z-10 px-4 py-1.5 bg-gray-50 dark:bg-white/5 rounded-full">
                                AGGREGATED FROM {reviews.length} JOURNALS
                            </div>
                        </div>
                    )}
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-32 space-y-8 animate-in fade-in duration-700 transition-colors duration-500">
                      <div className="w-16 h-16 border-4 border-green-50 dark:border-green-900/10 border-t-green-600 rounded-full animate-spin shadow-inner shadow-green-900/5"></div>
                      <div className="text-gray-400 dark:text-gray-500 font-black tracking-[0.5em] text-[10px] uppercase animate-pulse">Syncing Peer Reviews...</div>
                    </div>
                ) : error ? (
                    <div className="p-10 rounded-[3rem] bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 text-red-600 dark:text-red-500 font-black text-sm uppercase tracking-widest text-center shadow-sm">
                        ⚠️ {error}
                    </div>
                ) : reviews.length === 0 ? (
                    <div className="text-center py-40 bg-white dark:bg-[#111111] border border-dashed border-gray-200 dark:border-white/10 rounded-[4rem] group shadow-inner shadow-gray-900/5 transition-colors duration-500">
                         <div className="text-8xl mb-8 opacity-20 group-hover:scale-110 transition-transform duration-700 transform grayscale group-hover:grayscale-0 group-hover:opacity-100">⭐</div>
                         <h3 className="text-gray-900 dark:text-white font-black uppercase tracking-tighter text-2xl mb-3">Fresh Perspective Needed</h3>
                         <p className="text-gray-400 dark:text-gray-500 text-sm mt-3 font-medium italic">When buyers complete their harvest cycle, their feedback credentials will transmit here.</p>
                    </div>
                ) : (
                    <div className="grid gap-8">
                        {reviews.map(review => (
                            <div key={review._id} className="bg-white dark:bg-[#111111] border border-gray-100 dark:border-white/5 rounded-[3rem] p-10 flex flex-col gap-6 relative overflow-hidden group hover:border-green-500/30 transition-all duration-500 shadow-sm hover:shadow-2xl transition-colors duration-500">
                                <div className="absolute top-0 left-0 w-1.5 h-full bg-green-600 opacity-20 group-hover:opacity-100 transition-opacity"></div>
                                
                                <div className="flex items-center justify-between border-b border-gray-50 dark:border-white/5 pb-6 mb-2">
                                    <div className="flex items-center gap-6">
                                        <div className="w-16 h-16 rounded-[1.2rem] overflow-hidden bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 font-black text-gray-900 dark:text-white flex items-center justify-center shrink-0 text-xl shadow-inner group-hover:scale-105 transition-transform">
                                            {review.buyer.avatar ? <img src={`${UPLOADS_BASE}${review.buyer.avatar.replace('/uploads', '')}`} alt="Avatar" className="w-full h-full object-cover" /> : `${review.buyer.firstName[0]}${review.buyer.lastName[0]}`}
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tighter leading-none mb-2">{review.buyer.firstName} {review.buyer.lastName}</h3>
                                            <div className="text-[10px] text-gray-400 dark:text-gray-500 font-black uppercase tracking-[0.2em] opacity-60">
                                                Certified {new Date(review.createdAt).toLocaleDateString()}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-green-600 text-sm tracking-[0.25em]">{renderStars(review.rating)}</div>
                                </div>
                                
                                <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-base italic font-medium">
                                    "{review.comment || 'The buyer has verified successful harvest without written commentary.'}"
                                </p>
                                
                                <div className="flex justify-end pt-4">
                                   <div className="text-[9px] font-black text-gray-300 dark:text-gray-600 uppercase tracking-[0.5em] group-hover:text-green-200 dark:group-hover:text-green-900 transition-colors">Verified Settlement Journal</div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default FarmerReviews;
