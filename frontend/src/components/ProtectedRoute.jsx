import React from 'react';
import { Navigate } from 'react-router-dom';
import { usePermissions } from '../hooks/usePermissions';

/**
 * Wraps a route requiring authentication.
 * Optional `permission` prop redirects to /unauthorized if the user lacks it.
 * Backend is always the authoritative source; this check is UX-only.
 */
const ProtectedRoute = ({ children, permission }) => {
    const token = localStorage.getItem('token');
    const { hasPermission, isLoaded } = usePermissions();

    if (!token) return <Navigate to="/login" replace />;
    if (!isLoaded) return null;  // Wait for permissions to load

    if (permission && !hasPermission(permission)) {
        return <Navigate to="/unauthorized" replace />;
    }

    return children;
};

export default ProtectedRoute;
