import React, { useState, useRef, useEffect } from 'react';
import { Calendar, Filter, X, ChevronDown } from 'lucide-react';

const FilterBar = ({
    accounts = [],
    selectedAccount,
    onAccountChange,
    selectedType,
    onTypeChange,
    startDate,
    endDate,
    onDateChange,
    supplierName,
    onSupplierNameChange,
    minPrice,
    onMinPriceChange,
    maxPrice,
    onMaxPriceChange,
}) => {
    const [isMoreFiltersOpen, setIsMoreFiltersOpen] = useState(false);
    const filterRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (filterRef.current && !filterRef.current.contains(event.target)) {
                setIsMoreFiltersOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);


    return (
        <div className="flex flex-wrap items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-slate-100 mb-6 relative z-20">

            {/* Account Selector */}
            <div className="flex items-center gap-2">
                <label className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Account</label>
                <select
                    value={selectedAccount}
                    onChange={(e) => onAccountChange(e.target.value)}
                    className="bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-48 p-2.5 font-medium"
                >
                    {accounts.map(acc => (
                        <option key={acc} value={acc}>{acc}</option>
                    ))}
                </select>
            </div>

            <div className="h-6 w-px bg-slate-200 mx-2 hidden md:block"></div>

            {/* Type Selector (Direct / Agreement) */}
            <div className="flex items-center gap-2">
                <label className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Type</label>
                <select
                    value={selectedType}
                    onChange={(e) => onTypeChange(e.target.value)}
                    className="bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-32 p-2.5 font-medium"
                >
                    <option value="Direct">Direct</option>
                    <option value="Agreement">Agreement</option>
                </select>
            </div>

            <div className="h-6 w-px bg-slate-200 mx-2 hidden md:block"></div>

            {/* Date Range Selector */}
            <div className="flex items-center gap-2">
                <label className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Date Range</label>
                <div className="flex items-center gap-2">
                    <span className="text-slate-400"><Calendar size={18} /></span>
                    <input
                        type="date"
                        value={startDate}
                        onChange={(e) => onDateChange('start', e.target.value)}
                        className="bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 font-medium"
                    />
                    <span className="text-slate-400 font-medium">-</span>
                    <input
                        type="date"
                        value={endDate}
                        onChange={(e) => onDateChange('end', e.target.value)}
                        className="bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 font-medium"
                    />
                </div>
            </div>

            <div className="ml-auto relative" ref={filterRef}>
                <button
                    onClick={() => setIsMoreFiltersOpen(!isMoreFiltersOpen)}
                    className={`flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-lg transition-colors border ${isMoreFiltersOpen ? 'bg-blue-100 text-blue-700 border-blue-200' : 'text-slate-600 bg-white border-slate-200 hover:bg-slate-50'}`}
                >
                    <Filter size={18} />
                    More Filters
                    <ChevronDown size={14} className={`transition-transform ${isMoreFiltersOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {isMoreFiltersOpen && (
                    <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-xl shadow-lg border border-slate-100 p-4 z-50">
                        <div className="flex justify-between items-center mb-4">
                            <h4 className="font-semibold text-slate-800">Additional Filters</h4>
                            <button onClick={() => setIsMoreFiltersOpen(false)} className="text-slate-400 hover:text-slate-600">
                                <X size={16} />
                            </button>
                        </div>

                        <div className="space-y-4">
                            {/* Supplier Name */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Supplier Name</label>
                                <input
                                    type="text"
                                    value={supplierName}
                                    onChange={(e) => onSupplierNameChange(e.target.value)}
                                    placeholder="Enter supplier name..."
                                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2.5"
                                />
                            </div>

                            {/* Price Range */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Quote Price Range</label>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="number"
                                        value={minPrice}
                                        onChange={(e) => onMinPriceChange(e.target.value)}
                                        placeholder="Min"
                                        className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2.5"
                                    />
                                    <span className="text-slate-400">-</span>
                                    <input
                                        type="number"
                                        value={maxPrice}
                                        onChange={(e) => onMaxPriceChange(e.target.value)}
                                        placeholder="Max"
                                        className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2.5"
                                    />
                                </div>
                            </div>

                        </div>
                    </div>
                )}
            </div>

        </div>
    );
};

export default FilterBar;
