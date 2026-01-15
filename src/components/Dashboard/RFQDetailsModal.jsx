import React from 'react';
import { X, FileText, User, Calendar, DollarSign, Tag } from 'lucide-react';

const RFQDetailsModal = ({ rfq, onClose }) => {
    if (!rfq) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 shadow-2xl">
            <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 animate-in fade-in zoom-in duration-200">

                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-slate-100 sticky top-0 bg-white z-10">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
                            <FileText size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-800">{rfq.id}</h2>
                            <p className="text-sm text-slate-500">RFQ Details</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-600"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-8 space-y-8">

                    {/* Status & Validation */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-6 rounded-xl border border-slate-100">
                        <div>
                            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</span>
                            <div className={`mt-1 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium
                                ${rfq.status === 'Won' ? 'bg-green-100 text-green-700' :
                                    rfq.status === 'Lost' ? 'bg-red-100 text-red-700' :
                                        'bg-amber-100 text-amber-700'}`}>
                                {rfq.status}
                            </div>
                        </div>
                        <div>
                            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Account</span>
                            <p className="mt-1 text-lg font-medium text-slate-800">{rfq.account}</p>
                        </div>
                    </div>

                    {/* Key Info Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
                        <div className="flex items-start gap-3">
                            <Calendar className="text-slate-400 mt-1" size={18} />
                            <div>
                                <p className="text-sm text-slate-500">Date Received</p>
                                <p className="font-medium text-slate-700">{rfq.date}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <DollarSign className="text-slate-400 mt-1" size={18} />
                            <div>
                                <p className="text-sm text-slate-500">Total Value</p>
                                <p className="font-medium text-slate-700">${Number(rfq.amount).toLocaleString()}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <User className="text-slate-400 mt-1" size={18} />
                            <div>
                                <p className="text-sm text-slate-500">Assignee</p>
                                <p className="font-medium text-slate-700">John Doe</p>
                            </div>
                        </div>
                    </div>

                    {/* Line Items (Mock) */}
                    <div>
                        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <Tag size={20} className="text-slate-400" />
                            Line Items
                        </h3>
                        <div className="border rounded-lg overflow-hidden border-slate-200">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
                                    <tr>
                                        <th className="px-4 py-3">Item #</th>
                                        <th className="px-4 py-3">Description</th>
                                        <th className="px-4 py-3 text-right">Qty</th>
                                        <th className="px-4 py-3 text-right">Unit Price</th>
                                        <th className="px-4 py-3 text-right">Total</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {[1, 2, 3].map((item) => (
                                        <tr key={item} className="hover:bg-slate-50/50">
                                            <td className="px-4 py-3 text-slate-600">{item}001</td>
                                            <td className="px-4 py-3 text-slate-800 font-medium">Industrial Pump Component Type {item}</td>
                                            <td className="px-4 py-3 text-right text-slate-600">5</td>
                                            <td className="px-4 py-3 text-right text-slate-600">$1,200</td>
                                            <td className="px-4 py-3 text-right text-slate-800 font-medium">$6,000</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                </div>

                {/* Footer Actions */}
                <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 rounded-b-2xl">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-slate-600 hover:bg-slate-200 rounded-lg transition-colors font-medium">
                        Close
                    </button>
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm">
                        Edit RFQ
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RFQDetailsModal;
