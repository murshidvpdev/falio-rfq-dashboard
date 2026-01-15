import React from 'react';
import { Menu, Bell } from 'lucide-react';

const Header = ({ title, onToggleSidebar }) => {
    return (
        <header className="bg-white border-b border-slate-200 py-4 px-8 flex justify-between items-center sticky top-0 z-10 transition-all duration-300">
            <div className="flex items-center gap-4">
                <button
                    onClick={onToggleSidebar}
                    className="p-2 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors"
                >
                    <Menu size={24} />
                </button>
                <h1 className="text-2xl font-bold text-slate-800">{title}</h1>
            </div>
            <div className="flex items-center gap-6">
                <button className="relative p-2 text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
                    <Bell size={24} />
                    <span className="absolute top-1 right-1 h-3 w-3 bg-red-500 rounded-full border-2 border-white"></span>
                </button>
                <img
                    src="/marvel_logo.png"
                    alt="Marvel Logo"
                    className="w-20 h-20 object-contain brightness-0"
                />
            </div>
        </header>
    );
};

export default Header;
