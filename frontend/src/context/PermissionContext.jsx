import React, { createContext, useState, useCallback, useEffect } from 'react';
import { API_BASE } from '../config';

export const PermissionContext = createContext(null);

export const PermissionProvider = ({ children }) => {
    const [permissions, setPermissions] = useState(new Set());
    const [roles, setRoles] = useState([]);
    const [isSuperAdmin, setIsSuperAdmin] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);

    const loadPermissions = useCallback(async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            setPermissions(new Set());
            setRoles([]);
            setIsSuperAdmin(false);
            setIsLoaded(true);
            return;
        }
        try {
            const res = await fetch(`${API_BASE}/users/me/permissions`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) {
                // Token invalid — clear it
                if (res.status === 401) localStorage.removeItem('token');
                setIsLoaded(true);
                return;
            }
            const data = await res.json();
            setIsSuperAdmin(data.is_superuser);
            setRoles(data.roles ?? []);
            // Super Admin gets '*' — store as special sentinel
            setPermissions(new Set(data.permissions ?? []));
        } catch {
            // Network error — keep stale state
        } finally {
            setIsLoaded(true);
        }
    }, []);

    // Load on mount if token exists
    useEffect(() => { loadPermissions(); }, [loadPermissions]);

    const hasPermission = useCallback(
        (slug) => isSuperAdmin || permissions.has('*') || permissions.has(slug),
        [isSuperAdmin, permissions]
    );

    const hasRole = useCallback(
        (slug) => isSuperAdmin || roles.includes(slug),
        [isSuperAdmin, roles]
    );

    const hasAnyPermission = useCallback(
        (slugs) => slugs.some(s => hasPermission(s)),
        [hasPermission]
    );

    const clearPermissions = useCallback(() => {
        setPermissions(new Set());
        setRoles([]);
        setIsSuperAdmin(false);
        setIsLoaded(false);
    }, []);

    return (
        <PermissionContext.Provider value={{
            permissions,
            roles,
            isSuperAdmin,
            isLoaded,
            hasPermission,
            hasRole,
            hasAnyPermission,
            loadPermissions,
            clearPermissions,
        }}>
            {children}
        </PermissionContext.Provider>
    );
};
