import React, { useState } from 'react';
import { Search } from 'lucide-react';
import RFQDetailsModal from './RFQDetailsModal';

const STATUS_STYLES = {
    Won:     'bg-emerald-50 text-emerald-700 border-emerald-100',
    Lost:    'bg-red-50 text-red-700 border-red-100',
    Pending: 'bg-sky-50 text-sky-700 border-sky-100',
};

const BiddingTable = ({ data }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedRFQ, setSelectedRFQ] = useState(null);
    const rowsPerPage = 10;

    const filtered = data.filter(item =>
        item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.supplier || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalPages = Math.ceil(filtered.length / rowsPerPage);
    const start = (currentPage - 1) * rowsPerPage;
    const visible = filtered.slice(start, start + rowsPerPage);

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1);
    };

    return (
        <>
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">

                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50">
                    <div>
                        <h3 className="text-base font-semibold text-slate-800">Bidding Stage Result Summary</h3>
                        <p className="text-xs text-slate-500 mt-0.5">{filtered.length} entries</p>
                    </div>
                    <div className="relative w-full sm:w-64">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search size={15} className="text-slate-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search RFQ, supplier, status..."
                            value={searchTerm}
                            onChange={handleSearch}
                            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                        />
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                <th className="px-6 py-3">RFQ No.</th>
                                <th className="px-6 py-3">Bid Date</th>
                                <th className="px-6 py-3">Supplier</th>
                                <th className="px-6 py-3">Status</th>
                                <th className="px-6 py-3 text-right">Amount Quoted</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm divide-y divide-slate-100">
                            {visible.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-slate-400 text-sm">
                                        No results match your search.
                                    </td>
                                </tr>
                            ) : visible.map((item) => (
                                <tr
                                    key={item.id}
                                    onClick={() => setSelectedRFQ(item)}
                                    className="hover:bg-blue-50/30 transition-colors duration-100 cursor-pointer group"
                                >
                                    <td className="px-6 py-3.5 font-mono text-xs font-medium text-slate-700">{item.id}</td>
                                    <td className="px-6 py-3.5 text-slate-500 whitespace-nowrap">{item.date}</td>
                                    <td className="px-6 py-3.5 text-slate-700">{item.supplier || '—'}</td>
                                    <td className="px-6 py-3.5">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${STATUS_STYLES[item.status] ?? STATUS_STYLES.Pending}`}>
                                            {item.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-3.5 text-right font-medium text-slate-800">
                                        ${Number(item.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Footer / Pagination */}
                <div className="px-6 py-3.5 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <span className="text-xs text-slate-500">
                        Showing <span className="font-medium text-slate-700">{filtered.length > 0 ? start + 1 : 0}</span>–<span className="font-medium text-slate-700">{Math.min(start + rowsPerPage, filtered.length)}</span> of <span className="font-medium text-slate-700">{filtered.length}</span>
                    </span>
                    <div className="flex gap-1.5">
                        <button
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-medium text-slate-600 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                        >
                            Previous
                        </button>
                        {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(n => (
                            <button
                                key={n}
                                onClick={() => setCurrentPage(n)}
                                className={`w-8 h-8 rounded-lg text-xs font-medium transition-all ${
                                    currentPage === n
                                        ? 'bg-blue-600 text-white shadow-sm'
                                        : 'text-slate-600 hover:bg-white border border-transparent hover:border-slate-200'
                                }`}
                            >
                                {n}
                            </button>
                        ))}
                        <button
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages || totalPages === 0}
                            className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-medium text-slate-600 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>

            <RFQDetailsModal rfq={selectedRFQ} onClose={() => setSelectedRFQ(null)} />
        </>
    );
};

export default BiddingTable;
