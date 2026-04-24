import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../../redux/slices/authSlice';
import { useTheme } from '../../context/ThemeContext';
import { createFarmPost } from '../../api/farmPosts';
import { useTranslation } from 'react-i18next';

const inputClass =
    'w-full bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl px-5 py-4 text-gray-900 dark:text-white text-sm font-medium placeholder-gray-400 focus:outline-none focus:border-green-600 focus:ring-4 focus:ring-green-500/5 transition-all';

const FarmerFeed = () => {
    const navigate = useNavigate();
    const user = useSelector(selectCurrentUser) || {};
    const { isDarkMode } = useTheme();
    const { t } = useTranslation();
    const farmerId = user.id || user._id;

    const [content, setContent] = useState('');
    const [imageFile, setImageFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [postedOk, setPostedOk] = useState(false);

    const handleFile = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            setPreview(URL.createObjectURL(file));
        } else {
            setImageFile(null);
            setPreview(null);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!content.trim()) {
            setError(t('farmerFeed.needText'));
            return;
        }
        setSubmitting(true);
        setError('');
        try {
            const fd = new FormData();
            fd.append('farmerId', farmerId);
            fd.append('content', content.trim());
            if (imageFile) fd.append('image', imageFile);
            await createFarmPost(fd);
            setContent('');
            setImageFile(null);
            setPreview(null);
            setPostedOk(true);
            setTimeout(() => setPostedOk(false), 4000);
        } catch (err) {
            setError(err.message || 'Failed to post');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] text-gray-900 dark:text-white flex flex-col">
            <nav className="flex items-center justify-between px-6 py-4 bg-white dark:bg-[#111111] border-b border-gray-100 dark:border-white/5 sticky top-0 z-40">
                <button
                    type="button"
                    onClick={() => navigate('/farmer-portal')}
                    className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-green-600"
                >
                    ← {t('common.back')}
                </button>
                <div className="text-lg font-black tracking-tighter uppercase">📣 {t('farmerFeed.title')}</div>
            </nav>

            <main className="flex-1 max-w-2xl w-full mx-auto px-6 py-10">
                <p className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-8">
                    {t('farmerFeed.subtitle')}
                </p>

                <form
                    onSubmit={handleSubmit}
                    className="bg-white dark:bg-[#111111] border border-gray-100 dark:border-white/5 rounded-[2rem] p-8 shadow-sm space-y-6"
                >
                    {postedOk && (
                        <div className="text-green-600 dark:text-green-400 text-sm font-bold">
                            {t('farmerFeed.postedSuccess')}
                        </div>
                    )}
                    {error && <div className="text-red-500 text-sm font-medium">{error}</div>}
                    <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-2">
                            {t('farmerFeed.updateLabel')}
                        </label>
                        <textarea
                            name="content"
                            rows={4}
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            className={inputClass}
                            placeholder={t('farmerFeed.placeholder')}
                        />
                    </div>
                    <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-2">
                            {t('farmerFeed.photoOptional')}
                        </label>
                        <input type="file" accept="image/*" onChange={handleFile} className="text-sm text-gray-500" />
                        {preview && (
                            <img src={preview} alt="" className="mt-4 rounded-2xl max-h-48 object-cover border border-gray-100 dark:border-white/10" />
                        )}
                    </div>
                    <button
                        type="submit"
                        disabled={submitting}
                        className="w-full py-4 rounded-2xl bg-green-600 text-white text-[11px] font-black uppercase tracking-widest hover:bg-green-700 disabled:opacity-50 transition-colors"
                    >
                        {submitting ? t('common.loading') : t('farmerFeed.publish')}
                    </button>
                </form>

                <p className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
                    <button
                        type="button"
                        onClick={() => navigate('/farmer/profile')}
                        className="font-bold text-green-600 dark:text-green-400 hover:underline"
                    >
                        {t('farmerProfile.viewPostsLink')}
                    </button>
                </p>
            </main>
        </div>
    );
};

export default FarmerFeed;
