import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import i18n from '../i18n';

import AdminNavbar from '../components/admin/AdminNavbar';

const AdminLayout = ({ children, title, subtitle }) => {
    useEffect(() => {
        // Force English for Admin portal
        if (i18n.language !== 'en') {
            i18n.changeLanguage('en');
        }
    }, []);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] flex flex-col font-sans transition-colors duration-500 text-gray-900 dark:text-white">
            <AdminNavbar />

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
