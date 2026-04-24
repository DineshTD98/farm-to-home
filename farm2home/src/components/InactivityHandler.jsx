import { useEffect, useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout, selectCurrentToken, selectUserRole } from '../redux/slices/authSlice';

const CHECK_INTERVAL = 30000; // Check every 30 seconds
const LAST_ACTIVITY_KEY = 'lastActivity';

// Timeouts in milliseconds
const TIMEOUTS = {
  ADMIN: 10 * 60 * 1000,   // 10 minutes
  DEFAULT: 60 * 60 * 1000  // 60 minutes (1 hour)
};

const InactivityHandler = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const token = useSelector(selectCurrentToken);
  const role = useSelector(selectUserRole);

  const inactivityTimeout = useMemo(() => {
    return role === 'admin' ? TIMEOUTS.ADMIN : TIMEOUTS.DEFAULT;
  }, [role]);

  const performLogout = useCallback(() => {
    dispatch(logout());
    sessionStorage.removeItem(LAST_ACTIVITY_KEY);
    navigate('/login');
  }, [dispatch, navigate]);

  const updateLastActivity = useCallback(() => {
    sessionStorage.setItem(LAST_ACTIVITY_KEY, Date.now().toString());
  }, []);

  useEffect(() => {
    if (!token) return;

    // Initial check on mount
    const lastActivity = sessionStorage.getItem(LAST_ACTIVITY_KEY);
    if (lastActivity) {
      const elapsed = Date.now() - parseInt(lastActivity, 10);
      if (elapsed > inactivityTimeout) {
        performLogout();
        return;
      }
    } else {
      updateLastActivity();
    }

    // Set up activity listeners
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    const handleActivity = () => {
      updateLastActivity();
    };

    events.forEach(event => window.addEventListener(event, handleActivity));

    // Periodic check for inactivity
    const interval = setInterval(() => {
      const lastActivityTime = sessionStorage.getItem(LAST_ACTIVITY_KEY);
      if (lastActivityTime) {
        const elapsedSinceLast = Date.now() - parseInt(lastActivityTime, 10);
        if (elapsedSinceLast > inactivityTimeout) {
          performLogout();
        }
      }
    }, CHECK_INTERVAL);

    return () => {
      events.forEach(event => window.removeEventListener(event, handleActivity));
      clearInterval(interval);
    };
  }, [token, inactivityTimeout, performLogout, updateLastActivity]);

  return null;
};

export default InactivityHandler;
