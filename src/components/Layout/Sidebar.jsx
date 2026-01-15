import React from 'react';
import { LayoutDashboard, Settings, PieChart, Users, FileText } from 'lucide-react';

const Sidebar = ({ isOpen }) => {
    const menuItems = [
        { icon: LayoutDashboard, label: "Dashboard", active: true },
        { icon: FileText, label: "RFQs", active: false },
        { icon: Users, label: "Accounts", active: false },
        { icon: PieChart, label: "Analytics", active: false },
        { icon: Settings, label: "Settings", active: false },
    ];

    return (
        <div className={`fixed left-0 top-0 h-screen bg-white border-r border-slate-200 flex flex-col z-20 w-64 transition-transform duration-500 ease-in-out shadow-2xl ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
            <div className="p-6 border-b border-slate-100 flex items-center gap-3">
                <img
                    src="/marvel_logo.png"
                    alt="Marvel Logo"
                    className="w-20 h-20 object-contain flex-shrink-0 brightness-0"
                />
            </div>

            <nav className="flex-1 p-4 space-y-1 overflow-x-hidden">
                {menuItems.map((item, index) => (
                    <button
                        key={index}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${item.active
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
                    <div className="w-8 h-8 rounded-full bg-slate-200 flex-shrink-0"></div>
                    <div>
                        <p className="text-sm font-medium text-slate-700">User Profile</p>
                        <p className="text-xs text-slate-500">Admin</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;
