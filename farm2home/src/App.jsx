import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectCurrentToken, selectCurrentUser } from './redux/slices/authSlice';
import InactivityHandler from './components/InactivityHandler';
import OneSignal from 'react-onesignal';
import { useEffect } from 'react';
import Footer from './components/Footer';
import { ThemeProvider } from './context/ThemeContext';
import { Toaster } from 'react-hot-toast';
import { useDispatch } from 'react-redux';
import { setUnreadCount } from './redux/slices/chatSlice';
import { getUnreadMessagesCount } from './api/chat';
import './index.css';

import LandingPage from './pages/LandingPage';
import SignupPage from './pages/SignupPage';
import LoginPage from './pages/LoginPage';
import Portal from './pages/portals/Portal';
import ProductList from './pages/farmer/ProductList';
import AddProduct from './pages/farmer/AddProduct';
import EditProduct from './pages/farmer/EditProduct';
import BrowseProducts from './pages/buyer/BrowseProducts';
import Cart from './pages/buyer/Cart';
import Checkout from './pages/buyer/Checkout';
import OrderSuccess from './pages/buyer/OrderSuccess';
import BuyerOrders from './pages/buyer/BuyerOrders';
import Notifications from './pages/buyer/Notifications';
import FarmerOrders from './pages/farmer/FarmerOrders';
import FarmerAnalytics from './pages/farmer/FarmerAnalytics';
import FarmerEarnings from './pages/farmer/FarmerEarnings';
import FarmerSettings from './pages/farmer/FarmerSettings';
import FarmerReviews from './pages/farmer/FarmerReviews';
import BuyerSettings from './pages/buyer/BuyerSettings';
import BuyerReviews from './pages/buyer/BuyerReviews';
import FarmerFeed from './pages/farmer/FarmerFeed';
import FarmerProfile from './pages/farmer/FarmerProfile';
import ChatInbox from './pages/shared/ChatInbox';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

import ComingSoon from './pages/shared/ComingSoon';
import TermsOfUse from './pages/TermsOfUse';
import PrivacyPolicy from './pages/PrivacyPolicy';
import FAQ from './pages/FAQ';

import AdminDashboard from './pages/admin/AdminDashboard';
import Orders from './pages/admin/Orders';
import Users from './pages/admin/Users';
import Payouts from './pages/admin/Payouts';
import ProtectedRoute from './components/ProtectedRoute';

// Helper for placeholder routes
const Placeholder = ({ name, back }) => (
  <ProtectedRoute allowedRoles={['admin', 'farmer', 'buyer', 'delivery']}>
    <ComingSoon featureName={name} backLink={back} />
  </ProtectedRoute>
);

// Component to handle scrolling to top on route change
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

// Component to handle conditional footer rendering
const ConditionalFooter = () => {
  const location = useLocation();
  const excludedPaths = ['/login', '/signup', '/buyer/cart', '/buyer/order-success', '/forgot-password', '/reset-password'];
  
  if (excludedPaths.includes(location.pathname) || location.pathname.startsWith('/reset-password')) {
    return null;
  }
  
  return <Footer />;
};

function App() {
  const user = useSelector(selectCurrentUser);

  useEffect(() => {
    const syncOneSignal = async () => {
      // Safety check: ensure OneSignal is available
      if (!OneSignal) return;

      if (user && user._id) {
        try {
          const externalId = String(user._id);
          console.log('[OneSignal] Syncing user:', externalId);
          
          await OneSignal.login(externalId);
// testing for the github
          if (user.phone) {
            console.log('[OneSignal] Syncing SMS:', user.phone);
            await OneSignal.User.addSms(String(user.phone));
          }
        } catch (error) {
          // If we hit a 400 or other error, log it but don't crash
          console.warn('[OneSignal] Non-fatal sync issue:', error);
        }
      } else {
        try {
          // Only logout if we're not already unauthenticated to avoid redundant calls
          console.log('[OneSignal] User logged out, cleaning session');
          await OneSignal.logout();
        } catch (error) {
          console.error('[OneSignal] Logout Error:', error);
        }
      }
    };

    syncOneSignal();
  }, [user]);

  const dispatch = useDispatch();

  useEffect(() => {
    if (!user || (!user.id && !user._id)) {
      dispatch(setUnreadCount(0));
      return;
    }

    const fetchUnread = async () => {
      try {
        const uid = user.id || user._id;
        const { count } = await getUnreadMessagesCount(uid);
        dispatch(setUnreadCount(count));
      } catch (err) {
        console.warn('Error fetching unread count:', err);
      }
    };

    fetchUnread();
    const interval = setInterval(fetchUnread, 15000); // Poll every 15s
    return () => clearInterval(interval);
  }, [user, dispatch]);

  return (
    <ThemeProvider>
      <BrowserRouter>
        <ScrollToTop />
        <InactivityHandler />
        <Routes>
          {/* ... existing routes ... */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/terms" element={<TermsOfUse />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/faq" element={<FAQ />} />

          <Route path="/farmer-portal"   element={<ProtectedRoute allowedRoles={['farmer']}><Portal role="farmer" /></ProtectedRoute>} />
          <Route path="/farmer/products" element={<ProtectedRoute allowedRoles={['farmer']}><ProductList /></ProtectedRoute>} />
          <Route path="/farmer/add-product" element={<ProtectedRoute allowedRoles={['farmer']}><AddProduct /></ProtectedRoute>} />
          <Route path="/farmer/edit-product/:id" element={<ProtectedRoute allowedRoles={['farmer']}><EditProduct /></ProtectedRoute>} />
          <Route path="/farmer/orders" element={<ProtectedRoute allowedRoles={['farmer']}><FarmerOrders /></ProtectedRoute>} />
          <Route path="/farmer/earnings" element={<ProtectedRoute allowedRoles={['farmer']}><FarmerEarnings /></ProtectedRoute>} />
          <Route path="/farmer/analytics" element={<ProtectedRoute allowedRoles={['farmer']}><FarmerAnalytics /></ProtectedRoute>} />
          <Route path="/farmer/reviews" element={<ProtectedRoute allowedRoles={['farmer']}><FarmerReviews /></ProtectedRoute>} />
          <Route path="/farmer/settings" element={<ProtectedRoute allowedRoles={['farmer']}><FarmerSettings /></ProtectedRoute>} />
          <Route path="/farmer/feed" element={<ProtectedRoute allowedRoles={['farmer']}><FarmerFeed /></ProtectedRoute>} />
          <Route path="/farmer/profile" element={<ProtectedRoute allowedRoles={['farmer']}><FarmerProfile /></ProtectedRoute>} />
          <Route path="/farmer/messages" element={<ProtectedRoute allowedRoles={['farmer']}><ChatInbox /></ProtectedRoute>} />
          <Route path="/farmer/notifications" element={<ProtectedRoute allowedRoles={['farmer']}><Notifications /></ProtectedRoute>} />
          
          <Route path="/buyer-portal"    element={<ProtectedRoute allowedRoles={['buyer']}><Portal role="buyer" /></ProtectedRoute>} />
          <Route path="/buyer/browse"    element={<ProtectedRoute allowedRoles={['buyer']}><BrowseProducts /></ProtectedRoute>} />
          <Route path="/buyer/cart"    element={<ProtectedRoute allowedRoles={['buyer']}><Cart /></ProtectedRoute>} />
          <Route path="/buyer/checkout"    element={<ProtectedRoute allowedRoles={['buyer']}><Checkout /></ProtectedRoute>} />
          <Route path="/buyer/orders"    element={<ProtectedRoute allowedRoles={['buyer']}><BuyerOrders /></ProtectedRoute>} />
          <Route path="/buyer/reviews"    element={<ProtectedRoute allowedRoles={['buyer']}><BuyerReviews /></ProtectedRoute>} />
          <Route path="/buyer/notifications"    element={<ProtectedRoute allowedRoles={['buyer']}><Notifications /></ProtectedRoute>} />
          <Route path="/buyer/settings"    element={<ProtectedRoute allowedRoles={['buyer']}><BuyerSettings /></ProtectedRoute>} />
          <Route path="/buyer/messages"    element={<ProtectedRoute allowedRoles={['buyer']}><ChatInbox /></ProtectedRoute>} />
          <Route path="/buyer/order-success"    element={<ProtectedRoute allowedRoles={['buyer']}><OrderSuccess /></ProtectedRoute>} />
          <Route path="/buyer/payments"    element={<Placeholder name="Payments" back="/buyer-portal" />} />

          <Route path="/delivery-portal" element={<ProtectedRoute allowedRoles={['delivery']}><Portal role="delivery" /></ProtectedRoute>} />
          <Route path="/delivery/:id" element={<Placeholder name="Delivery Service" back="/delivery-portal" />} />

          <Route path="/admin-portal"    element={<ProtectedRoute allowedRoles={['admin']}><Portal role="admin" /></ProtectedRoute>} />
          <Route path="/admin/analytics" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/orders" element={<ProtectedRoute allowedRoles={['admin']}><Orders /></ProtectedRoute>} />
          <Route path="/admin/users" element={<ProtectedRoute allowedRoles={['admin']}><Users /></ProtectedRoute>} />
          <Route path="/admin/payments" element={<ProtectedRoute allowedRoles={['admin']}><Payouts /></ProtectedRoute>} />
          <Route path="/admin/:id" element={<Placeholder name="Admin Control" back="/admin-portal" />} />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <Toaster position="bottom-right" reverseOrder={false} />
        <ConditionalFooter />
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
