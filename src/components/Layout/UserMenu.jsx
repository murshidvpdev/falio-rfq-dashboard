import React, { useState } from 'react';
import { User, LogOut, UserCog } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import UserManagementModal from '../Dashboard/UserManagementModal';

const UserMenu = ({ user }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isUserModalOpen, setIsUserModalOpen] = useState(false);
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="flex items-center gap-2 text-slate-600 hover:bg-slate-100 px-3 py-2 rounded-lg transition-colors"
            >
                <span className="bg-blue-100 text-blue-600 p-1.5 rounded-full">
                    <User size={20} />
                </span>
                <span className="font-medium text-sm">{user?.username || 'Admin'}</span>
            </button>

            {isMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 py-1 z-50">
                    <button
                        onClick={() => {
                            setIsUserModalOpen(true);
                            setIsMenuOpen(false);
                        }}
                        className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                    >
                        <UserCog size={16} /> Change Password
                    </button>
                    <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                    >
                        <LogOut size={16} /> Logout
                    </button>
                </div>
            )}

            <UserManagementModal
                isOpen={isUserModalOpen}
                onClose={() => setIsUserModalOpen(false)}
                initialTab="password"
            />
        </div>
    );
};

export default UserMenu;
