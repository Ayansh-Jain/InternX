/**
 * Protected Route component for role-based access control.
 */

import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

// Loading spinner component
const LoadingSpinner = () => (
    <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: '#F9FAFB'
    }}>
        <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid #E5E7EB',
            borderTop: '4px solid #3A4B41',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
        }} />
        <style>{`
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        `}</style>
    </div>
);

/**
 * ProtectedRoute - Protects routes that require authentication.
 * @param {ReactNode} children - The component to render if authorized
 * @param {string[]} allowedRoles - Array of roles that can access this route
 * @param {string} redirectTo - Where to redirect if not authorized
 */
export const ProtectedRoute = ({
    children,
    allowedRoles = [],
    redirectTo = '/signin'
}) => {
    const { user, loading, isAuthenticated } = useAuth();
    const location = useLocation();

    // Show loading while checking auth
    if (loading) {
        return <LoadingSpinner />;
    }

    // Not authenticated - redirect to signin
    if (!isAuthenticated) {
        return <Navigate to={redirectTo} state={{ from: location }} replace />;
    }

    // Check role access
    if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
        // User is authenticated but not authorized for this route
        // Redirect to their dashboard
        const dashboardPath = {
            'ADMIN': '/admin',
            'JOB_PROVIDER': '/provider',
            'JOB_SEARCHER': '/searcher'
        }[user.role] || '/';

        return <Navigate to={dashboardPath} replace />;
    }

    return children;
};

/**
 * PublicRoute - For routes that should redirect authenticated users.
 * Used for signin/signup pages.
 */
export const PublicRoute = ({ children }) => {
    const { user, loading, isAuthenticated, getRedirectPath } = useAuth();

    if (loading) {
        return <LoadingSpinner />;
    }

    // Already authenticated - redirect to dashboard
    if (isAuthenticated) {
        return <Navigate to={getRedirectPath()} replace />;
    }

    return children;
};

/**
 * RoleRedirect - Redirects to appropriate dashboard based on role.
 */
export const RoleRedirect = () => {
    const { user, loading, isAuthenticated, getRedirectPath } = useAuth();

    if (loading) {
        return <LoadingSpinner />;
    }

    if (!isAuthenticated) {
        return <Navigate to="/signin" replace />;
    }

    return <Navigate to={getRedirectPath()} replace />;
};

export default ProtectedRoute;
