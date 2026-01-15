import React from 'react';
import { ACCOUNTS } from '../../data/mockData';
import { Calendar, Filter } from 'lucide-react';

const FilterBar = ({ selectedAccount, onAccountChange }) => {
    return (
        <div className="flex flex-wrap items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-slate-100 mb-6">

            {/* Account Selector */}
            <div className="flex items-center gap-2">
                <label className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Account</label>
                <select
                    value={selectedAccount}
                    onChange={(e) => onAccountChange(e.target.value)}
                    className="bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-48 p-2.5 font-medium"
                >
                    {ACCOUNTS.map(acc => (
                        <option key={acc} value={acc}>{acc}</option>
                    ))}
                </select>
            </div>

            <div className="h-6 w-px bg-slate-200 mx-2 hidden md:block"></div>

            {/* Date Range Placeholders */}
            <div className="flex items-center gap-2">
                <span className="text-slate-400"><Calendar size={18} /></span>
                <div className="flex items-center gap-2 text-sm">
                    <span className="text-slate-600">From:</span>
                    <input type="date" className="bg-slate-50 border border-slate-200 rounded px-2 py-1 text-slate-700" />
                    <span className="text-slate-600">To:</span>
                    <input type="date" className="bg-slate-50 border border-slate-200 rounded px-2 py-1 text-slate-700" />
                </div>
            </div>

            <div className="ml-auto">
                <button className="flex items-center gap-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-lg transition-colors">
                    <Filter size={18} />
                    More Filters
                </button>
            </div>

        </div>
    );
};

export default FilterBar;
