import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search, Upload, Trash2, RefreshCw, Filter, LayoutDashboard,
    CheckCircle, X, FileText, ChevronLeft, ChevronRight, Eye,
    AlertCircle, Clock, CloudUpload, Download,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Layout/Header';
import Sidebar from '../components/Layout/Sidebar';
import UserMenu from '../components/Layout/UserMenu';
import Toast from '../components/UI/Toast';
import PermissionGate from '../components/RBAC/PermissionGate';
import { usePermissions } from '../hooks/usePermissions';
import { API_BASE } from '../config';

const token = () => localStorage.getItem('token');
const authFetch = (url, opts = {}) => fetch(`${API_BASE}${url}`, {
    ...opts,
    headers: { Authorization: `Bearer ${token()}`, ...(opts.headers ?? {}) },
});

// ── Status badge ───────────────────────────────────────────────────────────────

const StatusBadge = ({ status }) => {
    const map = {
        Complete:   'bg-emerald-50 text-emerald-700 border-emerald-100',
        Completed:  'bg-emerald-50 text-emerald-700 border-emerald-100',
        Exception:  'bg-red-50 text-red-700 border-red-100',
        Failed:     'bg-red-50 text-red-700 border-red-100',
        Processing: 'bg-sky-50 text-sky-700 border-sky-100',
        Pending:    'bg-amber-50 text-amber-700 border-amber-100',
    };
    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${map[status] ?? 'bg-slate-100 text-slate-600 border-slate-200'}`}>
            {status}
        </span>
    );
};

// ── Line Items Modal ───────────────────────────────────────────────────────────

const LineItemsModal = ({ doc, onClose }) => {
    if (!doc) return null;
    const fmt = (v) => v != null ? Number(v).toLocaleString(undefined, { minimumFractionDigits: 2 }) : '—';

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.95, y: 10 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95 }}
                    className="bg-white rounded-2xl w-full max-w-5xl max-h-[88vh] flex flex-col shadow-2xl border border-slate-200"
                    onClick={e => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-5 border-b border-slate-100">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-blue-50 rounded-xl text-blue-600"><FileText size={20} /></div>
                            <div>
                                <h2 className="font-bold text-slate-800">{doc.original_filename}</h2>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    {doc.rfq_number && <span className="mr-3">RFQ: {doc.rfq_number}</span>}
                                    {doc.account    && <span className="mr-3">Account: {doc.account}</span>}
                                    {doc.supplier   && <span className="mr-3">Supplier: {doc.supplier}</span>}
                                    {doc.total_line_items} line items
                                </p>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 transition-colors"><X size={20} /></button>
                    </div>

                    {/* Summary strip */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 px-5 py-4 bg-slate-50/50 border-b border-slate-100">
                        {[
                            { label: "Issue Date",    value: doc.issue_date ?? '—' },
                            { label: "Due Date",      value: doc.due_date ?? '—' },
                            { label: "Currency",      value: doc.currency ?? 'SAR' },
                            { label: "Total Amount",  value: doc.total_amount != null ? `${doc.currency ?? 'SAR'} ${fmt(doc.total_amount)}` : '—' },
                        ].map(({ label, value }) => (
                            <div key={label}>
                                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{label}</p>
                                <p className="text-sm font-semibold text-slate-800 mt-0.5">{value}</p>
                            </div>
                        ))}
                    </div>

                    {/* Line items table */}
                    <div className="flex-1 overflow-auto">
                        {(!doc.line_items || doc.line_items.length === 0) ? (
                            <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                                <FileText size={40} className="mb-3 text-slate-300" />
                                <p className="text-sm">No line items extracted from this document.</p>
                            </div>
                        ) : (
                            <table className="w-full text-left border-collapse text-sm">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider sticky top-0">
                                        <th className="px-4 py-3 w-12">#</th>
                                        <th className="px-4 py-3">Part No.</th>
                                        <th className="px-4 py-3">Description</th>
                                        <th className="px-4 py-3 text-right">Qty</th>
                                        <th className="px-4 py-3">Unit</th>
                                        <th className="px-4 py-3 text-right">Unit Price</th>
                                        <th className="px-4 py-3 text-right">Total</th>
                                        <th className="px-4 py-3">Notes</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {doc.line_items.map((li, idx) => (
                                        <tr key={li.id} className="hover:bg-blue-50/20 transition-colors">
                                            <td className="px-4 py-3 text-slate-400 font-mono text-xs">{li.item_no ?? idx + 1}</td>
                                            <td className="px-4 py-3 font-mono text-xs text-slate-600">{li.part_number ?? '—'}</td>
                                            <td className="px-4 py-3 text-slate-800 font-medium max-w-xs">{li.description ?? '—'}</td>
                                            <td className="px-4 py-3 text-right text-slate-700">{li.quantity != null ? li.quantity : '—'}</td>
                                            <td className="px-4 py-3 text-slate-500">{li.unit ?? '—'}</td>
                                            <td className="px-4 py-3 text-right text-slate-700">{li.unit_price != null ? fmt(li.unit_price) : '—'}</td>
                                            <td className="px-4 py-3 text-right font-medium text-slate-800">{li.total_price != null ? fmt(li.total_price) : '—'}</td>
                                            <td className="px-4 py-3 text-slate-400 text-xs">{li.notes ?? ''}</td>
                                        </tr>
                                    ))}
                                </tbody>
                                {doc.total_amount != null && (
                                    <tfoot>
                                        <tr className="bg-slate-50 border-t-2 border-slate-200">
                                            <td colSpan={6} className="px-4 py-3 text-right font-semibold text-slate-700 text-sm">Total</td>
                                            <td className="px-4 py-3 text-right font-bold text-slate-900">{fmt(doc.total_amount)}</td>
                                            <td />
                                        </tr>
                                    </tfoot>
                                )}
                            </table>
                        )}
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

// ── Upload Modal ───────────────────────────────────────────────────────────────

const ACCEPTED = '.xlsx,.xls,.csv,.pdf,.doc,.docx,.txt';

const UploadModal = ({ onClose, onUploaded }) => {
    const [dragging, setDragging] = useState(false);
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState('');
    const inputRef = useRef(null);

    const handleFile = (f) => {
        if (!f) return;
        setError('');
        setFile(f);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragging(false);
        handleFile(e.dataTransfer.files[0]);
    };

    const doUpload = async () => {
        if (!file) return;
        setUploading(true);
        setProgress(10);
        try {
            const fd = new FormData();
            fd.append('file', file);
            setProgress(40);
            const res = await fetch(`${API_BASE}/documents/upload`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token()}` },
                body: fd,
            });
            setProgress(90);
            const data = await res.json();
            if (!res.ok) throw new Error(data.detail ?? 'Upload failed');
            setProgress(100);
            onUploaded(data);
            onClose();
        } catch (e) {
            setError(e.message);
        } finally {
            setUploading(false);
        }
    };

    const fmtSize = (b) => b < 1024 * 1024 ? `${(b / 1024).toFixed(1)} KB` : `${(b / 1024 / 1024).toFixed(1)} MB`;

    return (
        <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={!uploading ? onClose : undefined}
        >
            <motion.div
                initial={{ scale: 0.95, y: 10 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95 }}
                className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-slate-200"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex items-center justify-between p-5 border-b border-slate-100">
                    <div>
                        <h3 className="font-semibold text-slate-800">Upload Document</h3>
                        <p className="text-xs text-slate-500 mt-0.5">Extract RFQ fields and line items automatically</p>
                    </div>
                    {!uploading && <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400"><X size={18} /></button>}
                </div>

                <div className="p-5 space-y-4">
                    {/* Drop zone */}
                    <div
                        onDragOver={e => { e.preventDefault(); setDragging(true); }}
                        onDragLeave={() => setDragging(false)}
                        onDrop={handleDrop}
                        onClick={() => !uploading && inputRef.current?.click()}
                        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                            dragging
                                ? 'border-blue-400 bg-blue-50'
                                : file
                                    ? 'border-emerald-300 bg-emerald-50'
                                    : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50'
                        }`}
                    >
                        <input
                            ref={inputRef}
                            type="file"
                            accept={ACCEPTED}
                            className="hidden"
                            onChange={e => handleFile(e.target.files?.[0])}
                        />
                        {file ? (
                            <>
                                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                                    <FileText size={24} />
                                </div>
                                <p className="font-semibold text-slate-800 text-sm">{file.name}</p>
                                <p className="text-xs text-slate-500 mt-1">{fmtSize(file.size)}</p>
                                {!uploading && (
                                    <button
                                        onClick={e => { e.stopPropagation(); setFile(null); }}
                                        className="mt-2 text-xs text-red-500 hover:text-red-700"
                                    >
                                        Remove
                                    </button>
                                )}
                            </>
                        ) : (
                            <>
                                <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-xl flex items-center justify-center mx-auto mb-3">
                                    <CloudUpload size={24} />
                                </div>
                                <p className="text-sm font-medium text-slate-700">Drop your file here or <span className="text-blue-600">browse</span></p>
                                <p className="text-xs text-slate-400 mt-1">XLSX, XLS, CSV, PDF, DOC, DOCX · Max 20 MB</p>
                            </>
                        )}
                    </div>

                    {/* Progress bar */}
                    {uploading && (
                        <div>
                            <div className="flex justify-between text-xs text-slate-500 mb-1.5">
                                <span>Uploading & extracting…</span>
                                <span>{progress}%</span>
                            </div>
                            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                <motion.div
                                    className="h-full bg-blue-500 rounded-full"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progress}%` }}
                                    transition={{ duration: 0.3 }}
                                />
                            </div>
                        </div>
                    )}

                    {/* Error */}
                    {error && (
                        <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 border border-red-100 px-3 py-2.5 rounded-lg">
                            <AlertCircle size={16} className="flex-shrink-0" />
                            {error}
                        </div>
                    )}
                </div>

                <div className="flex justify-end gap-2 p-5 border-t border-slate-100">
                    {!uploading && <button onClick={onClose} className="px-4 py-2 text-sm text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">Cancel</button>}
                    <button
                        onClick={doUpload}
                        disabled={!file || uploading}
                        className="flex items-center gap-2 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-sm font-medium"
                    >
                        {uploading ? <><Clock size={15} className="animate-spin" /> Processing…</> : <><Upload size={15} /> Upload & Extract</>}
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
};

// ── Main Page ──────────────────────────────────────────────────────────────────

const COMPANIES = ['SEC', 'Aramco', 'Sabic', 'Hadeed', 'Maaden', 'Marafic'];

const FileProcessed = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [user, setUser] = useState(null);
    const [tab, setTab] = useState('uploads');        // 'uploads' | 'automation'
    const [notification, setNotification] = useState(null);
    const [uploadModal, setUploadModal] = useState(false);
    const { hasPermission } = usePermissions();
    const navigate = useNavigate();

    // ── Uploaded documents state ───────────────────────────────────────────────
    const [docs, setDocs] = useState([]);
    const [docTotal, setDocTotal] = useState(0);
    const [docPage, setDocPage] = useState(1);
    const [docSearch, setDocSearch] = useState('');
    const [docLoading, setDocLoading] = useState(false);

    // ── Automation files state ─────────────────────────────────────────────────
    const [files, setFiles] = useState([]);
    const [filesPage, setFilesPage] = useState(1);
    const [filesSearch, setFilesSearch] = useState('');
    const [isAutomationRunning, setIsAutomationRunning] = useState(false);
    const latestIdRef = useRef(null);
    const filesPerPage = 10;

    const notify = (message, type = 'success') => setNotification({ message, type });

    // ── Fetch current user ─────────────────────────────────────────────────────
    useEffect(() => {
        const t = token();
        if (!t) { navigate('/login'); return; }
        authFetch('/users/me').then(r => r.ok && r.json()).then(d => d && setUser(d));
    }, []);

    // ── Documents ──────────────────────────────────────────────────────────────
    const fetchDocs = useCallback(async () => {
        if (!hasPermission('files.view')) return;
        setDocLoading(true);
        try {
            const p = new URLSearchParams({ page: docPage, per_page: 15 });
            if (docSearch) p.set('search', docSearch);
            const res = await authFetch(`/documents?${p}`);
            if (res.ok) {
                const data = await res.json();
                setDocs(data.documents);
                setDocTotal(data.total);
            }
        } finally { setDocLoading(false); }
    }, [docPage, docSearch, hasPermission]);

    useEffect(() => { if (tab === 'uploads') fetchDocs(); }, [tab, fetchDocs]);

    const openDetail = (doc) => navigate(`/viewer/${doc.id}`);

    const deleteDoc = async (doc) => {
        if (!confirm(`Delete "${doc.original_filename}"?`)) return;
        const res = await authFetch(`/documents/${doc.id}`, { method: 'DELETE' });
        if (res.ok) { notify('Document deleted'); fetchDocs(); }
        else notify('Failed to delete', 'error');
    };

    // ── Automation files ───────────────────────────────────────────────────────
    const fetchFiles = useCallback(async () => {
        const res = await authFetch('/automation/files');
        if (res.ok) {
            const data = await res.json();
            if (data.length > 0) {
                const maxId = Math.max(...data.map(f => f.id));
                if (latestIdRef.current && maxId > latestIdRef.current) {
                    const newest = data.find(f => f.id === maxId);
                    if (newest) notify(`Processed: ${newest.filename}`, newest.status === 'Exception' ? 'error' : 'success');
                }
                latestIdRef.current = maxId;
            }
            setFiles(data);
        }
    }, []);

    useEffect(() => {
        authFetch('/automation/status').then(r => r.ok && r.json()).then(d => d && setIsAutomationRunning(d.running));
        fetchFiles();
        const iv = setInterval(fetchFiles, 5000);
        return () => clearInterval(iv);
    }, [fetchFiles]);

    const toggleAutomation = async (e) => {
        const running = e.target.checked;
        setIsAutomationRunning(running);
        await authFetch(`/automation/${running ? 'start' : 'stop'}`, { method: 'POST' });
        notify(`Automation ${running ? 'started' : 'stopped'}`);
    };

    const filteredFiles = files.filter(f =>
        (f.filename?.toLowerCase() || '').includes(filesSearch.toLowerCase())
    );
    const totalFilePages = Math.max(1, Math.ceil(filteredFiles.length / filesPerPage));
    const visibleFiles = filteredFiles.slice((filesPage - 1) * filesPerPage, filesPage * filesPerPage);
    const docPages = Math.max(1, Math.ceil(docTotal / 15));

    return (
        <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900">
            <Sidebar isOpen={isSidebarOpen} user={user} />
            <div className={`flex-1 transition-[margin] duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-0'}`}>
                <Header
                    title="DATA EXTRACTION MANAGEMENT"
                    onToggleSidebar={() => setIsSidebarOpen(p => !p)}
                    extraAction={<UserMenu user={user} />}
                />

                <main className="p-8 max-w-[1920px] mx-auto">
                    <AnimatePresence>
                        {notification && <Toast message={notification.message} type={notification.type} onClose={() => setNotification(null)} />}
                    </AnimatePresence>

                    {/* Page header */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                        <div>
                            <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Data Extraction</h2>
                            <p className="text-slate-500 mt-1">Upload RFQ documents to extract fields and line items automatically</p>
                        </div>
                        <PermissionGate permission="files.upload">
                            <button
                                onClick={() => setUploadModal(true)}
                                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg font-medium text-sm shadow-sm transition-colors"
                            >
                                <Upload size={16} /> Upload Document
                            </button>
                        </PermissionGate>
                    </div>

                    {/* Tabs */}
                    <div className="flex gap-1 mb-6 bg-slate-100 p-1 rounded-xl w-fit">
                        {[
                            { key: 'uploads',    label: 'Uploaded Documents', count: docTotal },
                            { key: 'automation', label: 'Automation Files',   count: files.length },
                        ].map(t => (
                            <button
                                key={t.key}
                                onClick={() => setTab(t.key)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                                    tab === t.key
                                        ? 'bg-white text-slate-800 shadow-sm'
                                        : 'text-slate-500 hover:text-slate-700'
                                }`}
                            >
                                {t.label}
                                <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${tab === t.key ? 'bg-blue-100 text-blue-700' : 'bg-slate-200 text-slate-500'}`}>
                                    {t.count}
                                </span>
                            </button>
                        ))}
                    </div>

                    {/* ── Uploaded Documents Tab ──────────────────────────────────────────── */}
                    {tab === 'uploads' && (
                        <PermissionGate
                            permission="files.view"
                            fallback={
                                <div className="text-center py-20 text-slate-400">
                                    <FileText size={40} className="mx-auto mb-3 text-slate-300" />
                                    <p>You don't have permission to view uploaded documents.</p>
                                </div>
                            }
                        >
                            {/* Search bar */}
                            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-4 flex items-center gap-4">
                                <div className="relative flex-1 max-w-sm">
                                    <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input
                                        type="text" placeholder="Search by filename, RFQ number, account…"
                                        value={docSearch}
                                        onChange={e => { setDocSearch(e.target.value); setDocPage(1); }}
                                        className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                                    />
                                </div>
                                <button onClick={fetchDocs} className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 bg-white rounded-lg border border-slate-200 transition-all">
                                    <RefreshCw size={16} className={docLoading ? 'animate-spin' : ''} />
                                </button>
                            </div>

                            {/* Documents table */}
                            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                                <th className="px-5 py-3">File</th>
                                                <th className="px-5 py-3">RFQ No.</th>
                                                <th className="px-5 py-3">Account</th>
                                                <th className="px-5 py-3">Supplier</th>
                                                <th className="px-5 py-3 text-right">Total Amount</th>
                                                <th className="px-5 py-3 text-center">Items</th>
                                                <th className="px-5 py-3">Status</th>
                                                <th className="px-5 py-3">Uploaded</th>
                                                <th className="px-5 py-3 text-center">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="text-sm divide-y divide-slate-100">
                                            {docs.length === 0 && !docLoading ? (
                                                <tr>
                                                    <td colSpan={9} className="px-5 py-16 text-center text-slate-400">
                                                        <div className="flex flex-col items-center gap-3">
                                                            <CloudUpload size={36} className="text-slate-300" />
                                                            <p>No documents uploaded yet.</p>
                                                            <PermissionGate permission="files.upload">
                                                                <button onClick={() => setUploadModal(true)} className="text-blue-600 text-sm hover:underline">
                                                                    Upload your first document →
                                                                </button>
                                                            </PermissionGate>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ) : docs.map(doc => (
                                                <tr key={doc.id} className="hover:bg-blue-50/20 transition-colors group">
                                                    <td className="px-5 py-3.5">
                                                        <div className="flex items-center gap-2">
                                                            <span className="p-1.5 bg-blue-50 text-blue-600 rounded">
                                                                <LayoutDashboard size={14} />
                                                            </span>
                                                            <span className="font-medium text-slate-800 truncate max-w-[180px]" title={doc.original_filename}>
                                                                {doc.original_filename}
                                                            </span>
                                                        </div>
                                                        <p className="text-xs text-slate-400 ml-8 mt-0.5">{doc.file_type?.toUpperCase()} · {doc.file_size ? `${(doc.file_size / 1024).toFixed(0)} KB` : ''}</p>
                                                    </td>
                                                    <td className="px-5 py-3.5 font-mono text-xs text-slate-700">{doc.rfq_number ?? '—'}</td>
                                                    <td className="px-5 py-3.5 text-slate-700">{doc.account ?? '—'}</td>
                                                    <td className="px-5 py-3.5 text-slate-500">{doc.supplier ?? '—'}</td>
                                                    <td className="px-5 py-3.5 text-right font-medium text-slate-800">
                                                        {doc.total_amount != null ? `${doc.currency} ${Number(doc.total_amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}` : '—'}
                                                    </td>
                                                    <td className="px-5 py-3.5 text-center">
                                                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                                                            {doc.total_line_items}
                                                        </span>
                                                    </td>
                                                    <td className="px-5 py-3.5"><StatusBadge status={doc.status} /></td>
                                                    <td className="px-5 py-3.5 text-slate-400 text-xs whitespace-nowrap">
                                                        {new Date(doc.uploaded_at).toLocaleString()}
                                                    </td>
                                                    <td className="px-5 py-3.5">
                                                        <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <button onClick={() => openDetail(doc)} title="View line items" className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors">
                                                                <Eye size={15} />
                                                            </button>
                                                            <PermissionGate permission="files.delete">
                                                                <button onClick={() => deleteDoc(doc)} title="Delete" className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors">
                                                                    <Trash2 size={15} />
                                                                </button>
                                                            </PermissionGate>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Pagination */}
                                <div className="px-5 py-3.5 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
                                    <span className="text-xs text-slate-500">{docTotal} documents total</span>
                                    <div className="flex gap-1.5">
                                        <button onClick={() => setDocPage(p => Math.max(1, p - 1))} disabled={docPage === 1} className="p-1.5 border border-slate-200 rounded-lg hover:bg-white disabled:opacity-40 transition-all">
                                            <ChevronLeft size={15} />
                                        </button>
                                        <span className="px-3 py-1.5 text-xs text-slate-500">Page {docPage} of {docPages}</span>
                                        <button onClick={() => setDocPage(p => Math.min(docPages, p + 1))} disabled={docPage === docPages} className="p-1.5 border border-slate-200 rounded-lg hover:bg-white disabled:opacity-40 transition-all">
                                            <ChevronRight size={15} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </PermissionGate>
                    )}

                    {/* ── Automation Files Tab ────────────────────────────────────────────── */}
                    {tab === 'automation' && (
                        <>
                            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                                <div className="relative w-full sm:w-72">
                                    <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input
                                        type="text" placeholder="Search files…"
                                        value={filesSearch}
                                        onChange={e => { setFilesSearch(e.target.value); setFilesPage(1); }}
                                        className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                                    />
                                </div>
                                <label className={`relative inline-flex items-center cursor-pointer p-1 rounded-full border transition-all ${isAutomationRunning ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-50 border-slate-200'}`}>
                                    <input type="checkbox" className="sr-only peer" checked={isAutomationRunning} onChange={toggleAutomation} />
                                    <div className={`w-11 h-6 rounded-full peer transition-all ${isAutomationRunning ? 'bg-emerald-500' : 'bg-slate-300'} peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[6px] after:left-[6px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all shadow-sm`}></div>
                                    <span className={`ml-3 mr-2 text-sm font-medium ${isAutomationRunning ? 'text-emerald-700' : 'text-slate-500'}`}>
                                        {isAutomationRunning ? 'Live Processing' : 'Processing Paused'}
                                    </span>
                                </label>
                            </div>

                            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                                <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                                    <span className="text-sm font-medium text-slate-600">Total {files.length} Files</span>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                                <th className="p-4">Case ID</th>
                                                <th className="p-4">File Name</th>
                                                <th className="p-4">Uploaded</th>
                                                <th className="p-4">Completed</th>
                                                <th className="p-4">Processing Time</th>
                                                <th className="p-4 text-center">Status</th>
                                                <th className="p-4 text-center">Validation</th>
                                            </tr>
                                        </thead>
                                        <tbody className="text-sm divide-y divide-slate-100">
                                            {visibleFiles.length === 0 ? (
                                                <tr><td colSpan={7} className="p-12 text-center text-slate-400">No automation files found.</td></tr>
                                            ) : visibleFiles.map(f => (
                                                <tr key={f.id} className="hover:bg-blue-50/30 transition-colors">
                                                    <td className="p-4 font-mono text-xs font-medium text-slate-500">{f.id}</td>
                                                    <td className="p-4 font-medium text-slate-900 flex items-center gap-2">
                                                        <span className="p-1.5 bg-blue-50 text-blue-600 rounded"><LayoutDashboard size={14} /></span>
                                                        {f.filename}
                                                    </td>
                                                    <td className="p-4 text-slate-500 whitespace-nowrap">{new Date(f.uploaded_at).toLocaleString()}</td>
                                                    <td className="p-4 text-slate-500 whitespace-nowrap">{f.completed_at ? new Date(f.completed_at).toLocaleString() : '—'}</td>
                                                    <td className="p-4 text-slate-500 font-mono text-xs">{f.processed_time}</td>
                                                    <td className="p-4 text-center"><StatusBadge status={f.status} /></td>
                                                    <td className="p-4 text-center">
                                                        <div className={`flex justify-center ${f.validation ? 'text-emerald-500' : 'text-slate-300'}`}>
                                                            <CheckCircle size={18} className={f.validation ? 'fill-emerald-50' : ''} />
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                <div className="px-5 py-3.5 border-t border-slate-100 flex items-center justify-between">
                                    <span className="text-xs text-slate-500">Page {filesPage} of {totalFilePages}</span>
                                    <div className="flex gap-1.5">
                                        <button onClick={() => setFilesPage(p => Math.max(1, p - 1))} disabled={filesPage === 1} className="p-1.5 border border-slate-200 rounded-lg hover:bg-white disabled:opacity-40">
                                            <ChevronLeft size={15} />
                                        </button>
                                        <button onClick={() => setFilesPage(p => Math.min(totalFilePages, p + 1))} disabled={filesPage === totalFilePages} className="p-1.5 border border-slate-200 rounded-lg hover:bg-white disabled:opacity-40">
                                            <ChevronRight size={15} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </main>
            </div>

            {/* Modals */}
            <AnimatePresence>
                {uploadModal && (
                    <UploadModal
                        onClose={() => setUploadModal(false)}
                        onUploaded={(doc) => {
                            notify(`Extracted ${doc.total_line_items} line items from ${doc.original_filename}`);
                            setTab('uploads');
                            fetchDocs();
                        }}
                    />
                )}
            </AnimatePresence>

        </div>
    );
};

export default FileProcessed;
