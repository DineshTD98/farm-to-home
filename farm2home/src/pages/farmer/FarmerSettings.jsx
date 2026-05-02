import { useState, useRef, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { selectCurrentUser, selectCurrentToken, setCredentials, logout } from '../../redux/slices/authSlice';
import { updateProfile, deleteAccount, getProfile } from '../../api/auth';
import MapPicker from '../../components/MapPicker';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../context/LanguageContext';

const InputField = ({ label, ...props }) => (
  <div>
    <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 mb-2 uppercase tracking-[0.3em] ml-1">{label}</label>
    <input
      className="w-full bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl px-5 py-3.5 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-green-600 focus:ring-4 focus:ring-green-500/5 transition-all font-medium text-sm shadow-inner"
      {...props}
    />
  </div>
);

const FarmerSettings = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector(selectCurrentUser);
  const token = useSelector(selectCurrentToken);
  const { isDarkMode } = useTheme();
  const { t } = useTranslation();
  const { language, setLanguage } = useLanguage();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const avatarInputRef = useRef(null);

  const UPLOADS_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5008';

  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    phone: user?.phone || '',
    email: user?.email || '',
    address: user?.address || '',
    pincode: user?.pincode || '',
    latitude: user?.location?.coordinates?.[1] || '',
    longitude: user?.location?.coordinates?.[0] || '',
    bankAccountHolderName: user?.bankDetails?.accountHolderName || '',
    bankAccountNumber: user?.bankDetails?.accountNumber || '',
    bankIfsc: user?.bankDetails?.ifsc || '',
    bankName: user?.bankDetails?.bankName || '',
    bankUpiId: user?.bankDetails?.upiId || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [avatarPreview, setAvatarPreview] = useState(user?.avatar ? `${UPLOADS_BASE}${user.avatar.replace('/uploads', '')}` : null);
  const [avatarFile, setAvatarFile] = useState(null);

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });

  const [deletePassword, setDeletePassword] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  useEffect(() => {
    const fetchFreshProfile = async () => {
      try {
        if (user?.id || user?._id) {
          const freshUser = await getProfile(user.id || user._id);
          dispatch(setCredentials({ user: freshUser, token }));
        }
      } catch (err) {
        console.error('Failed to fetch fresh profile', err);
      }
    };
    fetchFreshProfile();
  }, []);

  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      phone: user?.phone || '',
      email: user?.email || '',
      address: user?.address || '',
      pincode: user?.pincode || '',
      latitude: user?.location?.coordinates?.[1] || '',
      longitude: user?.location?.coordinates?.[0] || '',
      bankAccountHolderName: user?.bankDetails?.accountHolderName || '',
      bankAccountNumber: user?.bankDetails?.accountNumber || '',
      bankIfsc: user?.bankDetails?.ifsc || '',
      bankName: user?.bankDetails?.bankName || '',
      bankUpiId: user?.bankDetails?.upiId || '',
    }));
    if (user?.avatar) setAvatarPreview(`${UPLOADS_BASE}${user.avatar.replace('/uploads', '')}`);
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handlePincodeChange = async (e) => {
    const pincode = e.target.value;
    setFormData(prev => ({ ...prev, pincode }));
    if (pincode.length === 6) {
      try {
        const response = await axios.get(`https://nominatim.openstreetmap.org/search?postalcode=${pincode}&country=India&format=json`);
        if (response.data && response.data.length > 0) {
          const { lat, lon } = response.data[0];
          setFormData(prev => ({ ...prev, latitude: parseFloat(lat), longitude: parseFloat(lon) }));
          setStatus({ type: 'success', message: 'Region identified successfully.' });
        }
      } catch (err) {
        console.error('Geocoding error:', err);
      }
    }
  };

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) return;
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData(prev => ({
          ...prev,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        }));
        setLoading(false);
        setStatus({ type: 'success', message: 'GPS coordinates captured.' });
      },
      () => setLoading(false)
    );
  };

  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      setDeleteError('Authorized password required.');
      return;
    }
    setDeleteLoading(true);
    try {
      await deleteAccount(user.id || user._id, deletePassword);
      dispatch(logout());
      navigate('/');
    } catch (err) {
      setDeleteError(err.message);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = new FormData();
      Object.keys(formData).forEach(key => {
        if (!key.startsWith('bank') && formData[key] !== undefined && formData[key] !== null && formData[key] !== '') {
          payload.append(key, formData[key]);
        }
      });
      
      const bankDetailsPayload = {
          accountHolderName: formData.bankAccountHolderName,
          accountNumber: formData.bankAccountNumber,
          ifsc: formData.bankIfsc,
          bankName: formData.bankName,
          upiId: formData.bankUpiId
      };
      payload.append('bankDetails', JSON.stringify(bankDetailsPayload));
      if (avatarFile) payload.append('avatar', avatarFile);

      const response = await updateProfile(user.id || user._id, payload);
      dispatch(setCredentials({ user: response.user, token }));
      setStatus({ type: 'success', message: 'Encrypted profile updated.' });
      setTimeout(() => setIsModalOpen(false), 1500);
    } catch (err) {
      setStatus({ type: 'error', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  const initials = `${user?.firstName?.[0] || ''}${user?.lastName?.[0] || ''}`.toUpperCase();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] flex flex-col font-sans transition-colors duration-500 text-gray-900 dark:text-white">
      <nav className="flex items-center justify-between px-8 py-4 bg-white dark:bg-[#111111] border-b border-gray-100 dark:border-white/5 sticky top-0 z-50 shadow-sm transition-colors duration-500">
        <div className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tighter cursor-pointer group flex items-center gap-2" onClick={() => navigate('/farmer-portal')}>
          <span className="text-2xl group-hover:scale-110 transition-transform">🌾</span>
          <span>Farm<span className="text-green-600">2</span>Home</span>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/farmer-portal')} className="px-6 py-2.5 rounded-full border border-gray-100 dark:border-white/10 text-gray-400 dark:text-gray-500 text-[10px] font-black uppercase tracking-widest hover:text-gray-900 dark:hover:text-white hover:border-gray-900 dark:hover:border-white transition-all">
            ← DASHBOARD
          </button>
        </div>
      </nav>

      <div className="flex-1 max-w-5xl w-full mx-auto px-6 py-12">
        <div className="mb-12">
          <h1 className="text-5xl font-black text-gray-900 dark:text-white uppercase tracking-tighter leading-none">{t('farmerSettings.title')}</h1>
          <p className="text-gray-400 dark:text-gray-500 font-bold text-xs mt-3 uppercase tracking-[0.4em] flex items-center gap-3 px-1">
             Manage Producer Credentials <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse inline-block"></span>
          </p>
        </div>

        {/* Language Preference Section */}
        <div className="mb-8 bg-white dark:bg-[#111111] border border-gray-100 dark:border-white/5 rounded-[3rem] p-10 shadow-sm transition-colors duration-500">
          <div className="mb-6">
            <h2 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">{t('farmerSettings.language')}</h2>
            <p className="text-gray-400 dark:text-gray-500 text-xs mt-2 font-medium">{t('farmerSettings.languageDesc')}</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { code: 'en', label: 'English', sub: 'English' },
              { code: 'ta', label: 'தமிழ்', sub: 'Tamil' },
            ].map(({ code, label, sub }) => (
              <button
                key={code}
                onClick={() => setLanguage(code)}
                className={`p-5 rounded-2xl border-2 text-center transition-all duration-300 ${
                  language === code
                    ? 'border-green-600 bg-green-50/50 dark:bg-green-900/10 shadow-xl shadow-green-500/10'
                    : 'border-gray-100 dark:border-white/10 bg-gray-50 dark:bg-white/5 hover:border-gray-200 dark:hover:border-white/20'
                }`}
              >
                <p className={`text-lg font-black ${language === code ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-500'}`}>{label}</p>
                <p className={`text-[10px] font-bold uppercase tracking-widest mt-1 ${language === code ? 'text-green-600 dark:text-green-400' : 'text-gray-300 dark:text-gray-600'}`}>{sub}</p>
                {language === code && <p className="text-[9px] text-green-500 font-black mt-2 uppercase tracking-widest">✓ Active</p>}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-[#111111] border border-gray-100 dark:border-white/5 rounded-[4rem] p-12 shadow-2xl shadow-gray-900/5 relative overflow-hidden group transition-colors duration-500">
           <div className="absolute top-0 left-0 w-full h-40 bg-gradient-to-b from-green-50/30 dark:from-green-900/5 to-transparent pointer-events-none"></div>
           
           <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10 mb-16">
             <div className="flex items-center gap-8">
                <div className="w-32 h-32 shrink-0 rounded-[2.5rem] overflow-hidden border-4 border-white dark:border-white/10 bg-gray-50 dark:bg-white/5 flex items-center justify-center font-black text-4xl text-gray-900 dark:text-white shadow-2xl shadow-green-900/10 transition-transform duration-500 group-hover:scale-105">
                  {avatarPreview ? <img src={avatarPreview} className="w-full h-full object-cover" alt=""/> : initials}
                </div>
                <div>
                  <h2 className="text-4xl font-black text-gray-900 dark:text-white uppercase tracking-tighter leading-none mb-3">{user?.firstName} {user?.lastName}</h2>
                  <div className="inline-flex px-4 py-1.5 bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-900/20 text-green-600 dark:text-green-500 text-[10px] font-black uppercase tracking-widest rounded-full shadow-sm">
                    Verified Farmer Partner
                  </div>
                </div>
             </div>
             <button
               onClick={() => setIsModalOpen(true)}
               className="px-10 py-5 bg-gray-900 dark:bg-white text-white dark:text-black font-black text-[10px] uppercase tracking-[0.3em] rounded-2xl hover:bg-green-600 hover:text-white transition-all shadow-xl shadow-gray-900/10 hover:-translate-y-1 active:scale-95 duration-300"
             >
               Modify Profile
             </button>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-12 relative z-10 border-t border-gray-50 dark:border-white/5 pt-12">
              <div className="bg-gray-50/50 dark:bg-white/5 p-8 rounded-[2rem] border border-gray-100 dark:border-white/10 shadow-inner">
                <div className="text-[10px] text-gray-400 dark:text-gray-500 font-black uppercase tracking-[0.4em] mb-3 px-1">Registered Contact</div>
                <div className="text-2xl text-gray-900 dark:text-white font-black tracking-tight">{user?.phone || 'UNAVAILABLE'}</div>
              </div>
               <div className="bg-gray-50/50 dark:bg-white/5 p-8 rounded-[2rem] border border-gray-100 dark:border-white/10 shadow-inner">
                 <div className="text-[10px] text-gray-400 dark:text-gray-500 font-black uppercase tracking-[0.4em] mb-3 px-1">Harvest Hub</div>
                 <div className="text-xl text-gray-900 dark:text-white font-black tracking-tighter leading-none mb-2 capitalize">{user?.address || 'UNSET'}</div>
                 <div className="text-[10px] text-green-600 dark:text-green-500 font-black uppercase tracking-widest">{user?.pincode ? `PIN: ${user.pincode}` : 'NO PINCODE'}</div>
               </div>
            </div>
         </div>

        <div className="mt-10 bg-red-50/30 dark:bg-red-900/5 border border-red-50 dark:border-red-900/10 rounded-[3rem] p-10 flex flex-col lg:flex-row items-center justify-between gap-8 transition-all hover:bg-red-50/50 dark:hover:bg-red-900/10">
          <div className="text-center lg:text-left">
            <h2 className="text-xl font-black text-red-500 dark:text-red-400 uppercase tracking-tighter">Decommission Account</h2>
            <p className="text-gray-400 dark:text-gray-500 text-xs mt-2 font-medium italic">Permanently erase your producer profile and harvest legacy from the platform.</p>
          </div>
          {!showDeleteConfirm ? (
            <button 
              onClick={() => setShowDeleteConfirm(true)}
              className="px-8 py-4 rounded-xl text-red-400 text-[10px] font-black uppercase tracking-widest hover:text-red-600 transition-all">
              Initialize Deletion
            </button>
          ) : (
            <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto animate-in slide-in-from-right duration-500">
               <input 
                  type="password" 
                  placeholder="Security Code"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  className="bg-white dark:bg-white/5 border border-red-100 dark:border-red-900/20 rounded-2xl px-6 py-3.5 text-gray-900 dark:text-white focus:outline-none focus:border-red-500 transition-all font-black text-xs uppercase tracking-widest shadow-sm"
               />
                <div className="flex gap-3">
                    <button onClick={() => setShowDeleteConfirm(false)} className="px-6 py-3 rounded-2xl bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 text-gray-400 dark:text-gray-500 text-[10px] font-black uppercase tracking-widest hover:text-gray-900 dark:hover:text-white transition-all">Cancel</button>
                    <button onClick={handleDeleteAccount} disabled={deleteLoading} className="px-8 py-3 rounded-2xl bg-red-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-red-700 transition-all shadow-xl shadow-red-600/20 disabled:opacity-50">Confirm</button>
                </div>
            </div>
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-10">
          <div className="absolute inset-0 bg-white/40 dark:bg-black/60 backdrop-blur-md" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative w-full max-w-4xl bg-white dark:bg-[#111111] border border-gray-100 dark:border-white/5 rounded-[4rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in duration-300 font-sans transition-colors duration-500">
            <div className="p-10 border-b border-gray-50 dark:border-white/5 flex justify-between items-center bg-white dark:bg-[#111111] sticky top-0 z-10">
              <div>
                <h2 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">Edit Credentials</h2>
                <p className="text-gray-400 dark:text-gray-500 text-[10px] font-black uppercase tracking-[0.4em] mt-2 px-1">Synchronizing Encrypted Data</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="w-12 h-12 flex items-center justify-center rounded-full bg-gray-50 dark:bg-white/5 text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition-all rotate-45 text-3xl font-light shadow-sm">
                +
              </button>
            </div>

            <div className="p-10 md:p-16 overflow-y-auto flex-1 no-scrollbar space-y-12">
              {status.message && (
                <div className={`p-6 rounded-[2rem] border transition-all animate-in slide-in-from-top duration-500 font-black text-xs uppercase tracking-widest ${
                  status.type === 'error' ? 'bg-red-50 dark:bg-red-900/10 border-red-100 dark:border-red-900/20 text-red-500' : 'bg-green-50 dark:bg-green-900/10 border-green-100 dark:border-green-900/20 text-green-600'
                }`}>
                  {status.message}
                </div>
              )}

              <form id="updateProfileForm" onSubmit={handleSubmit} className="space-y-16">
                 <div>
                  <h3 className="text-[11px] font-black text-green-600 dark:text-green-500 uppercase tracking-[0.5em] mb-8 border-b border-green-50 dark:border-green-900/10 pb-4">Visualization</h3>
                  <div className="flex flex-col sm:flex-row items-center gap-10">
                    <div className="relative group">
                      <div className="w-32 h-32 rounded-[2.5rem] overflow-hidden border-4 border-gray-50 dark:border-white/10 bg-gray-100 dark:bg-white/5 flex items-center justify-center font-black text-4xl text-gray-300 dark:text-gray-600 shadow-xl transition-all duration-500 group-hover:shadow-green-500/20">
                        {avatarPreview ? <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" /> : initials}
                      </div>
                      <button type="button" onClick={() => avatarInputRef.current?.click()} className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-gray-900 dark:bg-white border-4 border-white dark:border-[#111111] flex items-center justify-center text-white dark:text-black hover:bg-green-600 dark:hover:bg-green-500 hover:text-white transition-all text-sm shadow-xl">✎</button>
                      <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                    </div>
                    <div className="flex-1 text-center sm:text-left">
                      <div className="text-gray-400 dark:text-gray-500 text-sm font-medium italic opacity-60">"Your profile visualization is the first point of trust for fresh buyers within the ecosystem."</div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-[11px] font-black text-green-600 dark:text-green-500 uppercase tracking-[0.5em] mb-8 border-b border-green-50 dark:border-green-900/10 pb-4">Personal Identity</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                    <InputField label="Operational First Name" type="text" name="firstName" value={formData.firstName} onChange={handleChange} required />
                    <InputField label="Operational Last Name" type="text" name="lastName" value={formData.lastName} onChange={handleChange} required />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                    <InputField label="Secure Contact Line" type="tel" name="phone" value={formData.phone} onChange={handleChange} required pattern="\d{10}" />
                    <InputField label="Email Address" type="email" name="email" value={formData.email} onChange={handleChange} required />
                  </div>
                </div>

                <div>
                  <h3 className="text-[11px] font-black text-green-600 dark:text-green-500 uppercase tracking-[0.5em] mb-8 border-b border-green-50 dark:border-green-900/10 pb-4">Geographical Presence</h3>
                  <div className="space-y-8">
                    <InputField label="Farmhouse Physical Address" type="text" name="address" value={formData.address} onChange={handleChange} placeholder="Line 1, Landmark, City" />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                      <InputField label="Regional PIN" type="text" name="pincode" value={formData.pincode} onChange={handlePincodeChange} maxLength={6} />
                      <InputField label="Lat Cardinal" type="number" step="any" name="latitude" value={formData.latitude} onChange={handleChange} />
                      <InputField label="Long Cardinal" type="number" step="any" name="longitude" value={formData.longitude} onChange={handleChange} />
                    </div>
                    <div>
                      <div className="text-[10px] text-gray-400 dark:text-gray-500 font-black uppercase tracking-[0.4em] mb-4 ml-2">Digital Mapping</div>
                      <div className="border border-gray-100 dark:border-white/10 rounded-[2.5rem] overflow-hidden shadow-inner">
                        <MapPicker lat={parseFloat(formData.latitude)} lng={parseFloat(formData.longitude)} onChange={(pos) => setFormData(prev => ({ ...prev, latitude: pos.lat, longitude: pos.lng }))} />
                      </div>
                    </div>
                    <button type="button" onClick={handleGetCurrentLocation} className="w-full px-8 py-5 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 text-gray-900 dark:text-white text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-white dark:hover:bg-white/10 hover:border-green-600 transition-all shadow-sm">
                      📍 TRIGGER GPS SYCHRONIZATION
                    </button>
                  </div>
                </div>

                <div>
                  <h3 className="text-[11px] font-black text-green-600 dark:text-green-500 uppercase tracking-[0.5em] mb-8 border-b border-green-50 dark:border-green-900/10 pb-4 flex items-center gap-4">
                      Financial Routing
                      {user?.bankDetails?.verified ? (
                          <span className="bg-green-100 text-green-600 px-3 py-1 rounded-full text-[9px]">✓ VERIFIED</span>
                      ) : (
                          <span className="bg-amber-100 text-amber-600 px-3 py-1 rounded-full text-[9px]">⏳ UNVERIFIED</span>
                      )}
                  </h3>
                  <div className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <InputField label="Account Holder Name" type="text" name="bankAccountHolderName" value={formData.bankAccountHolderName} onChange={handleChange} />
                      <InputField label="Account Number" type="password" name="bankAccountNumber" value={formData.bankAccountNumber} onChange={handleChange} />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                      <InputField label="Bank Name" type="text" name="bankName" value={formData.bankName} onChange={handleChange} />
                      <InputField label="IFSC Code" type="text" name="bankIfsc" value={formData.bankIfsc} onChange={handleChange} />
                      <InputField label="UPI ID (Optional)" type="text" name="bankUpiId" value={formData.bankUpiId} onChange={handleChange} />
                    </div>
                    <p className="text-[10px] font-medium text-amber-600 italic">Note: Updating your bank details will reset your verification status. Admin approval is required before payouts can resume.</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-[11px] font-black text-green-600 dark:text-green-500 uppercase tracking-[0.5em] mb-8 border-b border-green-50 dark:border-green-900/10 pb-4">Security Protocol</h3>
                  <div className="space-y-8">
                    <InputField label="Existing Pass-Key" type="password" name="currentPassword" value={formData.currentPassword} onChange={handleChange} />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <InputField label="Replacement Key" type="password" name="newPassword" value={formData.newPassword} onChange={handleChange} minLength={8} />
                      <InputField label="Key Verification" type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} />
                    </div>
                  </div>
                </div>
              </form>
            </div>

            <div className="p-10 border-t border-gray-50 dark:border-white/5 bg-white dark:bg-[#111111] sticky bottom-0 z-10 flex gap-6 justify-end">
              <button type="button" onClick={() => setIsModalOpen(false)} className="px-10 py-5 rounded-2xl border border-gray-100 dark:border-white/10 text-gray-400 dark:text-gray-500 text-[10px] font-black uppercase tracking-widest hover:text-gray-900 dark:hover:text-white transition-all">Cancel</button>
              <button form="updateProfileForm" type="submit" disabled={loading} className="px-12 py-5 rounded-2xl bg-gray-900 dark:bg-white text-white dark:text-black font-black text-[10px] uppercase tracking-[0.3em] shadow-xl shadow-gray-900/10 dark:shadow-white/5 hover:bg-green-600 dark:hover:bg-green-500 dark:hover:text-white hover:-translate-y-1 transition-all duration-300 disabled:opacity-50">
                {loading ? 'SYNCING...' : 'COMMIT CHANGES'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FarmerSettings;