import React from 'react';
import { Menu, Bell } from 'lucide-react';

const Header = ({ title, onToggleSidebar, extraAction, showMenuButton = true }) => {
    return (
        <header className="bg-white border-b border-slate-200 py-4 px-8 sticky top-0 z-10 transition-all duration-300 grid grid-cols-3 items-center">
            {/* Left Section: Toggle & Logo */}
            <div className="flex items-center gap-4 justify-start">
                {showMenuButton && (
                    <button
                        onClick={onToggleSidebar}
                        className="p-2 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors"
                    >
                        <Menu size={24} />
                    </button>
                )}
                <img
                    src="/falio-logo-black.png"
                    alt="Falio Logo"
                    className="w-20 h-20 object-contain"
                />
            </div>

            {/* Center Section: Title */}
            <div className="flex justify-center">
                <h1 className="text-2xl font-bold text-slate-800">{title}</h1>
            </div>

            {/* Right Section: Actions */}
            <div className="flex items-center gap-6 justify-end">
                <button className="relative p-2 text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
                    <Bell size={24} />
                    <span className="absolute top-1 right-1 h-3 w-3 bg-red-500 rounded-full border-2 border-white"></span>
                </button>
                {extraAction && (
                    <div>
                        {extraAction}
                    </div>
                )}
            </div>
        </header>
    );
};

export default Header;
