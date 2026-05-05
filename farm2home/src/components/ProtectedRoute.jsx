import { useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';
import { selectCurrentToken, selectCurrentUser } from '../redux/slices/authSlice';

const ProtectedRoute = ({ children, allowedRoles }) => {
    const token = useSelector(selectCurrentToken);
    const user = useSelector(selectCurrentUser);
    const location = useLocation();

    // If not logged in, redirect to login page but save the attempted URL
    if (!token) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // If roles are specified and user doesn't match, redirect to their home portal
    if (allowedRoles && (!user || !allowedRoles.includes(user.role))) {
        const portalMap = {
            admin: '/admin-portal',
            farmer: '/farmer-portal',
            buyer: '/buyer-portal',
            delivery: '/delivery-portal'
        };
        
        const redirectPath = portalMap[user?.role] || '/';
        return <Navigate to={redirectPath} replace />;
    }

    return children;
};

export default ProtectedRoute;
