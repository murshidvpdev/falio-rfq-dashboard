import React from 'react';
import { LayoutDashboard, Settings, PieChart, Users, FileText, User as UserIcon, Shield, ShieldCheck } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { usePermissions } from '../../hooks/usePermissions';

const NAV_ITEMS = [
    { icon: FileText,      label: 'File Processed', path: '/',              permission: null },
    { icon: LayoutDashboard,label: 'Dashboard',    path: '/dashboard',      permission: 'dashboard.view' },
    { icon: PieChart,      label: 'Analytics',     path: '#',               permission: 'dashboard.analytics' },
    // Admin section
    { icon: Users,         label: 'Users',          path: '/admin/users',   permission: 'users.view',  section: 'Admin' },
    { icon: Shield,        label: 'Roles',          path: '/admin/roles',   permission: 'roles.view',  section: 'Admin' },
    { icon: ShieldCheck,   label: 'Permissions',    path: '/admin/permissions', permission: 'permissions.view', section: 'Admin' },
    // Settings
    { icon: Settings,      label: 'Settings',       path: '#',              permission: 'settings.manage' },
];

const Sidebar = ({ isOpen, user }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { hasPermission } = usePermissions();

    const visible = NAV_ITEMS.filter(item =>
        item.permission === null || hasPermission(item.permission)
    );

    // Group by section
    const main  = visible.filter(i => !i.section);
    const admin = visible.filter(i => i.section === 'Admin');
    const other = visible.filter(i => i.section && i.section !== 'Admin');

    const NavItem = ({ item }) => {
        const active = location.pathname === item.path;
        return (
            <button
                onClick={() => item.path !== '#' && navigate(item.path)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    active
                        ? 'bg-blue-50 text-blue-600'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
            >
                <item.icon size={18} className="flex-shrink-0" />
                <span className="whitespace-nowrap">{item.label}</span>
            </button>
        );
    };

    return (
        <div className={`fixed left-0 top-0 h-screen bg-white border-r border-slate-200 flex flex-col z-20 w-64 transition-transform duration-500 ease-in-out shadow-2xl ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>

            {/* Logo */}
            <div className="p-6 border-b border-slate-100 flex items-center gap-3 justify-center">
                <img src="/falio-logo-black.png" alt="Falio" className="h-8 w-auto" />
                <span className="font-bold text-xl text-slate-800 tracking-tight">Falio</span>
            </div>

            <nav className="flex-1 p-4 space-y-1 overflow-y-auto overflow-x-hidden">
                {/* Main nav */}
                {main.map(item => <NavItem key={item.path} item={item} />)}

                {/* Admin section */}
                {admin.length > 0 && (
                    <>
                        <div className="pt-4 pb-1 px-4">
                            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Admin</p>
                        </div>
                        {admin.map(item => <NavItem key={item.path} item={item} />)}
                    </>
                )}

                {/* Other sections */}
                {other.map(item => <NavItem key={item.path} item={item} />)}
            </nav>

            {/* User footer */}
            <div className="p-4 border-t border-slate-100 overflow-x-hidden">
                <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 cursor-pointer">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex-shrink-0 flex items-center justify-center text-blue-600 text-sm font-bold">
                        {user?.username?.[0]?.toUpperCase() ?? <UserIcon size={16} />}
                    </div>
                    <div className="overflow-hidden">
                        <p className="text-sm font-medium text-slate-700 truncate">{user?.username ?? 'User'}</p>
                        <p className="text-xs text-slate-400 truncate">{user?.roles?.[0] ?? user?.role ?? 'Member'}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;
