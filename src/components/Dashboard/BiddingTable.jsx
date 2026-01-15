
import React, { useState } from 'react';
import { Search, Filter, MoreVertical, Eye } from 'lucide-react';
import RFQDetailsModal from './RFQDetailsModal';

const BiddingTable = ({ data }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedRFQ, setSelectedRFQ] = useState(null);

    const filteredData = data.filter(item =>
        item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.status.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                <h3 className="text-lg font-bold text-slate-800">Bidding Stage Result Summary</h3>
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Search..."
                        className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
                        <tr>
                            <th className="px-6 py-3 font-medium">RFQ NO</th>
                            <th className="px-6 py-3 font-medium">BID DATE</th>
                            <th className="px-6 py-3 font-medium">STATUS</th>
                            <th className="px-6 py-3 font-medium text-right">AMOUNT QUOTED</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredData.slice(0, 10).map((item, index) => (
                            <tr
                                key={item.id}
                                onClick={() => setSelectedRFQ(item)}
                                className="hover:bg-blue-50/50 transition-colors border-b border-slate-50 last:border-0 cursor-pointer group"
                            >
                                <td className="px-6 py-4 font-medium text-slate-900">{item.id}</td>
                                <td className="px-6 py-4 text-slate-500">{item.date}</td>
                                <td className="px-6 py-4">
                                    <span className={`px - 2 py - 1 rounded text - xs font - semibold ${item.status === 'Won' ? 'bg-green-100 text-green-700' :
                                            item.status === 'Lost' ? 'bg-red-100 text-red-700' :
                                                'bg-yellow-100 text-yellow-700'
                                        } `}>
                                        {item.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right font-medium text-slate-900">{item.amount}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-between items-center text-sm text-slate-500">
                <span>Showing 10 of 50 entries</span>
                <div className="flex gap-2">
                    <button className="px-3 py-1 border border-slate-200 rounded hover:bg-white disabled:opacity-50">Previous</button>
                    <button className="px-3 py-1 border border-slate-200 rounded hover:bg-white">Next</button>
                </div>
            </div>

            <RFQDetailsModal
                rfq={selectedRFQ}
                onClose={() => setSelectedRFQ(null)}
            />
        </div>
    );
};

export default BiddingTable;

