import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const AdminLayout = ({ children, title, subtitle }) => {
    const navigate = useNavigate();
    const { t } = useTranslation();

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] flex flex-col font-sans transition-colors duration-500 text-gray-900 dark:text-white">
            <nav className="flex items-center justify-between px-8 py-4 bg-white dark:bg-[#111111] border-b border-gray-100 dark:border-white/5 sticky top-0 z-50 shadow-sm transition-colors duration-500">
                <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate('/admin-portal')}>
                    <span className="text-2xl group-hover:scale-110 transition-transform">🌾</span>
                    <div className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tighter">
                        Farm<span className="text-[#fbbc05]">2</span>Home <span className="text-purple-600 ml-2">ADMIN</span>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/admin-portal')}
                        className="px-6 py-2.5 rounded-full border border-gray-200 dark:border-white/10 text-gray-400 dark:text-gray-500 text-[10px] font-black uppercase tracking-widest hover:text-gray-900 dark:hover:text-white hover:border-gray-900 dark:hover:border-white transition-all flex items-center gap-3"
                    >
                        Back to Portal
                    </button>
                </div>
            </nav>

            <div className="flex-1 max-w-6xl w-full mx-auto px-6 py-12">
                <div className="mb-12">
                    <h1 className="text-5xl font-black text-gray-900 dark:text-white uppercase tracking-tighter leading-none">{title}</h1>
                    {subtitle && (
                        <p className="text-gray-400 dark:text-gray-500 font-bold text-xs mt-3 uppercase tracking-[0.4em] flex items-center gap-3 px-1">
                            {subtitle} <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse inline-block"></span>
                        </p>
                    )}
                </div>
                {children}
            </div>
        </div>
    );
};

export default AdminLayout;
