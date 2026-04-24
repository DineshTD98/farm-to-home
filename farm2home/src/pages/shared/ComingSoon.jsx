import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const ComingSoon = ({ featureName, backLink }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0a] flex flex-col items-center justify-center p-6 text-center transition-colors duration-500">
      <div className="max-w-xl w-full">
        {/* Animated Background Blobs */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#fbbc05]/10 dark:bg-[#fbbc05]/5 rounded-full blur-[120px] pointer-events-none animate-pulse"></div>
        
        <div className="relative z-10">
          <div className="text-8xl mb-10 transform hover:scale-110 transition-transform duration-500 cursor-default">🚧</div>
          
          <div className="inline-flex items-center gap-3 px-6 py-2.5 rounded-full bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 text-[#fbbc05] text-[10px] font-black uppercase tracking-[0.4em] mb-8 shadow-sm">
            Feature Under Construction
          </div>
          
          <h1 className="text-5xl md:text-7xl font-black text-gray-900 dark:text-white leading-[1] tracking-tighter mb-8 uppercase">
             {featureName || 'Coming Soon'}
          </h1>
          
          <p className="text-lg text-gray-500 dark:text-gray-400 font-medium leading-relaxed mb-12 max-w-md mx-auto">
            We're currently harvesting the best experience for this feature. Please check back later as we grow our platform!
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate(backLink || '/')}
              className="px-10 py-5 rounded-3xl bg-gray-900 dark:bg-[#fbbc05] text-white dark:text-black font-black text-[11px] uppercase tracking-[0.2em] shadow-2xl hover:-translate-y-1 transition-all duration-300"
            >
              Back to Portal
            </button>
            <button
              onClick={() => navigate('/')}
              className="px-10 py-5 rounded-3xl bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 text-gray-900 dark:text-white font-black text-[11px] uppercase tracking-[0.2em] shadow-sm hover:border-[#fbbc05] hover:text-[#fbbc05] transition-all duration-300"
            >
              Go to Home
            </button>
          </div>
        </div>
      </div>
      
      {/* Branded Footer Strip */}
      <div className="absolute bottom-12 text-[10px] font-black uppercase tracking-[0.6em] text-gray-300 dark:text-gray-700 pointer-events-none">
        Farm<span className="text-[#fbbc05]">2</span>Home • Development
      </div>
    </div>
  );
};

export default ComingSoon;
