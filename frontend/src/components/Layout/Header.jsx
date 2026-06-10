import React from 'react';
import { Menu, Bell } from 'lucide-react';

const Header = ({ title, onToggleSidebar, extraAction, showMenuButton = true }) => {
    return (
        <header className="bg-blue-950 border-b border-blue-900 py-4 px-8 sticky top-0 z-10 transition-all duration-300 grid grid-cols-3 items-center">
            {/* Left Section: Toggle & Logo */}
            <div className="flex items-center gap-4 justify-start">
                {showMenuButton && (
                    <button
                        onClick={onToggleSidebar}
                        className="p-2 hover:bg-white/10 rounded-lg text-blue-200 hover:text-white transition-colors"
                    >
                        <Menu size={24} />
                    </button>
                )}
                <img
                    src="/falio-logo-black.png"
                    alt="Falio Logo"
                    className="w-20 h-20 object-contain brightness-0 invert"
                />
            </div>

            {/* Center Section: Title */}
            <div className="flex justify-center">
                <h1 className="text-2xl font-bold text-white">{title}</h1>
            </div>

            {/* Right Section: Actions */}
            <div className="flex items-center gap-6 justify-end">
                <button className="relative p-2 text-blue-200 hover:bg-white/10 hover:text-white rounded-full transition-colors">
                    <Bell size={24} />
                    <span className="absolute top-1 right-1 h-3 w-3 bg-red-500 rounded-full border-2 border-blue-950"></span>
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
