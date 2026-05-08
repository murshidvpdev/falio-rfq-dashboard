import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, FileText, User, Calendar, DollarSign, Tag } from 'lucide-react';

const STATUS_STYLES = {
    Won:     'bg-emerald-50 text-emerald-700 border-emerald-100',
    Lost:    'bg-red-50 text-red-700 border-red-100',
    Pending: 'bg-sky-50 text-sky-700 border-sky-100',
};

const DetailField = ({ icon: Icon, label, value }) => (
    <div className="flex items-start gap-3">
        <div className="p-1.5 bg-slate-100 rounded-lg mt-0.5 flex-shrink-0">
            <Icon size={15} className="text-slate-500" />
        </div>
        <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{label}</p>
            <p className="mt-0.5 font-medium text-slate-800">{value}</p>
        </div>
    </div>
);

const RFQDetailsModal = ({ rfq, onClose }) => {
    return (
        <AnimatePresence>
            {rfq && (
                <motion.div
                    key="backdrop"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    onClick={onClose}
                >
                    <motion.div
                        key="modal"
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        transition={{ duration: 0.2, ease: 'easeOut' }}
                        className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200"
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="flex justify-between items-center p-6 border-b border-slate-100 sticky top-0 bg-white z-10">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-blue-50 rounded-xl text-blue-600">
                                    <FileText size={20} />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-slate-800">{rfq.id}</h2>
                                    <p className="text-xs text-slate-500">RFQ Details</p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-400 hover:text-slate-600"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="p-6 space-y-6">

                            {/* Status row */}
                            <div className="grid grid-cols-2 gap-4 bg-slate-50 p-5 rounded-xl border border-slate-100">
                                <div>
                                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Status</p>
                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${STATUS_STYLES[rfq.status] ?? STATUS_STYLES.Pending}`}>
                                        {rfq.status}
                                    </span>
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Account</p>
                                    <p className="text-base font-semibold text-slate-800">{rfq.account}</p>
                                </div>
                            </div>

                            {/* Key fields */}
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                                <DetailField icon={Calendar} label="Date Received" value={rfq.date} />
                                <DetailField icon={DollarSign} label="Total Value" value={`$${Number(rfq.amount).toLocaleString()}`} />
                                <DetailField icon={User} label="Assignee" value="John Doe" />
                            </div>

                            {/* Line items */}
                            <div>
                                <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                                    <Tag size={16} className="text-slate-400" />
                                    Line Items
                                </h3>
                                <div className="rounded-xl border border-slate-200 overflow-hidden">
                                    <table className="w-full text-sm text-left border-collapse">
                                        <thead>
                                            <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                                <th className="px-4 py-3">Item #</th>
                                                <th className="px-4 py-3">Description</th>
                                                <th className="px-4 py-3 text-right">Qty</th>
                                                <th className="px-4 py-3 text-right">Unit Price</th>
                                                <th className="px-4 py-3 text-right">Total</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {[1, 2, 3].map((item) => (
                                                <tr key={item} className="hover:bg-slate-50/50 transition-colors">
                                                    <td className="px-4 py-3 font-mono text-xs text-slate-500">{item}001</td>
                                                    <td className="px-4 py-3 font-medium text-slate-800">Industrial Pump Component Type {item}</td>
                                                    <td className="px-4 py-3 text-right text-slate-600">5</td>
                                                    <td className="px-4 py-3 text-right text-slate-600">$1,200</td>
                                                    <td className="px-4 py-3 text-right font-medium text-slate-800">$6,000</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-5 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3 rounded-b-2xl">
                            <button
                                onClick={onClose}
                                className="px-4 py-2 text-slate-600 hover:bg-slate-200 rounded-lg transition-colors font-medium text-sm border border-slate-200"
                            >
                                Close
                            </button>
                            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm shadow-sm">
                                Edit RFQ
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default RFQDetailsModal;
