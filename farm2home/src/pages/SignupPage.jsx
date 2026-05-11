import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../redux/slices/authSlice';
import { signupUser } from '../api/auth';
import { useTheme } from '../context/ThemeContext';

const ROLES = [
  { value: 'farmer', label: '🧑‍🌾 Farmer' },
  { value: 'buyer', label: '🛒 Buyer' },
];

const inputClass =
  'w-full bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-xl px-5 py-3.5 text-gray-900 dark:text-white text-sm placeholder-gray-400 focus:outline-none focus:border-[#fbbc05] focus:ring-4 focus:ring-[#fbbc05]/10 transition-all duration-300 shadow-sm appearance-none';

const SignupPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isDarkMode } = useTheme();
  const [form, setForm] = useState({
    firstName: '', lastName: '', phone: '', email: '', role: '',
    password: '', confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');

    // Validations
    if (!/^\d{10}$/.test(form.phone)) return setError('Phone number must be exactly 10 digits.');
    if (!/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(form.email)) return setError('Please provide a valid email address.');
    if (form.password !== form.confirmPassword) return setError('Passwords do not match.');
    
    // Password security checks
    if (form.password.length <= 8) return setError('Password must be more than 8 characters (at least 9).');
    if (!/[A-Z]/.test(form.password)) return setError('Password must contain at least one capital letter.');
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(form.password)) return setError('Password must contain at least one special character.');

    if (!form.role) return setError('Please select a role.');
    if (!termsAccepted) return setError('You must agree to the Terms and Conditions.');

    setLoading(true);
    try {
      const data = await signupUser(form);
      dispatch(setCredentials({ user: data.user, token: data.token }));
      setSuccess('Account created! Redirecting...');
      setTimeout(() => navigate(`/${data.user.role}-portal`), 1000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] flex items-center justify-center px-4 py-16 relative overflow-hidden font-sans transition-colors duration-500">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-amber-100/20 dark:bg-amber-400/5 rounded-full blur-[140px] -mr-40 -mt-40 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[30rem] h-[30rem] bg-gray-100 dark:bg-white/5 rounded-full blur-[100px] -ml-20 -mb-20 pointer-events-none" />

      {/* Back to Overview Button */}
      {/* <button 
        onClick={() => navigate('/')}
        className="absolute top-8 left-8 z-50 text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors flex items-center gap-2"
      >
        <span>←</span> Back to Overview
      </button> */}

      {/* Floating Theme Toggle */}
      <div className="absolute top-8 right-8 z-50">
      </div>

      <div className="relative w-full max-w-[560px] bg-white dark:bg-[#111111] border border-gray-100 dark:border-white/5 rounded-[3rem] p-10 md:p-14 shadow-2xl shadow-amber-900/5 animate-[fadeUp_0.5s_ease]">

        {/* Logo */}
        <div className="text-center mb-10">
          <div className="text-5xl mb-3">🌾</div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tighter uppercase">Farm<span className="text-[#fbbc05]">2</span>Home</h1>
          <p className="text-gray-400 dark:text-gray-500 text-[10px] font-black uppercase tracking-[0.2em] mt-2">Create Account</p>
        </div>

        <div className="mb-8">
            <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight uppercase">Join the Network</h2>
            <div className="h-1 w-12 bg-[#fbbc05] mt-2 rounded-full"></div>
        </div>

        {error && (
          <div className="flex items-center gap-3 px-5 py-4 rounded-2xl bg-red-50 border border-red-100 text-red-600 text-xs font-bold mb-6 animate-shake">
            ⚠️ {error}
          </div>
        )}
        {success && (
          <div className="flex items-center gap-3 px-5 py-4 rounded-2xl bg-green-50 border border-green-100 text-green-600 text-xs font-bold mb-6">
            ✅ {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Name row */}
          <div className="grid grid-cols-2 gap-5">
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">First Name</label>
              <input type="text" name="firstName" value={form.firstName} onChange={handleChange} required className={inputClass} />
            </div>
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Last Name</label>
              <input type="text" name="lastName" value={form.lastName} onChange={handleChange} required className={inputClass} />
            </div>
          </div>

          {/* Phone & Email row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Phone Number</label>
              <input type="tel" name="phone" placeholder="98765 43210" value={form.phone} onChange={handleChange} required className={inputClass} />
            </div>
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Email Address</label>
              <input type="email" name="email" value={form.email} onChange={handleChange} required className={inputClass} />
            </div>
          </div>

          {/* Role */}
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Account Type</label>
            <div className="relative">
              <select name="role" value={form.role} onChange={handleChange} required className={inputClass + ' cursor-pointer'}>
                <option value="" disabled>Choose your role</option>
                {ROLES.map((r) => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
              <span className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">▾</span>
            </div>
          </div>

          {/* Password row */}
          <div className="grid grid-cols-2 gap-5">
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Password</label>
              <input type="password" name="password" placeholder="••••••••" value={form.password} onChange={handleChange} required className={inputClass} />
            </div>
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Confirm</label>
              <input type="password" name="confirmPassword" placeholder="••••••••" value={form.confirmPassword} onChange={handleChange} required className={inputClass} />
            </div>
          </div>

          {/* Terms & Conditions */}
          <div className="flex items-center gap-3 py-2">
            <input
              type="checkbox"
              id="terms"
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}
              className="w-4 h-4 text-[#fbbc05] bg-gray-100 border-gray-300 rounded focus:ring-[#fbbc05] dark:focus:ring-[#fbbc05] dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600 cursor-pointer"
            />
            <label htmlFor="terms" className="text-xs text-gray-500 dark:text-gray-400 font-medium">
              I agree to the{' '}
              <span onClick={() => navigate('/terms', { state: { backUrl: '/signup' } })} className="text-[#fbbc05] cursor-pointer hover:underline">
                Terms and Conditions
              </span>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-5 rounded-2xl bg-gray-900 text-white font-black text-[12px] uppercase tracking-[0.2em] shadow-xl shadow-gray-900/10 hover:bg-[#fbbc05] hover:text-white hover:-translate-y-1 transition-all duration-300 disabled:opacity-60 mt-4"
          >
            {loading ? '⏳ Creating Account...' : 'Continue Registration'}
          </button>
        </form>

        <p className="text-center text-gray-400 dark:text-gray-500 text-xs font-medium mt-10">
          Already a member?{' '}
          <span onClick={() => navigate('/login')} className="text-[#fbbc05] font-black uppercase tracking-widest cursor-pointer hover:underline ml-1">Sign In</span>
        </p>
      </div>
    </div>
  );
};

export default SignupPage;
