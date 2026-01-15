import React, { useState } from 'react';
import { Search } from 'lucide-react';

const BiddingTable = ({ data }) => {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredData = data.filter(item =>
        item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.status.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="card flex flex-col">
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
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
                        {filteredData.slice(0, 10).map((row, index) => (
                            <tr key={index} className="bg-white border-b border-slate-100 hover:bg-slate-50">
                                <td className="px-6 py-4 font-medium text-slate-900">{row.id}</td>
                                <td className="px-6 py-4 text-slate-500">{row.date}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded text-xs font-semibold ${row.status === 'Won' ? 'bg-green-100 text-green-700' :
                                            row.status === 'Lost' ? 'bg-red-100 text-red-700' :
                                                'bg-yellow-100 text-yellow-700'
                                        }`}>
                                        {row.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right font-medium text-slate-900">{row.amount}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <div className="mt-4 text-xs text-slate-400 text-center">Showing top 10 results</div>
            </div>
        </div>
    );
};

export default BiddingTable;
