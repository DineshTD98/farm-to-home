import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { forgotPassword } from '../api/auth';
import { useTheme } from '../context/ThemeContext';

const inputClass =
  'w-full bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-xl px-5 py-3.5 text-gray-900 dark:text-white text-sm placeholder-gray-400 focus:outline-none focus:border-[#fbbc05] focus:ring-4 focus:ring-[#fbbc05]/10 transition-all duration-300 shadow-sm';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await forgotPassword(email);
      setSuccess('Code sent! Redirecting to verification...');
      setTimeout(() => navigate('/reset-password'), 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] flex items-center justify-center px-4 relative overflow-hidden font-sans transition-colors duration-500">
      <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-amber-100/20 dark:bg-amber-400/5 rounded-full blur-[140px] -mr-40 -mt-40 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[30rem] h-[30rem] bg-gray-100 dark:bg-white/5 rounded-full blur-[100px] -ml-20 -mb-20 pointer-events-none" />

      <div className="relative w-full max-w-[440px] bg-white dark:bg-[#111111] border border-gray-100 dark:border-white/5 rounded-[2.5rem] p-10 md:p-14 shadow-2xl shadow-amber-900/5">
        <div className="text-center mb-10">
          <div className="text-5xl mb-3">🔑</div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tighter uppercase">Reset Password</h1>
          <p className="text-gray-400 dark:text-gray-500 text-[10px] font-black uppercase tracking-[0.2em] mt-2">Enter email to recover access</p>
        </div>

        {error && (
          <div className="flex items-center gap-3 px-5 py-4 rounded-2xl bg-red-50 border border-red-100 text-red-600 text-xs font-bold mb-6">
            ⚠️ {error}
          </div>
        )}
        {success && (
          <div className="flex items-center gap-3 px-5 py-4 rounded-2xl bg-green-50 border border-green-100 text-green-600 text-xs font-bold mb-6">
            ✅ {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Email Address</label>
            <input 
                type="email" 
                placeholder="john@example.com" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
                className={inputClass} 
            />
          </div>

          <button
            type="submit"
            disabled={loading || success}
            className="w-full py-5 rounded-2xl bg-gray-900 text-white font-black text-[12px] uppercase tracking-[0.2em] shadow-xl shadow-gray-900/10 hover:bg-[#fbbc05] hover:text-white hover:-translate-y-1 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed mt-4"
          >
            {loading ? '⏳ Processing...' : 'Send Reset Link'}
          </button>
        </form>

        <div className="mt-10 pt-8 border-t border-gray-50 dark:border-white/5 flex flex-col items-center">
            <button 
              onClick={() => navigate('/login')} 
              className="text-gray-400 dark:text-gray-500 text-[10px] font-black uppercase tracking-widest hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              ← Back to Login
            </button>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
