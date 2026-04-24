import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from 'react-i18next';

const OrderSuccess = () => {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] flex flex-col items-center justify-center p-4 sm:p-6 text-center font-sans transition-colors duration-500 text-gray-900 dark:text-white overflow-x-hidden">
      <div className="w-full max-w-lg bg-white dark:bg-[#111111] border border-gray-100 dark:border-white/5 rounded-[2.5rem] sm:rounded-[4rem] p-6 sm:p-16 shadow-2xl shadow-gray-900/5 animate-in fade-in zoom-in duration-500 relative transition-colors duration-500 overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-50/30 dark:bg-amber-400/5 rounded-bl-full -mr-16 -mt-16"></div>
        <div className="flex justify-center mb-10 relative z-10">
          <div className="w-32 h-32 rounded-full bg-amber-50 dark:bg-amber-400/10 flex items-center justify-center animate-pulse duration-[3000ms] shadow-inner shadow-amber-900/5">
            <span className="text-7xl">🎉</span>
          </div>
          <div className="absolute -top-2 -right-2 w-12 h-12 rounded-full bg-[#fbbc05] text-white flex items-center justify-center font-black animate-bounce shadow-xl shadow-amber-500/40 border-4 border-white dark:border-gray-800">
            ✓
          </div>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black text-gray-900 dark:text-white uppercase tracking-tighter leading-none mb-4 relative z-10 transition-colors duration-500">{t('orderSuccess.title')}</h1>
        <p className="text-gray-400 dark:text-gray-500 text-base leading-relaxed mb-12 font-medium italic relative z-10 transition-colors duration-500">
          {t('orderSuccess.desc')}
        </p>

        <div className="space-y-4 relative z-10">
          <button 
            onClick={() => navigate('/buyer-portal')}
            className="w-full py-5 bg-gray-900 dark:bg-white text-white dark:text-black font-black text-[10px] uppercase tracking-[0.3em] rounded-2xl shadow-2xl shadow-gray-900/10 hover:bg-[#fbbc05] transition-all transform hover:-translate-y-1 active:scale-95 duration-300"
          >
            {t('orderSuccess.viewDashboard')}
          </button>
          <button 
            onClick={() => navigate('/buyer/browse')}
            className="w-full py-5 bg-white dark:bg-white/5 text-gray-400 dark:text-gray-500 font-black text-[10px] uppercase tracking-widest rounded-2xl border border-gray-100 dark:border-white/10 hover:text-gray-900 dark:hover:text-white hover:border-gray-900 dark:hover:border-white/20 transition-all duration-300 active:scale-95 shadow-sm"
          >
            {t('orderSuccess.continue')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;
