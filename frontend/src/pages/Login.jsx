import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, User, UserPlus, Key, ArrowLeft, Loader2, ChevronRight, Mail } from 'lucide-react';
import { API_BASE } from '../config';
import { motion, AnimatePresence } from 'framer-motion';

const Login = () => {
    const [view, setView] = useState('login'); // 'login' | 'register' | 'change-password'

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
            const response = await fetch(`${API_BASE}/token`, {
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
            const checkResponse = await fetch(`${API_BASE}/users/exists?username=${username}`);
            const checkData = await checkResponse.json();

            if (checkData.exists) {
                throw new Error('Username already taken');
            }

            const response = await fetch(`${API_BASE}/users`, {
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
            const checkResponse = await fetch(`${API_BASE}/users/exists?username=${username}`);
            const checkData = await checkResponse.json();

            if (!checkData.exists) {
                throw new Error('User not found');
            }

            const formData = new URLSearchParams();
            formData.append('username', username);
            formData.append('password', oldPassword);

            const loginResponse = await fetch(`${API_BASE}/token`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: formData,
            });

            if (!loginResponse.ok) throw new Error('Invalid old password');

            const loginData = await loginResponse.json();
            const token = loginData.access_token;

            const updateResponse = await fetch(`${API_BASE}/users/me/password`, {
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
        <div className="min-h-screen flex items-center justify-center relative bg-slate-900 overflow-hidden font-sans">
            {/* Unified Abstract Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 z-0"></div>
            <div className="absolute inset-0 opacity-20 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] z-0"></div>

            <motion.div
                animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.3, 0.5, 0.3]
                }}
                transition={{ duration: 8, repeat: Infinity }}
                className="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] bg-blue-600/20 rounded-full blur-[120px]"
            ></motion.div>
            <motion.div
                animate={{
                    scale: [1, 1.1, 1],
                    opacity: [0.3, 0.5, 0.3]
                }}
                transition={{ duration: 10, repeat: Infinity, delay: 1 }}
                className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[100px]"
            ></motion.div>

            {/* Glassmorphic Container */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="relative z-10 w-full max-w-md mx-4"
            >
                <div className="backdrop-blur-xl bg-white/5 border border-white/10 shadow-2xl rounded-3xl overflow-hidden">
                    {/* Header */}
                    {/* Header */}
                    <div className="p-8 pb-0 text-center">
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="inline-block relative mb-4"
                        >
                            {/* Enhanced Glow */}
                            <div className="absolute inset-0 bg-blue-500/30 blur-3xl rounded-full scale-150"></div>
                            <img
                                src="/falio-logo.png"
                                alt="Falio"
                                className="w-56 relative z-10 drop-shadow-2xl brightness-0 invert"
                            />
                        </motion.div>

                        <h2 className="text-2xl font-bold text-white mb-2">
                            {view === 'login' && 'Welcome Back'}
                            {view === 'register' && 'Join Falio'}
                            {view === 'change-password' && 'Secure Access'}
                        </h2>
                        <p className="text-slate-400 text-sm">
                            {view === 'login' && 'Enter your credentials to access the workspace'}
                            {view === 'register' && 'Create your new account to get started'}
                            {view === 'change-password' && 'Update your password'}
                        </p>
                    </div>

                    <div className="p-8">
                        <AnimatePresence mode="wait">
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="bg-red-500/10 text-red-200 p-3 rounded-xl mb-6 text-sm font-medium border border-red-500/20 flex items-center gap-2"
                                >
                                    <span className="w-1.5 h-1.5 bg-red-400 rounded-full"></span>
                                    {error}
                                </motion.div>
                            )}
                            {successMsg && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="bg-emerald-500/10 text-emerald-200 p-3 rounded-xl mb-6 text-sm font-medium border border-emerald-500/20 flex items-center gap-2"
                                >
                                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></span>
                                    {successMsg}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {view === 'login' && (
                            <motion.form
                                key="login-form"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                onSubmit={handleLogin}
                                className="space-y-4"
                            >
                                <div className="space-y-4">
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-white transition-colors">
                                            <User size={18} />
                                        </div>
                                        <input
                                            type="text"
                                            value={username}
                                            onChange={(e) => setUsername(e.target.value)}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pl-11 text-white placeholder-slate-500 outline-none focus:bg-white/10 focus:border-white/20 transition-all text-sm"
                                            placeholder="Username"
                                            required
                                        />
                                    </div>

                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-white transition-colors">
                                            <Lock size={18} />
                                        </div>
                                        <input
                                            type="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pl-11 text-white placeholder-slate-500 outline-none focus:bg-white/10 focus:border-white/20 transition-all text-sm"
                                            placeholder="Password"
                                            required
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className={`
                                        w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl py-3.5 font-semibold hover:from-blue-500 hover:to-indigo-500 transition-all 
                                        shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 mt-2
                                        ${isLoading ? 'opacity-80 cursor-wait' : 'hover:scale-[1.02] active:scale-[0.98]'}
                                    `}
                                >
                                    {isLoading ? <Loader2 size={20} className="animate-spin" /> : <>Sign In <ChevronRight size={18} /></>}
                                </button>

                                <div className="flex items-center justify-between pt-4 mt-2 text-sm">
                                    <button
                                        type="button"
                                        onClick={() => switchView('register')}
                                        className="text-slate-400 hover:text-white transition-colors"
                                    >
                                        Create Account
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => switchView('change-password')}
                                        className="text-slate-400 hover:text-white transition-colors"
                                    >
                                        Forgot Password?
                                    </button>
                                </div>
                            </motion.form>
                        )}

                        {view === 'register' && (
                            <motion.form
                                key="register-form"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                onSubmit={handleRegister}
                                className="space-y-4"
                            >
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-white transition-colors">
                                        <User size={18} />
                                    </div>
                                    <input
                                        type="text"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pl-11 text-white placeholder-slate-500 outline-none focus:bg-white/10 focus:border-white/20 transition-all text-sm"
                                        placeholder="Choose Username"
                                        required
                                    />
                                </div>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-white transition-colors">
                                        <Lock size={18} />
                                    </div>
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pl-11 text-white placeholder-slate-500 outline-none focus:bg-white/10 focus:border-white/20 transition-all text-sm"
                                        placeholder="Choose Password"
                                        required
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className={`
                                        w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl py-3.5 font-semibold hover:from-blue-500 hover:to-indigo-500 transition-all 
                                        shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2
                                        ${isLoading ? 'opacity-80 cursor-wait' : 'hover:scale-[1.02] active:scale-[0.98]'}
                                    `}
                                >
                                    {isLoading ? <Loader2 size={20} className="animate-spin" /> : 'Create Account'}
                                </button>

                                <button
                                    type="button"
                                    onClick={() => switchView('login')}
                                    className="w-full text-slate-400 text-sm hover:text-white flex items-center justify-center gap-2 mt-4 hover:bg-white/5 py-2 rounded-lg transition-colors"
                                >
                                    <ArrowLeft size={16} /> Back to Login
                                </button>
                            </motion.form>
                        )}

                        {view === 'change-password' && (
                            <motion.form
                                key="change-password-form"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                onSubmit={handleChangePassword}
                                className="space-y-4"
                            >
                                <div className="space-y-4">
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-white transition-colors">
                                            <User size={18} />
                                        </div>
                                        <input
                                            type="text"
                                            value={username}
                                            onChange={(e) => setUsername(e.target.value)}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pl-11 text-white placeholder-slate-500 outline-none focus:bg-white/10 focus:border-white/20 transition-all text-sm"
                                            placeholder="Username"
                                            required
                                        />
                                    </div>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-white transition-colors">
                                            <Lock size={18} />
                                        </div>
                                        <input
                                            type="password"
                                            value={oldPassword}
                                            onChange={(e) => setOldPassword(e.target.value)}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pl-11 text-white placeholder-slate-500 outline-none focus:bg-white/10 focus:border-white/20 transition-all text-sm"
                                            placeholder="Old Password"
                                            required
                                        />
                                    </div>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-white transition-colors">
                                            <Key size={18} />
                                        </div>
                                        <input
                                            type="password"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pl-11 text-white placeholder-slate-500 outline-none focus:bg-white/10 focus:border-white/20 transition-all text-sm"
                                            placeholder="New Password"
                                            required
                                        />
                                    </div>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-white transition-colors">
                                            <Key size={18} />
                                        </div>
                                        <input
                                            type="password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pl-11 text-white placeholder-slate-500 outline-none focus:bg-white/10 focus:border-white/20 transition-all text-sm"
                                            placeholder="Confirm Password"
                                            required
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className={`
                                        w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl py-3.5 font-semibold hover:from-blue-500 hover:to-indigo-500 transition-all 
                                        shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 mt-2
                                        ${isLoading ? 'opacity-80 cursor-wait' : 'hover:scale-[1.02] active:scale-[0.98]'}
                                    `}
                                >
                                    {isLoading ? <Loader2 size={20} className="animate-spin" /> : 'Update Password'}
                                </button>

                                <button
                                    type="button"
                                    onClick={() => switchView('login')}
                                    className="w-full text-slate-400 text-sm hover:text-white flex items-center justify-center gap-2 mt-4 hover:bg-white/5 py-2 rounded-lg transition-colors"
                                >
                                    <ArrowLeft size={16} /> Back to Login
                                </button>
                            </motion.form>
                        )}
                    </div>
                </div>

                <div className="text-center mt-8 text-slate-500 text-xs">
                    &copy; 2026 Falio. All rights reserved.
                </div>
            </motion.div>
        </div>
    );
};

export default Login;
