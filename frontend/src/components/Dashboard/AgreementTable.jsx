import React from 'react';
import { FileText, ChevronsUpDown } from 'lucide-react';

const SortTh = ({ children, center, right }) => (
    <th className={`px-4 py-3 ${center ? 'text-center' : right ? 'text-right' : ''}`}>
        <span className="inline-flex items-center gap-1">
            {children}
            <ChevronsUpDown size={12} className="text-slate-400 flex-shrink-0" />
        </span>
    </th>
);

const AgreementTable = ({ data }) => {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">

            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3 bg-slate-50/50">
                <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                    <FileText size={18} />
                </div>
                <div>
                    <h3 className="text-base font-semibold text-slate-800">Agreement Status Summary</h3>
                    <p className="text-xs text-slate-500 mt-0.5">{data.length} agreements</p>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                            <SortTh center>S.No.</SortTh>
                            <SortTh>Agreement #</SortTh>
                            <SortTh center>No. of Items</SortTh>
                            <SortTh>Validity Start</SortTh>
                            <SortTh>Validity End</SortTh>
                            <SortTh>Total Value</SortTh>
                            <SortTh right>Est. Annual Vol.</SortTh>
                            <SortTh right>Released Value</SortTh>
                            <SortTh center>No. of PO</SortTh>
                            <SortTh>Delivery Term</SortTh>
                            <SortTh right>Version</SortTh>
                            <SortTh center>Status</SortTh>
                        </tr>
                    </thead>
                    <tbody className="text-sm divide-y divide-slate-100">
                        {data.map((row, index) => (
                            <tr key={row.id} className="hover:bg-blue-50/20 transition-colors duration-100 group">
                                <td className="px-4 py-3.5 text-center text-slate-400 text-xs font-mono">{index + 1}</td>
                                <td className="px-4 py-3.5 font-medium text-slate-800">{row.agreementNo || '—'}</td>
                                <td className="px-4 py-3.5 text-center text-slate-700">{row.noOfItems}</td>
                                <td className="px-4 py-3.5 text-slate-500 whitespace-nowrap">{row.validityStart || '—'}</td>
                                <td className="px-4 py-3.5 text-slate-500 whitespace-nowrap">{row.validityEnd || '—'}</td>
                                <td className="px-4 py-3.5 text-slate-700">{row.totalValue || '—'}</td>
                                <td className="px-4 py-3.5 text-right font-medium text-slate-800">{row.estVolume || '—'}</td>
                                <td className="px-4 py-3.5 text-right font-medium text-slate-800">{row.releasedValue || '—'}</td>
                                <td className="px-4 py-3.5 text-center text-slate-700">{row.noOfPO || '—'}</td>
                                <td className="px-4 py-3.5 text-slate-500">{row.term || '—'}</td>
                                <td className="px-4 py-3.5 text-right text-slate-700 font-mono text-xs">{row.version || '—'}</td>
                                <td className="px-4 py-3.5 text-center">
                                    {row.status ? (
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border bg-emerald-50 text-emerald-700 border-emerald-100">
                                            {row.status}
                                        </span>
                                    ) : (
                                        <span className="text-slate-300 text-xs">—</span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Footer */}
            <div className="px-6 py-3.5 border-t border-slate-100 bg-slate-50/50 flex justify-end">
                <div className="flex gap-1.5">
                    {['«', '1', '2', '3', '4', '»'].map((label, i) => (
                        <button
                            key={label}
                            className={`w-8 h-8 rounded-lg text-xs font-medium transition-all border ${
                                label === '1'
                                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                            }`}
                        >
                            {label}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AgreementTable;
