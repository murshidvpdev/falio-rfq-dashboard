import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Pencil, Trash2, Copy, Shield, X, ChevronDown, ChevronRight } from 'lucide-react';
import Header from '../../components/Layout/Header';
import Sidebar from '../../components/Layout/Sidebar';
import UserMenu from '../../components/Layout/UserMenu';
import Toast from '../../components/UI/Toast';
import PermissionGate from '../../components/RBAC/PermissionGate';
import { API_BASE } from '../../config';

const token = () => localStorage.getItem('token');
const authFetch = (url, opts = {}) => fetch(`${API_BASE}${url}`, {
    ...opts,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}`, ...(opts.headers ?? {}) },
});

// ── Permission picker modal ────────────────────────────────────────────────────

const PermissionPickerModal = ({ role, allPermissions, onClose, onSave }) => {
    const [selected, setSelected] = useState(new Set(role.permission_ids ?? []));
    const [expanded, setExpanded] = useState({});

    const togglePerm = (id) => {
        const next = new Set(selected);
        next.has(id) ? next.delete(id) : next.add(id);
        setSelected(next);
    };

    const toggleModule = (module, ids) => {
        const allSelected = ids.every(id => selected.has(id));
        const next = new Set(selected);
        ids.forEach(id => allSelected ? next.delete(id) : next.add(id));
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
                className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl border border-slate-200 flex flex-col max-h-[85vh]"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex items-center justify-between p-5 border-b border-slate-100">
                    <div>
                        <h3 className="font-semibold text-slate-800">Permissions — {role.name}</h3>
                        <p className="text-xs text-slate-500 mt-0.5">{selected.size} selected</p>
                    </div>
                    <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400"><X size={18} /></button>
                </div>

                <div className="flex-1 overflow-y-auto p-5 space-y-3">
                    {Object.entries(allPermissions).map(([module, perms]) => {
                        const ids = perms.map(p => p.id);
                        const allSel = ids.every(id => selected.has(id));
                        const someSel = ids.some(id => selected.has(id));
                        const isOpen = expanded[module] !== false; // default open

                        return (
                            <div key={module} className="border border-slate-200 rounded-xl overflow-hidden">
                                <button
                                    onClick={() => setExpanded(e => ({ ...e, [module]: !isOpen }))}
                                    className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 hover:bg-slate-100 transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="checkbox"
                                            checked={allSel}
                                            ref={el => el && (el.indeterminate = !allSel && someSel)}
                                            onChange={() => toggleModule(module, ids)}
                                            onClick={e => e.stopPropagation()}
                                            className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                        />
                                        <span className="text-sm font-semibold text-slate-700 capitalize">{module}</span>
                                        <span className="text-xs text-slate-400">{ids.filter(id => selected.has(id)).length}/{ids.length}</span>
                                    </div>
                                    {isOpen ? <ChevronDown size={15} className="text-slate-400" /> : <ChevronRight size={15} className="text-slate-400" />}
                                </button>
                                {isOpen && (
                                    <div className="divide-y divide-slate-100">
                                        {perms.map(p => (
                                            <label key={p.id} className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 cursor-pointer transition-colors">
                                                <input
                                                    type="checkbox"
                                                    checked={selected.has(p.id)}
                                                    onChange={() => togglePerm(p.id)}
                                                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                                />
                                                <div>
                                                    <p className="text-sm text-slate-800">{p.name}</p>
                                                    <p className="text-xs text-slate-400 font-mono">{p.slug}</p>
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                <div className="flex justify-end gap-2 p-5 border-t border-slate-100">
                    <button onClick={onClose} className="px-4 py-2 text-sm text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">Cancel</button>
                    <button onClick={() => onSave([...selected])} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm font-medium">
                        Save Permissions
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
};

// ── Create / Edit Role Modal ───────────────────────────────────────────────────

const RoleFormModal = ({ role, onClose, onSave }) => {
    const [form, setForm] = useState({
        name: role?.name ?? '',
        slug: role?.slug ?? '',
        description: role?.description ?? '',
    });

    const autoSlug = (name) => name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');

    return (
        <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
                className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-slate-200"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex items-center justify-between p-5 border-b border-slate-100">
                    <h3 className="font-semibold text-slate-800">{role ? 'Edit Role' : 'Create Role'}</h3>
                    <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400"><X size={18} /></button>
                </div>
                <div className="p-5 space-y-4">
                    {['name', 'slug', 'description'].map(field => (
                        <div key={field}>
                            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">{field}</label>
                            <input
                                value={form[field]}
                                onChange={e => {
                                    const val = e.target.value;
                                    setForm(f => ({
                                        ...f,
                                        [field]: val,
                                        ...(field === 'name' && !role ? { slug: autoSlug(val) } : {}),
                                    }));
                                }}
                                placeholder={field === 'slug' ? 'auto_generated_from_name' : ''}
                                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                            />
                        </div>
                    ))}
                </div>
                <div className="flex justify-end gap-2 p-5 border-t border-slate-100">
                    <button onClick={onClose} className="px-4 py-2 text-sm text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">Cancel</button>
                    <button onClick={() => form.name && form.slug && onSave(form)} disabled={!form.name || !form.slug} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-sm font-medium">
                        {role ? 'Save Changes' : 'Create Role'}
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
};

// ── Main Page ──────────────────────────────────────────────────────────────────

const RolesPage = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [roles, setRoles] = useState([]);
    const [permissions, setPermissions] = useState({});
    const [notification, setNotification] = useState(null);
    const [permModal, setPermModal] = useState(null);
    const [formModal, setFormModal] = useState(null); // null | 'create' | role object
    const [cloneModal, setCloneModal] = useState(null);

    const notify = (msg, type = 'success') => setNotification({ message: msg, type });

    const fetchRoles = useCallback(async () => {
        const res = await authFetch('/admin/roles');
        if (res.ok) setRoles(await res.json());
    }, []);

    const fetchPermissions = useCallback(async () => {
        const res = await authFetch('/admin/permissions');
        if (res.ok) setPermissions((await res.json()).permissions);
    }, []);

    const fetchMe = useCallback(async () => {
        const res = await authFetch('/users/me');
        if (res.ok) setCurrentUser(await res.json());
    }, []);

    useEffect(() => { fetchRoles(); fetchPermissions(); fetchMe(); }, [fetchRoles, fetchPermissions, fetchMe]);

    const savePermissions = async (role, ids) => {
        const res = await authFetch(`/admin/roles/${role.id}/permissions`, { method: 'PUT', body: JSON.stringify({ permission_ids: ids }) });
        if (res.ok) { notify('Permissions updated'); setPermModal(null); fetchRoles(); }
        else notify((await res.json()).detail ?? 'Failed', 'error');
    };

    const createOrUpdateRole = async (form) => {
        const isEdit = formModal && formModal !== 'create';
        const url = isEdit ? `/admin/roles/${formModal.id}` : '/admin/roles';
        const method = isEdit ? 'PUT' : 'POST';
        const res = await authFetch(url, { method, body: JSON.stringify(form) });
        if (res.ok) { notify(isEdit ? 'Role updated' : 'Role created'); setFormModal(null); fetchRoles(); }
        else notify((await res.json()).detail ?? 'Failed', 'error');
    };

    const cloneRole = async (sourceId, form) => {
        const res = await authFetch(`/admin/roles/${sourceId}/clone`, { method: 'POST', body: JSON.stringify(form) });
        if (res.ok) { notify('Role cloned'); setCloneModal(null); fetchRoles(); }
        else notify((await res.json()).detail ?? 'Failed', 'error');
    };

    const deleteRole = async (role) => {
        if (!confirm(`Delete role "${role.name}"?`)) return;
        const res = await authFetch(`/admin/roles/${role.id}`, { method: 'DELETE' });
        if (res.ok) { notify('Role deleted'); fetchRoles(); }
        else notify((await res.json()).detail ?? 'Failed', 'error');
    };

    return (
        <div className="flex min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
            <Sidebar isOpen={isSidebarOpen} user={currentUser} />
            <div className={`flex-1 transition-[margin] duration-500 ${isSidebarOpen ? 'ml-64' : 'ml-0'}`}>
                <Header title="Role Management" onToggleSidebar={() => setIsSidebarOpen(p => !p)} extraAction={<UserMenu user={currentUser} />} />

                <main className="p-8 max-w-[1400px] mx-auto">
                    <AnimatePresence>
                        {notification && <Toast message={notification.message} type={notification.type} onClose={() => setNotification(null)} />}
                    </AnimatePresence>

                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Roles</h2>
                            <p className="text-slate-500 mt-1">{roles.length} roles configured</p>
                        </div>
                        <PermissionGate permission="roles.create">
                            <button onClick={() => setFormModal('create')} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg font-medium text-sm shadow-sm transition-colors">
                                <Plus size={16} /> New Role
                            </button>
                        </PermissionGate>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5">
                        {roles.map(role => (
                            <motion.div
                                key={role.id}
                                initial={{ opacity: 0, y: 16 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex flex-col gap-4"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                                            <Shield size={18} />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-slate-800">{role.name}</p>
                                            <p className="text-xs font-mono text-slate-400">{role.slug}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        {role.is_system && <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-medium">system</span>}
                                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium border ${role.is_active ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-red-50 text-red-700 border-red-100'}`}>
                                            {role.is_active ? 'active' : 'inactive'}
                                        </span>
                                    </div>
                                </div>

                                {role.description && <p className="text-xs text-slate-500">{role.description}</p>}

                                <div className="text-xs text-slate-500">
                                    <span className="font-semibold text-slate-700">{role.permission_count}</span> permissions assigned
                                </div>

                                <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-100">
                                    <PermissionGate permission="permissions.assign">
                                        <button onClick={() => setPermModal(role)} className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-lg hover:bg-indigo-100 transition-colors font-medium">
                                            <Shield size={12} /> Permissions
                                        </button>
                                    </PermissionGate>
                                    <PermissionGate permission="roles.edit">
                                        <button onClick={() => setFormModal(role)} className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-slate-50 text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors font-medium">
                                            <Pencil size={12} /> Edit
                                        </button>
                                    </PermissionGate>
                                    <PermissionGate permission="roles.create">
                                        <button onClick={() => setCloneModal(role)} className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-slate-50 text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors font-medium">
                                            <Copy size={12} /> Clone
                                        </button>
                                    </PermissionGate>
                                    {!role.is_system && (
                                        <PermissionGate permission="roles.delete">
                                            <button onClick={() => deleteRole(role)} className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-red-50 text-red-600 border border-red-100 rounded-lg hover:bg-red-100 transition-colors font-medium ml-auto">
                                                <Trash2 size={12} /> Delete
                                            </button>
                                        </PermissionGate>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </main>
            </div>

            <AnimatePresence>
                {permModal && (
                    <PermissionPickerModal
                        role={permModal}
                        allPermissions={permissions}
                        onClose={() => setPermModal(null)}
                        onSave={(ids) => savePermissions(permModal, ids)}
                    />
                )}
                {formModal && (
                    <RoleFormModal
                        role={formModal === 'create' ? null : formModal}
                        onClose={() => setFormModal(null)}
                        onSave={createOrUpdateRole}
                    />
                )}
                {cloneModal && (
                    <RoleFormModal
                        role={null}
                        onClose={() => setCloneModal(null)}
                        onSave={(form) => cloneRole(cloneModal.id, form)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default RolesPage;
