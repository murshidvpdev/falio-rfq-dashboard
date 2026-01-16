import React from 'react';
import { LayoutDashboard, Settings, PieChart, Users, FileText, User as UserIcon } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const Sidebar = ({ isOpen, user }) => {
    const navigate = useNavigate();
    const location = useLocation();

    const menuItems = [
        { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
        { icon: FileText, label: "File Processed", path: "/" },
        { icon: Users, label: "Accounts", path: "#" },
        { icon: PieChart, label: "Analytics", path: "#" },
        { icon: Settings, label: "Settings", path: "#" },
    ];

    return (
        <div className={`fixed left-0 top-0 h-screen bg-white border-r border-slate-200 flex flex-col z-20 w-64 transition-transform duration-500 ease-in-out shadow-2xl ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
            <div className="p-6 border-b border-slate-100 flex items-center gap-3 justify-center">
                <img src="/falio-logo-black.png" alt="Falio" className="h-8 w-auto" />
                <span className="font-bold text-xl text-slate-800 tracking-tight">Falio</span>
            </div>

            <nav className="flex-1 p-4 space-y-1 overflow-x-hidden">
                {menuItems.map((item, index) => (
                    <button
                        key={index}
                        onClick={() => navigate(item.path)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${location.pathname === item.path
                            ? 'bg-blue-50 text-blue-600'
                            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                            }`}
                    >
                        <item.icon size={20} className="flex-shrink-0" />
                        <span className="whitespace-nowrap">{item.label}</span>
                    </button>
                ))}
            </nav>

            <div className="p-4 border-t border-slate-100 overflow-x-hidden">
                <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 cursor-pointer">
                    <div className="w-8 h-8 rounded-full bg-slate-200 flex-shrink-0 flex items-center justify-center text-slate-500">
                        <UserIcon size={20} />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-slate-700">{user?.username || 'User'}</p>
                        <p className="text-xs text-slate-500">{user?.role || 'Admin'}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;
