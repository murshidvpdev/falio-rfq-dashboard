import { useContext } from 'react';
import { PermissionContext } from '../context/permission-context';

/**
 * Hook for permission checks throughout the app.
 *
 * const { hasPermission, hasRole, isSuperAdmin } = usePermissions();
 * if (hasPermission('users.view')) { ... }
 */
export const usePermissions = () => {
    const ctx = useContext(PermissionContext);
    if (!ctx) throw new Error('usePermissions must be used inside <PermissionProvider>');
    return ctx;
};
