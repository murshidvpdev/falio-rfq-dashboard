import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, User, UserPlus, Key, ArrowLeft } from 'lucide-react';

const Login = () => {
    const [view, setView] = useState('login'); // 'login' | 'register' | 'change-password'

    // Form States
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    // Change Password specific states
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const clearForm = () => {
        setError('');
        setSuccessMsg('');
        setPassword('');
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
    };

    const switchView = (newView) => {
        clearForm();
        setView(newView);
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        const formData = new URLSearchParams();
        formData.append('username', username);
        formData.append('password', password);

        try {
            const response = await fetch('http://localhost:8000/token', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: formData,
            });

            if (!response.ok) throw new Error('Invalid username or password');

            const data = await response.json();
            localStorage.setItem('token', data.access_token);
            navigate('/', { replace: true });
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            // Check if user exists check
            const checkResponse = await fetch(`http://localhost:8000/users/exists?username=${username}`);
            const checkData = await checkResponse.json();

            if (checkData.exists) {
                throw new Error('Username already taken');
            }

            const response = await fetch('http://localhost:8000/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.detail || 'Failed to create user');

            setSuccessMsg('Account created successfully! Please login.');
            switchView('login');
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        setError('');

        if (newPassword !== confirmPassword) {
            setError('New passwords do not match');
            return;
        }

        setIsLoading(true);

        try {
            // Check if user exists check
            const checkResponse = await fetch(`http://localhost:8000/users/exists?username=${username}`);
            const checkData = await checkResponse.json();

            if (!checkData.exists) {
                throw new Error('User not found');
            }

            // Step 1: Login to verify old credentials and get token
            const formData = new URLSearchParams();
            formData.append('username', username);
            formData.append('password', oldPassword);

            const loginResponse = await fetch('http://localhost:8000/token', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: formData,
            });

            if (!loginResponse.ok) throw new Error('Invalid old password');

            const loginData = await loginResponse.json();
            const token = loginData.access_token;

            // Step 2: Update password using the token
            const updateResponse = await fetch('http://localhost:8000/users/me/password', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    old_password: oldPassword,
                    new_password: newPassword
                }),
            });

            if (!updateResponse.ok) {
                const updateData = await updateResponse.json();
                throw new Error(updateData.detail || 'Failed to update password');
            }

            setSuccessMsg('Password updated successfully! Please login.');
            switchView('login');
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden">
                <div className="bg-blue-600 p-8 text-center">
                    <h1 className="text-3xl font-bold text-white mb-2">RFQ System</h1>
                    <p className="text-blue-100">
                        {view === 'login' && 'Please sign in to continue'}
                        {view === 'register' && 'Create a new account'}
                        {view === 'change-password' && 'Update your password'}
                    </p>
                </div>

                <div className="p-8">
                    {error && (
                        <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-6 text-sm font-medium">
                            {error}
                        </div>
                    )}
                    {successMsg && (
                        <div className="bg-green-50 text-green-700 p-3 rounded-lg mb-6 text-sm font-medium">
                            {successMsg}
                        </div>
                    )}

                    {view === 'login' && (
                        <form onSubmit={handleLogin} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Username</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                        <User size={18} />
                                    </div>
                                    <input
                                        type="text"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        className="pl-10 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                                        placeholder="Enter your username"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                        <Lock size={18} />
                                    </div>
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="pl-10 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                                        placeholder="Enter your password"
                                        required
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className={`w-full bg-blue-600 text-white rounded-lg py-3 font-semibold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/30 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                            >
                                {isLoading ? 'Signing in...' : 'Sign In'}
                            </button>

                            <div className="flex flex-col gap-3 pt-4 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => switchView('register')}
                                    className="text-sm text-slate-600 hover:text-blue-600 flex items-center justify-center gap-2 transition-colors"
                                >
                                    <UserPlus size={16} /> Create Account
                                </button>
                                <button
                                    type="button"
                                    onClick={() => switchView('change-password')}
                                    className="text-sm text-slate-600 hover:text-blue-600 flex items-center justify-center gap-2 transition-colors"
                                >
                                    <Key size={16} /> Change Password
                                </button>
                            </div>
                        </form>
                    )}

                    {view === 'register' && (
                        <form onSubmit={handleRegister} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">New Username</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                        <User size={18} />
                                    </div>
                                    <input
                                        type="text"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        className="pl-10 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                                        required
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">New Password</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                        <Lock size={18} />
                                    </div>
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="pl-10 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                                        required
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-blue-600 text-white rounded-lg py-3 font-semibold hover:bg-blue-700 transition-colors"
                            >
                                {isLoading ? 'Creating Account...' : 'Create Account'}
                            </button>

                            <button
                                type="button"
                                onClick={() => switchView('login')}
                                className="w-full text-slate-500 text-sm hover:text-slate-700 flex items-center justify-center gap-2"
                            >
                                <ArrowLeft size={16} /> Back to Login
                            </button>
                        </form>
                    )}

                    {view === 'change-password' && (
                        <form onSubmit={handleChangePassword} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Username</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                        <User size={18} />
                                    </div>
                                    <input
                                        type="text"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        className="pl-10 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                                        required
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Old Password</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                        <Lock size={18} />
                                    </div>
                                    <input
                                        type="password"
                                        value={oldPassword}
                                        onChange={(e) => setOldPassword(e.target.value)}
                                        className="pl-10 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                                        required
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">New Password</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                        <Key size={18} />
                                    </div>
                                    <input
                                        type="password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        className="pl-10 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                                        required
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Confirm New Password</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                        <Key size={18} />
                                    </div>
                                    <input
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="pl-10 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                                        required
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-blue-600 text-white rounded-lg py-3 font-semibold hover:bg-blue-700 transition-colors"
                            >
                                {isLoading ? 'Updating...' : 'Update Password'}
                            </button>

                            <button
                                type="button"
                                onClick={() => switchView('login')}
                                className="w-full text-slate-500 text-sm hover:text-slate-700 flex items-center justify-center gap-2"
                            >
                                <ArrowLeft size={16} /> Back to Login
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Login;
