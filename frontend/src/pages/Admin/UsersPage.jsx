import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search, UserPlus, RefreshCw, Shield, ShieldOff,
    Trash2, Key, Users, ChevronLeft, ChevronRight, X, Check,
} from 'lucide-react';
import Header from '../../components/Layout/Header';
import Sidebar from '../../components/Layout/Sidebar';
import UserMenu from '../../components/Layout/UserMenu';
import Toast from '../../components/UI/Toast';
import PermissionGate from '../../components/RBAC/PermissionGate';
import { usePermissions } from '../../hooks/usePermissions';
import { API_BASE } from '../../config';

const token = () => localStorage.getItem('token');
const authFetch = (url, opts = {}) => fetch(`${API_BASE}${url}`, {
    ...opts,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}`, ...(opts.headers ?? {}) },
});

// ── Sub-components ─────────────────────────────────────────────────────────────

const StatusBadge = ({ active }) => (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
        active ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-red-50 text-red-700 border-red-100'
    }`}>
        {active ? 'Active' : 'Inactive'}
    </span>
);

const RoleBadge = ({ role }) => (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
        {role}
    </span>
);

// ── Create User Modal ──────────────────────────────────────────────────────────

const CreateUserModal = ({ allRoles, onClose, onSave, isSuperAdmin }) => {
    const [form, setForm] = useState({ username: '', password: '', is_superuser: false, role_ids: [] });

    const toggleRole = (id) => {
        setForm(f => ({
            ...f,
            role_ids: f.role_ids.includes(id) ? f.role_ids.filter(r => r !== id) : [...f.role_ids, id],
        }));
    };

    const valid = form.username.trim() && form.password.trim();

    return (
        <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.95, y: 10 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95 }}
                className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-slate-200"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex items-center justify-between p-5 border-b border-slate-100">
                    <div>
                        <h3 className="font-semibold text-slate-800">Create User</h3>
                        <p className="text-xs text-slate-500 mt-0.5">Add a new account</p>
                    </div>
                    <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400"><X size={18} /></button>
                </div>

                <div className="p-5 space-y-4">
                    {/* Username */}
                    <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Username</label>
                        <input
                            type="text" value={form.username}
                            onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
                            placeholder="e.g. john.doe or john@company.com"
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                        />
                    </div>

                    {/* Password */}
                    <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Password</label>
                        <input
                            type="password" value={form.password}
                            onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                            placeholder="Minimum 6 characters"
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                        />
                    </div>

                    {/* Roles */}
                    <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Assign Roles</label>
                        <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                            {allRoles.map(r => (
                                <label key={r.id} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-slate-50 cursor-pointer border border-transparent hover:border-slate-200 transition-all">
                                    <input
                                        type="checkbox"
                                        checked={form.role_ids.includes(r.id)}
                                        onChange={() => toggleRole(r.id)}
                                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <div>
                                        <p className="text-sm font-medium text-slate-800">{r.name}</p>
                                        <p className="text-xs text-slate-400">{r.description ?? r.slug}</p>
                                    </div>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Super Admin toggle — only visible to super admins */}
                    {isSuperAdmin && (
                        <label className="flex items-center gap-3 p-3 rounded-lg border border-amber-100 bg-amber-50 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={form.is_superuser}
                                onChange={e => setForm(f => ({ ...f, is_superuser: e.target.checked }))}
                                className="rounded border-slate-300 text-amber-600 focus:ring-amber-500"
                            />
                            <div>
                                <p className="text-sm font-medium text-amber-800">Super Admin</p>
                                <p className="text-xs text-amber-600">Bypasses all permission checks</p>
                            </div>
                        </label>
                    )}
                </div>

                <div className="flex justify-end gap-2 p-5 border-t border-slate-100">
                    <button onClick={onClose} className="px-4 py-2 text-sm text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">Cancel</button>
                    <button
                        onClick={() => valid && onSave(form)}
                        disabled={!valid}
                        className="flex items-center gap-2 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-sm font-medium"
                    >
                        <UserPlus size={15} /> Create User
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
};

// ── Assign Roles Modal ─────────────────────────────────────────────────────────

const AssignRolesModal = ({ user, allRoles, onClose, onSave }) => {
    const [selected, setSelected] = useState(new Set(user.role_ids ?? []));

    const toggle = (id) => {
        const next = new Set(selected);
        next.has(id) ? next.delete(id) : next.add(id);
        setSelected(next);
    };

    return (
        <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.95, y: 10 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95 }}
                className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-slate-200"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex items-center justify-between p-5 border-b border-slate-100">
                    <div>
                        <h3 className="font-semibold text-slate-800">Assign Roles</h3>
                        <p className="text-xs text-slate-500 mt-0.5">@{user.username}</p>
                    </div>
                    <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400"><X size={18} /></button>
                </div>
                <div className="p-5 space-y-2 max-h-72 overflow-y-auto">
                    {allRoles.map(r => (
                        <label key={r.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 cursor-pointer border border-transparent hover:border-slate-200 transition-all">
                            <input
                                type="checkbox"
                                checked={selected.has(r.id)}
                                onChange={() => toggle(r.id)}
                                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                            />
                            <div>
                                <p className="text-sm font-medium text-slate-800">{r.name}</p>
                                <p className="text-xs text-slate-400">{r.slug}</p>
                            </div>
                        </label>
                    ))}
                </div>
                <div className="flex justify-end gap-2 p-5 border-t border-slate-100">
                    <button onClick={onClose} className="px-4 py-2 text-sm text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">Cancel</button>
                    <button onClick={() => onSave([...selected])} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm font-medium">Save</button>
                </div>
            </motion.div>
        </motion.div>
    );
};

// ── Reset Password Modal ───────────────────────────────────────────────────────

const ResetPasswordModal = ({ user, onClose, onSave }) => {
    const [pw, setPw] = useState('');
    return (
        <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
                className="bg-white rounded-2xl w-full max-w-sm shadow-2xl border border-slate-200"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex items-center justify-between p-5 border-b border-slate-100">
                    <h3 className="font-semibold text-slate-800">Reset Password — @{user.username}</h3>
                    <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400"><X size={18} /></button>
                </div>
                <div className="p-5">
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">New Password</label>
                    <input
                        type="password" value={pw} onChange={e => setPw(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                        placeholder="Enter new password"
                    />
                </div>
                <div className="flex justify-end gap-2 p-5 border-t border-slate-100">
                    <button onClick={onClose} className="px-4 py-2 text-sm text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">Cancel</button>
                    <button onClick={() => pw && onSave(pw)} disabled={!pw} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-sm font-medium">Reset</button>
                </div>
            </motion.div>
        </motion.div>
    );
};

// ── Main Page ──────────────────────────────────────────────────────────────────

const UsersPage = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [users, setUsers] = useState([]);
    const [roles, setRoles] = useState([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(false);
    const [notification, setNotification] = useState(null);
    const [assignModal, setAssignModal] = useState(null);
    const [resetModal, setResetModal] = useState(null);
    const [createModal, setCreateModal] = useState(false);
    const { isSuperAdmin } = usePermissions();
    const perPage = 15;

    const notify = (message, type = 'success') => setNotification({ message, type });

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({ page, per_page: perPage });
            if (search) params.set('search', search);
            const res = await authFetch(`/admin/users?${params}`);
            if (res.ok) {
                const data = await res.json();
                setUsers(data.users);
                setTotal(data.total);
            }
        } finally { setLoading(false); }
    }, [page, search]);

    const fetchRoles = useCallback(async () => {
        const res = await authFetch('/admin/roles');
        if (res.ok) setRoles(await res.json());
    }, []);

    const fetchMe = useCallback(async () => {
        const res = await authFetch('/users/me');
        if (res.ok) setCurrentUser(await res.json());
    }, []);

    useEffect(() => { fetchUsers(); }, [fetchUsers]);
    useEffect(() => { fetchRoles(); fetchMe(); }, [fetchRoles, fetchMe]);

    const toggleActive = async (user) => {
        const res = await authFetch(`/admin/users/${user.id}/toggle-active`, { method: 'POST' });
        if (res.ok) { notify(`${user.username} ${user.is_active ? 'deactivated' : 'activated'}`); fetchUsers(); }
        else notify((await res.json()).detail ?? 'Failed', 'error');
    };

    const saveRoles = async (userId, roleIds) => {
        const res = await authFetch(`/admin/users/${userId}/roles`, { method: 'PUT', body: JSON.stringify({ role_ids: roleIds }) });
        if (res.ok) { notify('Roles updated'); setAssignModal(null); fetchUsers(); }
        else notify((await res.json()).detail ?? 'Failed', 'error');
    };

    const resetPassword = async (userId, pw) => {
        const res = await authFetch(`/admin/users/${userId}/reset-password`, { method: 'POST', body: JSON.stringify({ new_password: pw }) });
        if (res.ok) { notify('Password reset'); setResetModal(null); }
        else notify((await res.json()).detail ?? 'Failed', 'error');
    };

    const createUser = async (form) => {
        const res = await authFetch('/admin/users', { method: 'POST', body: JSON.stringify(form) });
        if (res.ok) { notify('User created'); setCreateModal(false); fetchUsers(); }
        else notify((await res.json()).detail ?? 'Failed', 'error');
    };

    const deleteUser = async (user) => {
        if (!confirm(`Delete user @${user.username}? This cannot be undone.`)) return;
        const res = await authFetch(`/admin/users/${user.id}`, { method: 'DELETE' });
        if (res.ok) { notify(`@${user.username} deleted`); fetchUsers(); }
        else notify((await res.json()).detail ?? 'Failed', 'error');
    };

    const pages = Math.max(1, Math.ceil(total / perPage));

    return (
        <div className="flex min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
            <Sidebar isOpen={isSidebarOpen} user={currentUser} />
            <div className={`flex-1 transition-[margin] duration-500 ${isSidebarOpen ? 'ml-64' : 'ml-0'}`}>
                <Header title="User Management" onToggleSidebar={() => setIsSidebarOpen(p => !p)} extraAction={<UserMenu user={currentUser} />} />

                <main className="p-8 max-w-[1600px] mx-auto">
                    <AnimatePresence>
                        {notification && <Toast message={notification.message} type={notification.type} onClose={() => setNotification(null)} />}
                    </AnimatePresence>

                    {/* Page header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                        <div>
                            <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Users</h2>
                            <p className="text-slate-500 mt-1">{total} total accounts</p>
                        </div>
                        <div className="flex gap-3">
                            <button onClick={fetchUsers} className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 bg-white rounded-lg border border-slate-200 shadow-sm transition-all">
                                <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                            </button>
                            <PermissionGate permission="users.create">
                                <button
                                    onClick={() => setCreateModal(true)}
                                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium text-sm shadow-sm transition-colors"
                                >
                                    <UserPlus size={16} /> Add User
                                </button>
                            </PermissionGate>
                        </div>
                    </div>

                    {/* Search */}
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-6">
                        <div className="relative max-w-sm">
                            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text" placeholder="Search by username…"
                                value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
                                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                            />
                        </div>
                    </div>

                    {/* Table */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                        <th className="px-5 py-3">User</th>
                                        <th className="px-5 py-3">Roles</th>
                                        <th className="px-5 py-3">Status</th>
                                        <th className="px-5 py-3">Last Login</th>
                                        <th className="px-5 py-3 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm divide-y divide-slate-100">
                                    {users.map(u => (
                                        <tr key={u.id} className="hover:bg-blue-50/20 transition-colors group">
                                            <td className="px-5 py-3.5">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold flex-shrink-0">
                                                        {u.username[0].toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-slate-800">{u.username}</p>
                                                        {u.is_superuser && <span className="text-xs text-purple-600 font-medium">Super Admin</span>}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-5 py-3.5">
                                                <div className="flex flex-wrap gap-1">
                                                    {u.roles.length ? u.roles.map(r => <RoleBadge key={r} role={r} />) : <span className="text-slate-300 text-xs">—</span>}
                                                </div>
                                            </td>
                                            <td className="px-5 py-3.5"><StatusBadge active={u.is_active} /></td>
                                            <td className="px-5 py-3.5 text-slate-500 text-xs whitespace-nowrap">
                                                {u.last_login ? new Date(u.last_login).toLocaleString() : 'Never'}
                                            </td>
                                            <td className="px-5 py-3.5">
                                                <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <PermissionGate permission="users.manage_roles">
                                                        <button onClick={() => setAssignModal(u)} title="Assign Roles" className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors">
                                                            <Users size={15} />
                                                        </button>
                                                    </PermissionGate>
                                                    <PermissionGate permission="users.edit">
                                                        <button onClick={() => setResetModal(u)} title="Reset Password" className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-md transition-colors">
                                                            <Key size={15} />
                                                        </button>
                                                        <button onClick={() => toggleActive(u)} title={u.is_active ? 'Deactivate' : 'Activate'} className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors">
                                                            {u.is_active ? <ShieldOff size={15} /> : <Shield size={15} />}
                                                        </button>
                                                    </PermissionGate>
                                                    <PermissionGate permission="users.delete">
                                                        <button onClick={() => deleteUser(u)} title="Delete" className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors">
                                                            <Trash2 size={15} />
                                                        </button>
                                                    </PermissionGate>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {!loading && users.length === 0 && (
                                        <tr><td colSpan={5} className="px-5 py-12 text-center text-slate-400 text-sm">No users found.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        <div className="px-5 py-3.5 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
                            <span className="text-xs text-slate-500">Page {page} of {pages}</span>
                            <div className="flex gap-1.5">
                                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-1.5 border border-slate-200 rounded-lg hover:bg-white disabled:opacity-40 text-slate-600 transition-all">
                                    <ChevronLeft size={15} />
                                </button>
                                <button onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages} className="p-1.5 border border-slate-200 rounded-lg hover:bg-white disabled:opacity-40 text-slate-600 transition-all">
                                    <ChevronRight size={15} />
                                </button>
                            </div>
                        </div>
                    </div>
                </main>
            </div>

            <AnimatePresence>
                {createModal && <CreateUserModal allRoles={roles} isSuperAdmin={isSuperAdmin} onClose={() => setCreateModal(false)} onSave={createUser} />}
                {assignModal && <AssignRolesModal user={assignModal} allRoles={roles} onClose={() => setAssignModal(null)} onSave={(ids) => saveRoles(assignModal.id, ids)} />}
                {resetModal && <ResetPasswordModal user={resetModal} onClose={() => setResetModal(null)} onSave={(pw) => resetPassword(resetModal.id, pw)} />}
            </AnimatePresence>
        </div>
    );
};

export default UsersPage;
