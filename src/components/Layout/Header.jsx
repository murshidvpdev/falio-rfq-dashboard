import React from 'react';
import { Menu } from 'lucide-react';

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
            <div className="flex gap-4">
                {/* Actions or Notifications could go here */}
            </div>
        </header>
    );
};

export default Header;
