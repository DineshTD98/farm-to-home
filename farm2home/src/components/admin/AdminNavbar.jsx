import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../redux/slices/authSlice';

const AdminNavbar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();
    const user = useSelector((state) => state.auth.user);
    const isPortalPage = location.pathname === '/admin-portal';

    const handleLogout = () => {
        dispatch(logout());
        navigate('/');
    };

    return (
        <nav className="flex items-center justify-between px-8 py-4 bg-white dark:bg-[#111111] border-b border-gray-100 dark:border-white/5 sticky top-0 z-50 shadow-sm transition-colors duration-500">
            <div className="flex items-center gap-6">
                <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate('/admin-portal')}>
                    <span className="text-2xl group-hover:scale-110 transition-transform">🌾</span>
                    <div className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tighter">
                        Farm<span className="text-[#fbbc05]">2</span>Home <span className="text-purple-600 ml-2">ADMIN</span>
                    </div>
                </div>

                {!isPortalPage && (
                    <button
                        onClick={() => navigate('/admin-portal')}
                        className="px-5 py-2 rounded-xl bg-gray-50 dark:bg-white/5 text-gray-500 text-[9px] font-black uppercase tracking-[0.2em] hover:bg-gray-100 dark:hover:bg-white/10 transition-all border border-gray-100 dark:border-white/5"
                    >
                        ← Dashboard
                    </button>
                )}
            </div>

            <div className="flex items-center gap-8">
                <div className="flex items-center gap-4 text-right">
                    <div className="hidden md:block">
                        <div className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-tighter">
                            {user?.firstName} {user?.lastName}
                        </div>
                        <div className="text-[9px] font-bold text-purple-500 uppercase tracking-widest">
                            Administrator
                        </div>
                    </div>
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-black shadow-lg shadow-purple-500/20">
                        {user?.firstName?.[0]}{user?.lastName?.[0]}
                    </div>
                </div>

                <button
                    onClick={handleLogout}
                    className="px-6 py-2.5 rounded-xl bg-red-50 dark:bg-red-900/10 text-red-600 text-[10px] font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all active:scale-95 border border-red-100 dark:border-red-900/20"
                >
                    Sign Out
                </button>
            </div>
        </nav>
    );
};

export default AdminNavbar;
