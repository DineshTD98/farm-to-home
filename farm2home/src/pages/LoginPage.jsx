import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../redux/slices/authSlice';
import { loginUser } from '../api/auth';
import { useTheme } from '../context/ThemeContext';
import { useSelector } from 'react-redux';
import { useEffect } from 'react';

const inputClass =
  'w-full bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-5 py-3.5 text-gray-900 dark:text-white text-sm placeholder-gray-400 focus:outline-none focus:border-[#fbbc05] focus:ring-4 focus:ring-[#fbbc05]/10 transition-all duration-300 shadow-sm';

const LoginPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isDarkMode } = useTheme();
  const user = useSelector(state => state.auth.user);
  const token = useSelector(state => state.auth.token);

  useEffect(() => {
    if (token && user) {
      navigate(`/${user.role}-portal`, { replace: true });
    }
  }, [token, user, navigate]);

  const [form, setForm] = useState({ phone: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await loginUser(form);
      dispatch(setCredentials({ user: data.user, token: data.token }));
      navigate(`/${data.user.role}-portal`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] flex items-center justify-center px-4 relative overflow-hidden font-sans transition-colors duration-500">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-amber-100/30 dark:bg-amber-400/5 rounded-full blur-[120px] -mr-40 -mt-40 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[30rem] h-[30rem] bg-gray-200/40 dark:bg-white/5 rounded-full blur-[100px] -ml-20 -mb-20 pointer-events-none" />

      {/* Floating Theme Toggle */}
      <div className="absolute top-8 right-8 z-50">
      </div>

      <div className="relative w-full max-w-[440px] bg-white dark:bg-[#111111] border border-gray-100 dark:border-white/5 rounded-[2.5rem] p-10 md:p-14 shadow-2xl shadow-amber-900/5 animate-[fadeUp_0.5s_ease]">

        {/* Logo */}
        <div className="text-center mb-10">
          <div className="text-6xl mb-4">🌾</div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter uppercase">Farm<span className="text-[#fbbc05]">2</span>Home</h1>
          <p className="text-gray-400 dark:text-gray-500 text-[10px] font-black uppercase tracking-[0.2em] mt-2">Welcome Back</p>
        </div>

        <div className="mb-8">
            <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight uppercase">Login</h2>
            <div className="h-1 w-10 bg-[#fbbc05] mt-2 rounded-full"></div>
        </div>

        {error && (
          <div className="flex items-center gap-3 px-5 py-4 rounded-2xl bg-red-50 border border-red-100 text-red-600 text-xs font-bold mb-6 animate-pulse">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Phone Number</label>
            <input type="tel" name="phone" placeholder="98765 43210" value={form.phone} onChange={handleChange} required className={inputClass} />
          </div>

          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Password</label>
            <input type="password" name="password" placeholder="••••••••" value={form.password} onChange={handleChange} required className={inputClass} />
            <div className="flex justify-end mt-2">
              <button 
                type="button" 
                onClick={() => navigate('/forgot-password')}
                className="text-[10px] font-black text-[#fbbc05] uppercase tracking-widest hover:underline px-1"
              >
                Forgot Password?
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-5 rounded-2xl bg-gray-900 text-white font-black text-[12px] uppercase tracking-[0.2em] shadow-xl shadow-gray-900/20 hover:bg-[#fbbc05] hover:text-white hover:-translate-y-1 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed mt-4"
          >
            {loading ? '⏳ Signing in...' : 'Sign In Now'}
          </button>
        </form>

        <div className="mt-10 pt-8 border-t border-gray-50 dark:border-white/5 flex flex-col items-center gap-4">
            <p className="text-gray-400 dark:text-gray-500 text-xs font-medium">
              New to Farm2Home?{' '}
              <span onClick={() => navigate('/signup')} className="text-[#fbbc05] font-black uppercase tracking-widest cursor-pointer hover:underline ml-1">Create Account</span>
            </p>
            <button 
              onClick={() => navigate('/')} 
              className="text-gray-400 dark:text-gray-500 text-[10px] font-black uppercase tracking-widest hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              ← Back to Overview
            </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
