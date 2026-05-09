import React from 'react';
import { usePermissions } from '../../hooks/usePermissions';

/**
 * Conditionally renders children based on permissions or roles.
 *
 * <PermissionGate permission="users.view">
 *   <UsersTable />
 * </PermissionGate>
 *
 * <PermissionGate role="admin" fallback={<p>No access</p>}>
 *   <AdminPanel />
 * </PermissionGate>
 *
 * <PermissionGate anyPermission={['data.approve', 'data.reject']}>
 *   <ApprovalButtons />
 * </PermissionGate>
 */
const PermissionGate = ({
    permission,
    role,
    anyPermission,
    fallback = null,
    children,
}) => {
    const { hasPermission, hasRole, hasAnyPermission } = usePermissions();

    if (permission && !hasPermission(permission))  return fallback;
    if (role && !hasRole(role))                     return fallback;
    if (anyPermission && !hasAnyPermission(anyPermission)) return fallback;

    return children;
};

export default PermissionGate;
