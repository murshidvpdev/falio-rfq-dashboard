import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, FileText, AlertCircle, Loader2, RotateCcw, Download } from 'lucide-react';
import { API_BASE } from '../config';

const token = () => localStorage.getItem('token');
const authFetch = (url, opts = {}) => fetch(`${API_BASE}${url}`, {
    ...opts,
    headers: { Authorization: `Bearer ${token()}`, ...(opts.headers ?? {}) },
});

// ── Field display ──────────────────────────────────────────────────────────────

const Field = ({ label, value, mono }) => (
    <div className="relative">
        <label className="absolute -top-2.5 left-3 bg-white px-1 text-xs font-semibold text-slate-400 uppercase tracking-wider z-10">
            {label}
        </label>
        <div className={`border border-slate-200 rounded-lg px-3 py-3 text-sm text-slate-800 min-h-[44px] bg-white ${mono ? 'font-mono' : ''}`}>
            {value || <span className="text-slate-300 italic">null</span>}
        </div>
    </div>
);

// ── Line items sub-table ───────────────────────────────────────────────────────

const LineItemsTable = ({ items }) => {
    if (!items?.length) return null;
    const fmt = (v) => v != null ? Number(v).toLocaleString(undefined, { minimumFractionDigits: 2 }) : '—';

    return (
        <div>
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                Line Items ({items.length})
            </h4>
            <div className="border border-slate-200 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200">
                                <th className="px-3 py-2.5 font-semibold text-slate-500 uppercase tracking-wider">#</th>
                                <th className="px-3 py-2.5 font-semibold text-slate-500 uppercase tracking-wider">Part No.</th>
                                <th className="px-3 py-2.5 font-semibold text-slate-500 uppercase tracking-wider">Description</th>
                                <th className="px-3 py-2.5 font-semibold text-slate-500 uppercase tracking-wider text-right">Qty</th>
                                <th className="px-3 py-2.5 font-semibold text-slate-500 uppercase tracking-wider">Unit</th>
                                <th className="px-3 py-2.5 font-semibold text-slate-500 uppercase tracking-wider text-right">Unit Price</th>
                                <th className="px-3 py-2.5 font-semibold text-slate-500 uppercase tracking-wider text-right">Total</th>
                                <th className="px-3 py-2.5 font-semibold text-slate-500 uppercase tracking-wider">Notes</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {items.map((li, i) => (
                                <tr key={li.id ?? i} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-3 py-2.5 text-slate-400 font-mono">{li.item_no ?? i + 1}</td>
                                    <td className="px-3 py-2.5 font-mono text-slate-600">{li.part_number ?? '—'}</td>
                                    <td className="px-3 py-2.5 text-slate-800 max-w-xs">{li.description ?? '—'}</td>
                                    <td className="px-3 py-2.5 text-right text-slate-700">{li.quantity != null ? li.quantity : '—'}</td>
                                    <td className="px-3 py-2.5 text-slate-500">{li.unit ?? '—'}</td>
                                    <td className="px-3 py-2.5 text-right text-slate-700">{li.unit_price != null ? fmt(li.unit_price) : '—'}</td>
                                    <td className="px-3 py-2.5 text-right font-semibold text-slate-800">{li.total_price != null ? fmt(li.total_price) : '—'}</td>
                                    <td className="px-3 py-2.5 text-slate-400">{li.notes ?? ''}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

// ── Main page ──────────────────────────────────────────────────────────────────

const DocumentViewer = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [doc, setDoc] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [fileUrl, setFileUrl] = useState(null);
    const [fileLoading, setFileLoading] = useState(false);

    // Fetch document metadata
    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                const res = await authFetch(`/documents/${id}`);
                if (!res.ok) throw new Error((await res.json()).detail ?? 'Failed to load');
                setDoc(await res.json());
            } catch (e) {
                setError(e.message);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [id]);

    // Fetch file blob for inline preview
    useEffect(() => {
        if (!doc) return;
        const loadFile = async () => {
            setFileLoading(true);
            try {
                const res = await authFetch(`/documents/${id}/file`);
                if (!res.ok) return;
                const blob = await res.blob();
                setFileUrl(URL.createObjectURL(blob));
            } finally {
                setFileLoading(false);
            }
        };
        loadFile();
        return () => { if (fileUrl) URL.revokeObjectURL(fileUrl); };
    }, [doc]);

    const downloadFile = () => {
        if (!fileUrl) return;
        const a = document.createElement('a');
        a.href = fileUrl;
        a.download = doc.original_filename;
        a.click();
    };

    if (loading) return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
            <Loader2 size={28} className="animate-spin text-blue-500" />
        </div>
    );

    if (error) return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-4">
            <AlertCircle size={36} className="text-red-400" />
            <p className="text-slate-600">{error}</p>
            <button onClick={() => navigate(-1)} className="text-blue-600 hover:underline text-sm">Go back</button>
        </div>
    );

    const isPDF = doc.file_type === 'pdf';

    // All fields in order — directly from proper DB columns
    const allFields = [
        { label: 'SEC RFQ#',       value: doc.rfq_number,   mono: true },
        { label: 'RFQ Case ID',    value: doc.rfq_case_id,  mono: true },
        { label: 'Received Date',  value: doc.issue_date },
        { label: 'Bid Date',       value: doc.due_date },
        { label: 'Address',        value: doc.address },
        { label: 'Owner',          value: doc.owner ?? doc.account },
        { label: 'Event Type',     value: doc.event_type },
        { label: 'Currency',       value: doc.currency },
        { label: 'Commodity',      value: doc.commodity },
        { label: 'Supplier',       value: doc.supplier },
        { label: 'Response ID',    value: doc.response_id },
        { label: 'PO ID',          value: doc.po_id },
        { label: 'PO Number',      value: doc.po_number },
        { label: 'Agreement No',   value: doc.agreement_no },
        { label: 'Contact',        value: doc.contact },
        { label: 'Phone',          value: doc.phone },
        { label: 'Email',          value: doc.email },
    ].filter(f => f.value !== undefined);

    return (
        <div className="min-h-screen bg-slate-900 flex flex-col">
            {/* Top bar */}
            <div className="bg-slate-800 border-b border-slate-700 px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 hover:bg-slate-700 rounded-lg text-slate-300 transition-colors"
                    >
                        <ArrowLeft size={18} />
                    </button>
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-slate-700 rounded text-slate-300">
                            <FileText size={16} />
                        </div>
                        <div>
                            <p className="text-white text-sm font-medium">{doc.original_filename}</p>
                            <p className="text-slate-400 text-xs">
                                {doc.file_size ? `${(doc.file_size / 1024).toFixed(1)} KB` : ''} · {doc.status}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {fileUrl && (
                        <button
                            onClick={downloadFile}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg transition-colors border border-slate-600"
                        >
                            <Download size={14} /> Download
                        </button>
                    )}
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                        doc.status === 'Completed' ? 'bg-emerald-900 text-emerald-300' :
                        doc.status === 'Failed'    ? 'bg-red-900 text-red-300' :
                                                     'bg-slate-700 text-slate-300'
                    }`}>
                        {doc.status}
                    </span>
                </div>
            </div>

            {/* Main split panel */}
            <div className="flex flex-1 overflow-hidden">

                {/* ── Left: Document preview ─────────────────────────────────────── */}
                <div className="flex-1 bg-slate-700 flex flex-col">
                    {fileLoading ? (
                        <div className="flex-1 flex items-center justify-center">
                            <Loader2 size={28} className="animate-spin text-slate-400" />
                        </div>
                    ) : fileUrl && isPDF ? (
                        <iframe
                            src={fileUrl}
                            className="flex-1 w-full border-none"
                            title={doc.original_filename}
                        />
                    ) : fileUrl ? (
                        // Non-PDF: show download prompt
                        <div className="flex-1 flex flex-col items-center justify-center gap-4 text-slate-300">
                            <div className="p-6 bg-slate-600 rounded-2xl">
                                <FileText size={48} className="text-slate-400" />
                            </div>
                            <p className="text-sm">{doc.file_type?.toUpperCase()} preview not available</p>
                            <button
                                onClick={downloadFile}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                            >
                                <Download size={16} /> Download to view
                            </button>
                        </div>
                    ) : (
                        <div className="flex-1 flex items-center justify-center text-slate-500 text-sm">
                            File not available
                        </div>
                    )}
                </div>

                {/* ── Right: Extracted fields ─────────────────────────────────────── */}
                <div className="w-80 xl:w-96 bg-white border-l border-slate-200 flex flex-col overflow-hidden">

                    {/* Panel header */}
                    <div className="px-4 py-3 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-slate-700">Text Fields</span>
                            <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-medium">
                                {allFields.filter(f => f.value).length}
                            </span>
                        </div>
                        {doc.total_amount != null && (
                            <span className="text-xs font-semibold text-slate-500">
                                Total: {doc.currency} {Number(doc.total_amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </span>
                        )}
                    </div>

                    {/* Scrollable fields */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {allFields.map(({ label, value, mono }) => (
                            <Field key={label} label={label} value={value} mono={mono} />
                        ))}

                        {/* Line items section */}
                        {doc.line_items?.length > 0 && (
                            <div className="pt-2 border-t border-slate-100">
                                <LineItemsTable items={doc.line_items} />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DocumentViewer;
