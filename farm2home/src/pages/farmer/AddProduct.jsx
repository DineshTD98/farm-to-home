import { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../../redux/slices/authSlice';
import { addProduct } from '../../api/products';
import { useTranslation } from 'react-i18next';
import { productData, getCategoryByProduct } from '../../utils/productData';

const inputClass = 'w-full bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl px-5 py-4 text-gray-900 dark:text-white text-sm font-medium placeholder-gray-400 focus:outline-none focus:border-green-600 focus:ring-4 focus:ring-green-500/5 transition-all duration-300 shadow-inner';

const AddProduct = () => {
  const navigate = useNavigate();
  const user = useSelector(selectCurrentUser) || {};
  const { isDarkMode } = useTheme();
  const { t } = useTranslation();
  
  const [formData, setFormData] = useState({
    name: '',
    category: 'Vegetables',
    quantity: '',
    unit: 'kg',
    pricePerUnit: '',
    description: '',
  });
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'name') {
      if (value === 'Custom') {
        setShowCustomInput(true);
        setFormData({ ...formData, name: '' });
      } else {
        setShowCustomInput(false);
        const category = getCategoryByProduct(value);
        setFormData({ ...formData, name: value, category });
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }
    setError('');
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setPreview(URL.createObjectURL(file));
      setError('');
    } else {
      setImageFile(null);
      setPreview(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data = new FormData();
      data.append('name', formData.name);
      data.append('category', formData.category);
      data.append('quantity', formData.quantity);
      data.append('pricePerUnit', formData.pricePerUnit);
      data.append('unit', formData.unit);
      data.append('description', formData.description || '');
      data.append('farmerId', user.id || user._id);
      if (imageFile) {
        data.append('image', imageFile);
      }

      await addProduct(data);
      navigate('/farmer/products');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] flex flex-col items-center justify-center px-6 py-12 relative overflow-hidden font-sans transition-colors duration-500 text-gray-900 dark:text-white">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute w-[600px] h-[600px] rounded-full bg-green-100/20 dark:bg-green-400/5 -top-40 -right-24 animate-pulse duration-[4000ms]" />
        <div className="absolute w-[400px] h-[400px] rounded-full bg-green-50/50 dark:bg-white/5 bottom-10 -left-16 animate-pulse duration-[6000ms]" />
      </div>

      <div className="relative w-full max-w-2xl bg-white dark:bg-[#111111] border border-gray-100 dark:border-white/5 rounded-[4rem] p-12 shadow-2xl shadow-gray-900/5 animate-in fade-in zoom-in duration-500 transition-colors duration-500">
        <div className="text-center mb-12 relative z-10">
          <div className="text-7xl mb-6">🌱</div>
          <h1 className="text-4xl font-black text-gray-900 dark:text-white uppercase tracking-tighter leading-none mb-3">{t('farmerCrops.addProduct')}</h1>
          <p className="text-gray-400 dark:text-gray-500 text-sm font-medium italic">{t('farmerCrops.addSubtitle')}</p>
        </div>

        {error && (
          <div className="p-6 rounded-[2rem] bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 text-red-600 dark:text-red-500 text-sm font-medium mb-10 shadow-sm relative z-10">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-1">
              <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.4em] mb-3 ml-2">
                {t('farmerCrops.form.productName')}
              </label>
              {!showCustomInput ? (
                <select 
                  name="name" 
                  value={formData.name} 
                  onChange={handleChange} 
                  required 
                  className={`${inputClass} cursor-pointer appearance-none`}
                >
                  <option value="" disabled className="dark:bg-[#111111]">Select a product</option>
                  {Object.entries(productData).map(([category, products]) => (
                    <optgroup key={category} label={category} className="dark:bg-[#111111] font-bold text-green-600">
                      {products.map(product => (
                        <option key={product} value={product} className="dark:bg-[#111111] text-gray-900 dark:text-white font-medium">
                          {t(`productNames.${product}`)}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                  <option value="Custom" className="dark:bg-[#111111] font-bold text-orange-500">
                    ✨ {t('productNames.Custom')}
                  </option>
                </select>
              ) : (
                <div className="relative group">
                  <input 
                    type="text" 
                    name="name" 
                    placeholder="e.g. Rare Organic Herb" 
                    value={formData.name} 
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
                    onBlur={() => { if (!formData.name) setShowCustomInput(false); }}
                    autoFocus
                    required 
                    className={inputClass} 
                  />
                  <button 
                    type="button"
                    onClick={() => setShowCustomInput(false)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-green-600 uppercase tracking-widest hover:scale-105 transition-transform"
                  >
                    Select List
                  </button>
                </div>
              )}
            </div>
            <div>
              <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.4em] mb-3 ml-2">{t('farmerCrops.form.category')}</label>
              <select name="category" value={formData.category} onChange={handleChange} required className={`${inputClass} cursor-pointer appearance-none`}>
                <option value="Vegetables" className="dark:bg-[#111111]">Vegetables</option>
                <option value="Fruits" className="dark:bg-[#111111]">Fruits</option>
                <option value="Grains" className="dark:bg-[#111111]">Grains</option>
                <option value="Dairy" className="dark:bg-[#111111]">Dairy</option>
                <option value="Poultry" className="dark:bg-[#111111]">Poultry</option>
                <option value="Others" className="dark:bg-[#111111]">Others</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.4em] mb-3 ml-2">{t('farmerCrops.form.quantity')} ({formData.unit})</label>
              <input type="number" name="quantity" step="0.01" placeholder="e.g. 100" value={formData.quantity} onChange={handleChange} required className={inputClass} />
            </div>
            <div>
              <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.4em] mb-3 ml-2">Unit</label>
              <select name="unit" value={formData.unit} onChange={handleChange} required className={`${inputClass} cursor-pointer appearance-none`}>
                <option value="kg" className="dark:bg-[#111111]">kg (Kilograms)</option>
                <option value="g" className="dark:bg-[#111111]">g (Grams)</option>
                <option value="piece" className="dark:bg-[#111111]">piece (Units)</option>
                <option value="bunch" className="dark:bg-[#111111]">bunch (Group)</option>
                <option value="litre" className="dark:bg-[#111111]">litre (Volume)</option>
                <option value="dozen" className="dark:bg-[#111111]">dozen (12 items)</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.4em] mb-3 ml-2">Price per {formData.unit}</label>
              <input type="number" name="pricePerUnit" placeholder="e.g. 40" value={formData.pricePerUnit} onChange={handleChange} required className={inputClass} />
            </div>
            <div className="md:col-span-2">
              <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.4em] mb-3 ml-2">{t('farmerCrops.form.desc')}</label>
              <textarea name="description" placeholder="Describe the quality and origin of your harvest..." value={formData.description} onChange={handleChange} className={`${inputClass} h-28 resize-none`} />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.4em] mb-4 ml-2">{t('farmerCrops.form.photo')}</label>
            {preview ? (
              <div className="w-full h-64 rounded-[2.5rem] overflow-hidden border border-gray-100 dark:border-white/10 group relative shadow-md">
                <img src={preview} alt="Preview" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <button 
                  type="button"
                  onClick={() => { setImageFile(null); setPreview(null); }}
                  className="absolute inset-0 bg-white/40 dark:bg-black/40 backdrop-blur-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all font-black text-[10px] text-gray-900 dark:text-white uppercase tracking-widest"
                >
                  Change Visualization
                </button>
              </div>
            ) : (
              <label className="w-full h-64 rounded-[2.5rem] border-2 border-dashed border-gray-100 dark:border-white/10 flex flex-col items-center justify-center cursor-pointer hover:border-green-600/40 dark:hover:border-green-500/20 hover:bg-green-50/20 dark:hover:bg-green-400/5 transition-all duration-300 group">
                <div className="text-6xl mb-4 opacity-20 transform transition-transform group-hover:scale-110 duration-500">📸</div>
                <div className="text-[10px] text-gray-400 dark:text-gray-500 uppercase font-black tracking-widest">Capture First Glance</div>
                <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
              </label>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-6">
            <button
              type="button"
              onClick={() => navigate('/farmer/products')}
              className="flex-1 py-5 rounded-2xl border border-gray-100 dark:border-white/10 text-gray-400 dark:text-gray-500 font-black text-[10px] uppercase tracking-widest hover:text-gray-900 dark:hover:text-white hover:border-gray-900 dark:hover:border-white/20 transition-all active:scale-95 duration-300 shadow-sm"
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-[2] py-5 rounded-2xl bg-gray-900 dark:bg-white text-white dark:text-black font-black text-[10px] uppercase tracking-[0.3em] shadow-2xl shadow-gray-900/10 hover:bg-green-600 hover:shadow-green-500/30 hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 active:scale-95 px-6"
            >
              {loading ? t('common.loading') : t('farmerCrops.buttons.publish')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProduct;
