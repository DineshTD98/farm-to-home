import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../../redux/slices/authSlice';
import { useTheme } from '../../context/ThemeContext';
import { getFarmerFarmPosts, deleteFarmPost } from '../../api/farmPosts';
import { useTranslation } from 'react-i18next';
import FarmFeedStream from '../../components/buyer/FarmFeedStream';
import { getUserAvatarUrl } from '../../utils/avatarUrl';
import { toast } from 'react-hot-toast';

const FarmerProfile = () => {
    const navigate = useNavigate();
    const user = useSelector(selectCurrentUser) || {};
    const { isDarkMode } = useTheme();
    const { t } = useTranslation();
    const farmerId = user.id || user._id;

    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    const load = useCallback(async () => {
        if (!farmerId) return;
        setLoading(true);
        try {
            const data = await getFarmerFarmPosts(farmerId, farmerId);
            setPosts(data);
        } catch {
            setPosts([]);
        } finally {
            setLoading(false);
        }
    }, [farmerId]);

    useEffect(() => {
        load();
    }, [load]);

    const handleDelete = async (postId) => {
        if (!window.confirm(t('farmerFeed.deleteConfirm'))) return;
        try {
            await deleteFarmPost(postId, farmerId);
            await load();
            toast.success(t('common.deleted') || 'Deleted successfully');
        } catch (err) {
            toast.error(err.message);
        }
    };

    const displayName = [user.firstName, user.lastName].filter(Boolean).join(' ') || '—';
    const img = getUserAvatarUrl(user);

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
                <div className="text-lg font-black tracking-tighter uppercase">{t('farmerProfile.title')}</div>
            </nav>

            <main className="flex-1 max-w-2xl w-full mx-auto px-6 py-10 space-y-10 pb-24">
                <section className="bg-white dark:bg-[#111111] border border-gray-100 dark:border-white/5 rounded-[2rem] p-8 shadow-sm">
                    <div className="flex flex-col sm:flex-row sm:items-start gap-6">
                        <div className="flex shrink-0 justify-center sm:justify-start">
                            {img ? (
                                <img
                                    src={img}
                                    alt=""
                                    className="h-24 w-24 rounded-full object-cover border-4 border-green-100 dark:border-green-900/40 shadow-lg"
                                />
                            ) : (
                                <div className="h-24 w-24 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-3xl font-black text-white shadow-lg border-4 border-white dark:border-white/10">
                                    {user.firstName?.[0]}
                                    {user.lastName?.[0]}
                                </div>
                            )}
                        </div>
                        <div className="flex-1 min-w-0 space-y-4">
                            <div>
                                <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                                    {displayName}
                                </h1>
                                <p className="text-[10px] font-black uppercase tracking-[0.25em] text-green-600 dark:text-green-400 mt-1">
                                    {t('portal.farmer.label')}
                                </p>
                            </div>
                            <dl className="space-y-3 text-sm">
                                {user.phone && (
                                    <div>
                                        <dt className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-0.5">
                                            {t('farmerProfile.phone')}
                                        </dt>
                                        <dd className="font-semibold text-gray-800 dark:text-gray-200">{user.phone}</dd>
                                    </div>
                                )}
                                {(user.address || user.pincode) && (
                                    <div>
                                        <dt className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-0.5">
                                            {t('farmerProfile.location')}
                                        </dt>
                                        <dd className="font-medium text-gray-700 dark:text-gray-300 leading-relaxed">
                                            {[user.address, user.pincode].filter(Boolean).join(' · ') || '—'}
                                        </dd>
                                    </div>
                                )}
                            </dl>
                            <button
                                type="button"
                                onClick={() => navigate('/farmer/settings')}
                                className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gray-900 dark:bg-green-600 text-white text-[11px] font-black uppercase tracking-widest hover:bg-green-700 dark:hover:bg-green-500 transition-colors shadow-lg"
                            >
                                {t('farmerProfile.openSettings')}
                            </button>
                        </div>
                    </div>
                </section>

                <section>
                    <h2 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.3em] mb-6">
                        {t('farmerFeed.yourPosts')}
                    </h2>
                    <FarmFeedStream
                        posts={posts}
                        loading={loading}
                        emptyHint={t('farmerFeed.empty')}
                        viewerId={farmerId}
                        onRefresh={load}
                        onDeletePost={handleDelete}
                        accent="green"
                    />
                </section>
            </main>
        </div>
    );
};

export default FarmerProfile;
