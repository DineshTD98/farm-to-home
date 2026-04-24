import { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { selectCartItems, selectCartTotal, clearCart } from '../../redux/slices/cartSlice';
import { selectCurrentUser } from '../../redux/slices/authSlice';
import { createOrder, createRazorpayOrder, verifyRazorpayPayment } from '../../api/orders';
import { useTranslation } from 'react-i18next';

const inputClass = "w-full bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl px-5 py-4 text-gray-900 dark:text-white text-sm font-medium focus:outline-none focus:border-[#fbbc05] focus:ring-4 focus:ring-amber-500/5 transition-all placeholder-gray-400 shadow-inner";

const Checkout = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const cartItems = useSelector(selectCartItems);
  const total = useSelector(selectCartTotal);
  const user = useSelector(selectCurrentUser);
  const { isDarkMode } = useTheme();
  const { t } = useTranslation();

  const [address, setAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [upiId, setUpiId] = useState('');
  const [upiName, setUpiName] = useState('');
  const [upiVerified, setUpiVerified] = useState(false);
  const [upiVerifying, setUpiVerifying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Card states
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');

  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return value;
    }
  };

  const handleCardNumberChange = (e) => setCardNumber(formatCardNumber(e.target.value));

  const formatExpiry = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return `${v.substring(0, 2)}/${v.substring(2, 4)}`;
    }
    return v;
  };
  const handleExpiryChange = (e) => setCardExpiry(formatExpiry(e.target.value));
  
  // Promo code states
  const [promoCode, setPromoCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [promoMessage, setPromoMessage] = useState('');
  const [promoError, setPromoError] = useState(false);

  // Compute final total based on discount percentage
  const discountedTotal = total - Math.floor(total * discount);

  const applyPromoCode = (e) => {
    e.preventDefault();
    const code = promoCode.trim().toUpperCase();
    if (!code) return;

    // Hardcoded simple promo codes for prototype
    const PROMOS = {
      'FARM10': 0.10,
      'WELCOME20': 0.20,
      'FRESH50': 0.50
    };

    if (PROMOS[code]) {
      setDiscount(PROMOS[code]);
      setPromoError(false);
      setPromoMessage(t('checkout.promoApplied') || "Discount applied successfully!");
    } else {
      setDiscount(0);
      setPromoError(true);
      setPromoMessage(t('checkout.promoInvalid') || "Invalid or expired code.");
    }
  };

  const handleVerifyUpi = () => {
    if (!upiId.trim()) return;
    setUpiVerifying(true);
    // Simulate UPI ID format validation
    setTimeout(() => {
      const upiRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9]+$/;
      if (upiRegex.test(upiId.trim())) {
        setUpiVerified(true);
        setError('');
      } else {
        setUpiVerified(false);
        setError('Invalid UPI ID format. Example: name@upi or number@bank');
      }
      setUpiVerifying(false);
    }, 1000);
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!address) {
      setError('Please enter your delivery address');
      return;
    }

    // Handle Cash on Delivery (simulated/legacy)
    if (paymentMethod === 'COD') {
      setLoading(true);
      try {
        const orderData = {
          buyerId: user.id || user._id,
          items: cartItems.map(item => ({
            product: item.product._id,
            quantity: item.quantity,
            price: item.price,
            farmerId: item.farmerId
          })),
          totalAmount: discountedTotal,
          deliveryAddress: address,
          paymentMethod,
        };

        await createOrder(orderData);
        dispatch(clearCart());
        navigate('/buyer/order-success');
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
      return;
    }

    // Handle Razorpay (CARD and UPI)
    if (paymentMethod === 'UPI' || paymentMethod === 'CARD') {
      try {
        setLoading(true);
        setError('');

        // Step 1: Create Order on Backend
        const razorpayOrder = await createRazorpayOrder(discountedTotal);

        if (!razorpayOrder || !razorpayOrder.id) {
          throw new Error('Failed to create Razorpay order');
        }

        // Configuration for Razorpay Checkout UI
        const options = {
          key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_SgXTib4ZEQmULX',
          amount: razorpayOrder.amount, // amount in paise
          currency: razorpayOrder.currency,
          name: 'Farm2Home',
          description: 'Payment for your fresh produce',
          image: '/favicon.svg',
          order_id: razorpayOrder.id,
          handler: async (response) => {
            try {
               // Step 2: Verify the payment on our backend securely
               setLoading(true);
               
               const orderDetails = {
                  buyerId: user.id || user._id,
                  items: cartItems.map(item => ({
                    product: item.product._id,
                    quantity: item.quantity,
                    price: item.price,
                    farmerId: item.farmerId
                  })),
                  totalAmount: discountedTotal,
                  deliveryAddress: address,
                  paymentMethod: 'RAZORPAY',
               };

               const verifyPayload = {
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  orderDetails: orderDetails
               };

               await verifyRazorpayPayment(verifyPayload);

               // Step 3: Clear cart and redirect
               dispatch(clearCart());
               navigate('/buyer/order-success');
            } catch (verifyError) {
               console.error('Payment verification failed:', verifyError);
               setError(verifyError.message || 'Payment verification failed. Please contact support.');
               setLoading(false);
            }
          },
          prefill: {
            name: `${user.firstName} ${user.lastName}`,
            email: user.email,
            contact: user.phone,
          },
          notes: {
            address: address,
          },
          theme: {
            color: '#fbbc05',
          },
        };

        const razorpayInstance = new window.Razorpay(options);
        
        razorpayInstance.on('payment.failed', function (response){
           setError(`Payment failed: ${response.error.description}`);
           setLoading(false);
        });

        razorpayInstance.open();

      } catch (err) {
         setError(err.message || 'Failed to initialize payment gateway.');
         setLoading(false);
      }
    }
  };

  if (cartItems.length === 0) {
    navigate('/buyer/browse');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] flex flex-col items-center py-10 sm:py-16 px-4 sm:px-6 font-sans transition-colors duration-500 text-gray-900 dark:text-white overflow-x-hidden">
      <div className="w-full max-w-2xl bg-white dark:bg-[#111111] border border-gray-100 dark:border-white/5 rounded-[2.5rem] sm:rounded-[4rem] p-5 sm:p-12 shadow-2xl shadow-gray-900/5 animate-in fade-in zoom-in duration-500 relative overflow-hidden transition-colors duration-500">
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-50/30 dark:bg-amber-400/5 rounded-bl-full -mr-16 -mt-16"></div>
        <div className="mb-12 text-center relative z-10">
          <div className="text-7xl mb-6">📦</div>
          <h1 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white uppercase tracking-tighter leading-none mb-3">{t('checkout.title')}</h1>
          <p className="text-gray-400 dark:text-gray-500 text-sm font-medium italic">{t('checkout.subtitle')}</p>
        </div>

        {error && (
          <div className="p-6 rounded-[2rem] bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 text-red-600 dark:text-red-500 text-sm font-medium mb-10 shadow-sm relative z-10">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handlePlaceOrder} className="space-y-10 relative z-10">
          
          {/* Order Summary Abstract */}
          <div className="bg-gray-50/50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-[2.5rem] p-8 shadow-inner transition-colors duration-500">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-4 border-b border-gray-100 dark:border-white/5 pb-4">Order Abstract</h3>
            <div className="max-h-48 overflow-y-auto no-scrollbar space-y-4 mb-2">
              {cartItems.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between group">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-white dark:bg-[#1a1a1a] border border-gray-100 dark:border-white/5 flex items-center justify-center overflow-hidden shadow-sm group-hover:scale-105 transition-transform duration-300">
                      {item.product.image ? (
                        <img src={item.product.image.startsWith('http') ? item.product.image : `${import.meta.env.VITE_API_URL || 'http://localhost:5008'}${item.product.image.startsWith('/') ? '' : '/'}${item.product.image.replace('/uploads', '')}`} alt={item.product.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-xl">✨</span>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900 dark:text-white">{item.product.name}</p>
                      <p className="text-[10px] uppercase font-black tracking-widest text-gray-400 dark:text-gray-500 mt-0.5">Qty: {item.quantity} {item.product.unit || 'kg'}</p>
                    </div>
                  </div>
                  <p className="text-sm font-black text-amber-500">₹{(item.price * item.quantity).toFixed(2)}</p>
                </div>
              ))}
            </div>
            
            {/* Promo Code System */}
            <div className="border-t border-gray-100 dark:border-white/5 pt-6 mt-6">
              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-3">{t('checkout.promoTitle') || "Voucher / Promo Code"}</label>
              <div className="flex flex-col sm:flex-row gap-3">
                <input 
                  type="text"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  placeholder={t('checkout.promoPlaceholder') || "Enter discount code"}
                  className="flex-1 bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white font-bold uppercase placeholder-gray-400 focus:outline-none focus:border-[#fbbc05] transition-all"
                />
                <button
                  onClick={applyPromoCode}
                  type="button"
                  className="px-6 py-3 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-black text-xs uppercase tracking-widest hover:bg-[#fbbc05] transition-colors"
                >
                  {t('checkout.promoApply') || "APPLY"}
                </button>
              </div>
              {promoMessage && (
                <p className={`text-xs font-bold mt-3 ${promoError ? 'text-red-500' : 'text-green-500'}`}>
                  {promoError ? '❌' : '✅'} {promoMessage}
                </p>
              )}
            </div>

            <div className="border-t border-gray-100 dark:border-white/5 pt-6 flex flex-col gap-2 mt-6">
              <div className="flex items-center justify-between opacity-60">
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Subtotal</span>
                <span className="text-sm font-bold text-gray-900 dark:text-white">₹{total.toFixed(2)}</span>
              </div>
              {discount > 0 && (
                <div className="flex items-center justify-between text-green-500 animate-in slide-in-from-right-2">
                  <span className="text-[10px] font-black uppercase tracking-widest">{t('checkout.discount') || "Discount"} ({discount * 100}%)</span>
                  <span className="text-sm font-bold">-₹{Math.floor(total * discount)}</span>
                </div>
              )}
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100 dark:border-white/5">
                <span className="text-[11px] font-black uppercase tracking-[0.3em] text-gray-500">Total Settlement</span>
                <span className="text-3xl font-black text-gray-900 dark:text-white leading-none">₹{discountedTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Delivery Address */}
          <div>
            <label className="block text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.4em] mb-4 ml-2">{t('checkout.deliveryAddress')}</label>
            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder={t('checkout.addressPlaceholder')}
              required
              rows="4"
              className={`${inputClass} resize-none`}
            />
          </div>

          {/* Payment Method Selection */}
          <div>
            <label className="block text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.4em] mb-6 ml-2">{t('checkout.paymentMethod')}</label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Cash on Delivery */}
              <div
                onClick={() => { setPaymentMethod('COD'); setError(''); }}
                className={`cursor-pointer p-6 rounded-[2rem] border-2 transition-all duration-300 text-center flex flex-col items-center justify-center gap-2 ${
                  paymentMethod === 'COD'
                    ? 'border-[#fbbc05] bg-amber-50/50 dark:bg-amber-400/10 shadow-xl shadow-amber-500/10'
                    : 'border-gray-50 dark:border-white/5 bg-gray-50 dark:bg-white/5 text-gray-400 dark:text-gray-600 hover:border-gray-100 dark:hover:border-white/10 hover:bg-white dark:hover:bg-white/10'
                }`}
              >
                <span className="text-2xl">💵</span>
                <span className={`text-[10px] font-black uppercase tracking-widest ${paymentMethod === 'COD' ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-600'}`}>
                  {t('checkout.cod')}
                </span>
                <span className={`text-[9px] font-medium ${paymentMethod === 'COD' ? 'text-amber-600 dark:text-amber-400' : 'text-gray-300 dark:text-gray-700'}`}>
                  {t('checkout.codPayWhen')}
                </span>
              </div>

              {/* UPI */}
              <div
                onClick={() => { setPaymentMethod('UPI'); setError(''); }}
                className={`cursor-pointer p-6 rounded-[2rem] border-2 transition-all duration-300 text-center flex flex-col items-center justify-center gap-2 ${
                  paymentMethod === 'UPI'
                    ? 'border-[#fbbc05] bg-amber-50/50 dark:bg-amber-400/10 shadow-xl shadow-amber-500/10'
                    : 'border-gray-50 dark:border-white/5 bg-gray-50 dark:bg-white/5 text-gray-400 dark:text-gray-600 hover:border-gray-100 dark:hover:border-white/10 hover:bg-white dark:hover:bg-white/10'
                }`}
              >
                <span className="text-2xl">📱</span>
                <span className={`text-[10px] font-black uppercase tracking-widest ${paymentMethod === 'UPI' ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-600'}`}>
                  {t('checkout.upi')}
                </span>
                <span className={`text-[9px] font-medium ${paymentMethod === 'UPI' ? 'text-amber-600 dark:text-amber-400' : 'text-gray-300 dark:text-gray-700'}`}>
                  {t('checkout.upiInstant')}
                </span>
              </div>

              {/* Credit/Debit Card */}
              <div
                onClick={() => { setPaymentMethod('CARD'); setError(''); }}
                className={`cursor-pointer p-6 rounded-[2rem] border-2 transition-all duration-300 text-center flex flex-col items-center justify-center gap-2 ${
                  paymentMethod === 'CARD'
                    ? 'border-[#fbbc05] bg-amber-50/50 dark:bg-amber-400/10 shadow-xl shadow-amber-500/10'
                    : 'border-gray-50 dark:border-white/5 bg-gray-50 dark:bg-white/5 text-gray-400 dark:text-gray-600 hover:border-gray-100 dark:hover:border-white/10 hover:bg-white dark:hover:bg-white/10'
                }`}
              >
                <span className="text-2xl">💳</span>
                <span className={`text-[10px] font-black uppercase tracking-widest ${paymentMethod === 'CARD' ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-600'}`}>
                  {t('checkout.card') || "Credit Card"}
                </span>
                <span className={`text-[9px] font-medium ${paymentMethod === 'CARD' ? 'text-amber-600 dark:text-amber-400' : 'text-gray-300 dark:text-gray-700'}`}>
                  {t('checkout.cardSecure') || "Secure Payment"}
                </span>
              </div>
            </div>
          </div>

          {/* Cash on Delivery Info Box */}
          {paymentMethod === 'COD' && (
            <div className="animate-in fade-in slide-in-from-top-2 duration-300 bg-amber-50/60 dark:bg-amber-400/5 border border-amber-100 dark:border-amber-400/10 rounded-[2rem] p-6 flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <span className="text-3xl">🏠</span>
                <div>
                  <p className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-wider">{t('checkout.codSelected')}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{t('checkout.codPayInCash', { total: discountedTotal.toFixed(2) })}</p>
                </div>
              </div>
              <div className="h-px bg-amber-100 dark:bg-amber-400/10" />
              <ul className="space-y-2">
                {[
                  t('checkout.codTip1'),
                  t('checkout.codTip2'),
                  t('checkout.codTip3'),
                ].map((tip) => (
                  <li key={tip} className="text-[11px] text-gray-500 dark:text-gray-400 font-medium">{tip}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Razorpay Online Payment Info Box */}
          {(paymentMethod === 'CARD' || paymentMethod === 'UPI') && (
            <div className="animate-in fade-in slide-in-from-top-2 duration-300 bg-gray-50/60 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-[2rem] p-6 flex flex-col gap-3">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-white dark:bg-[#1a1a1a] shadow-sm flex items-center justify-center border border-gray-100 dark:border-white/5">
                  <span className="text-2xl">🔒</span>
                </div>
                <div>
                  <p className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-wider">Secure Razorpay Checkout</p>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1 font-medium leading-relaxed">
                    You will be redirected to Razorpay's encrypted modal to complete your {paymentMethod === 'UPI' ? 'UPI' : 'Card'} transaction.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Order Summary */}
          <div className="bg-gray-50/50 dark:bg-white/5 border border-gray-100 dark:border-white/10 p-8 rounded-[2.5rem] space-y-4 shadow-inner">
            <div className="flex justify-between items-center text-[10px] text-gray-400 dark:text-gray-500 font-black uppercase tracking-[0.2em] px-1">
              <span>Final Settlement Total</span>
              <span className="text-gray-900 dark:text-white text-2xl font-black tracking-tighter">₹{discountedTotal.toFixed(2)}</span>
            </div>
            <div className="h-px bg-white/50 dark:bg-white/5"></div>
            <div className="flex justify-between text-[10px] text-gray-400 dark:text-gray-500 font-black uppercase tracking-widest px-1">
              <span>Batch Quantity</span>
              <span className="text-gray-900 dark:text-white">{cartItems.length} Products</span>
            </div>
            <div className="flex justify-between text-[10px] text-gray-400 dark:text-gray-500 font-black uppercase tracking-widest px-1">
              <span>Payment Mode</span>
              <span className="text-gray-900 dark:text-white">{paymentMethod === 'COD' ? 'Cash on Delivery' : 'UPI'}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-6">
            <button
              type="button"
              onClick={() => navigate('/buyer/cart')}
              className="flex-1 py-5 rounded-2xl border border-gray-100 dark:border-white/10 text-gray-400 dark:text-gray-500 font-black text-[10px] uppercase tracking-widest hover:text-gray-900 dark:hover:text-white hover:border-gray-900 dark:hover:border-white/20 transition-all active:scale-95 duration-300 shadow-sm"
            >
              ← ADJUST BASKET
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-[2] py-5 bg-gray-900 dark:bg-white text-white dark:text-black font-black text-[10px] uppercase tracking-[0.3em] rounded-2xl shadow-2xl shadow-gray-900/10 hover:bg-[#fbbc05] hover:shadow-amber-500/30 hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 active:scale-95 px-6"
            >
              {loading ? 'PROCESSING...' : 'AUTHORIZE SHIPMENT'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Checkout;
