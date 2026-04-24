import { useState, useEffect } from 'react';
import { submitReview } from '../api/reviews';
import { useTheme } from '../context/ThemeContext';

const ReviewModal = ({ isOpen, onClose, farmer, buyerId, existingReview, onSuccess }) => {
    const { isDarkMode } = useTheme();
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [status, setStatus] = useState({ type: '', message: '' });

    useEffect(() => {
        if (isOpen) {
            setRating(existingReview?.rating || 5);
            setComment(existingReview?.comment || '');
            setStatus({ type: '', message: '' });
        }
    }, [isOpen, existingReview]);

    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setStatus({ type: '', message: '' });

        try {
            const result = await submitReview({
                buyer: buyerId,
                farmer: farmer._id || farmer,
                rating,
                comment
            });
            
            setStatus({ type: 'success', message: 'Review successfully saved!' });
            if (onSuccess) onSuccess(result);
            
            setTimeout(() => {
                onClose();
            }, 1000);
        } catch (err) {
            setStatus({ type: 'error', message: err.message || 'Failed to submit review' });
        } finally {
            setSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-in fade-in duration-500">
            <div className="absolute inset-0 bg-white/40 dark:bg-black/60 backdrop-blur-md" onClick={() => !submitting && onClose()}></div>
            <div className="relative w-full max-w-xl bg-white dark:bg-[#111111] border border-gray-100 dark:border-white/5 rounded-[3.5rem] shadow-2xl shadow-gray-900/10 p-12 overflow-hidden animate-in zoom-in-95 duration-500 font-sans transition-colors duration-500">
                <div className="absolute top-0 left-0 w-full h-2 bg-[#fbbc05]"></div>
                <div className="text-center mb-10">
                    <div className="text-6xl mb-6">⭐</div>
                    <h2 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tighter leading-none mb-3">Consumer Endorsement</h2>
                    <p className="text-gray-400 dark:text-gray-500 text-[10px] font-black uppercase tracking-[0.4em] px-1">Reviewing {farmer?.firstName || 'Farmer'} {farmer?.lastName || 'Partner'}</p>
                </div>

                {status.message && (
                    <div className={`p-6 rounded-2xl text-xs font-black uppercase tracking-widest mb-8 border transition-all animate-in slide-in-from-top duration-500 ${
                        status.type === 'error' 
                            ? 'bg-red-50 dark:bg-red-900/10 border-red-100 dark:border-red-900/20 text-red-500' 
                            : 'bg-amber-50 dark:bg-amber-400/10 border-amber-100 dark:border-amber-400/20 text-[#fbbc05]'
                    }`}>
                        {status.message}
                    </div>
                )}

                <form onSubmit={handleReviewSubmit} className="space-y-10 relative z-10">
                    <div>
                        <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 mb-6 uppercase tracking-[0.5em] text-center">Quality Assessment</label>
                        <div className="flex justify-center gap-4">
                            {[1, 2, 3, 4, 5].map(star => (
                                <button 
                                    key={star} type="button" 
                                    onClick={() => setRating(star)}
                                    className={`text-4xl transition-all duration-300 hover:scale-125 ${rating >= star ? 'grayscale-0 drop-shadow-xl' : 'grayscale opacity-20 hover:opacity-100'}`}
                                >
                                    ⭐
                                </button>
                            ))}
                        </div>
                    </div>
                    
                    <div>
                        <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 mb-4 uppercase tracking-[0.5em] ml-2">Written Commentary</label>
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Share your experience regarding the harvest quality, fulfillment speed, and overall direct transaction..."
                            className="w-full bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-[2rem] px-6 py-5 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-[#fbbc05] focus:ring-4 focus:ring-amber-500/5 transition-all font-medium text-sm min-h-[160px] shadow-inner resize-none"
                        />
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-50 dark:border-white/5">
                        <button 
                            type="button" 
                            onClick={onClose} 
                            disabled={submitting} 
                            className="flex-1 py-5 rounded-2xl border border-gray-100 dark:border-white/10 text-gray-400 hover:text-gray-900 dark:hover:text-white hover:border-gray-900 dark:hover:border-white transition-all active:scale-95 duration-300 text-[10px] font-black uppercase tracking-widest"
                        >
                            DISCARD
                        </button>
                        <button 
                            type="submit" 
                            disabled={submitting} 
                            className="flex-[2] py-5 rounded-2xl bg-gray-900 dark:bg-white text-white dark:text-black text-[10px] font-black uppercase tracking-[0.3em] shadow-2xl shadow-gray-900/10 hover:bg-[#fbbc05] hover:shadow-amber-500/30 hover:-translate-y-1 transition-all duration-300 active:scale-95"
                        >
                            {submitting ? 'TRANSMITTING...' : 'AUTHORIZE REVIEW'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ReviewModal;
