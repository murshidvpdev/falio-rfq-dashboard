import React, { useState, useEffect, useRef } from 'react';
import Header from '../components/Layout/Header';
import Sidebar from '../components/Layout/Sidebar';
import UserMenu from '../components/Layout/UserMenu';
import Toast from '../components/UI/Toast';
import { Search, Download, Trash2, Edit, CheckCircle, RefreshCw, Filter, MoreHorizontal } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';

const FileProcessed = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [selectedType, setSelectedType] = useState('Direct');
    const [selectedCompany, setSelectedCompany] = useState('SEC');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [files, setFiles] = useState([]);
    const [entriesPerPage, setEntriesPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const [sortConfig, setSortConfig] = useState({ key: 'uploaded_at', direction: 'descending' });
    const [user, setUser] = useState(null);
    const [isAutomationRunning, setIsAutomationRunning] = useState(false);
    const [notification, setNotification] = useState(null);
    const [selectedItems, setSelectedItems] = useState([]);

    const latestFileIdRef = useRef(null);
    const navigate = useNavigate();

    const fetchFiles = async () => {
        try {
            const response = await fetch('http://localhost:8000/automation/files');
            if (response.ok) {
                const data = await response.json();

                // Check for new files if we have previous data
                if (data.length > 0) {
                    // Assuming data is sorted by id desc or similar, find max ID
                    const maxId = Math.max(...data.map(f => f.id));
                    if (latestFileIdRef.current && maxId > latestFileIdRef.current) {
                        const newestFile = data.find(f => f.id === maxId);
                        if (newestFile) {
                            setNotification({
                                message: `Processed: ${newestFile.filename}`,
                                type: newestFile.status === 'Exception' ? 'error' : 'success'
                            });
                        }
                    }
                    latestFileIdRef.current = maxId;
                }

                setFiles(data);
            }
        } catch (error) {
            console.error("Failed to fetch files", error);
        }
    };

    useEffect(() => {
        const init = async () => {
            const token = localStorage.getItem('token');
            if (!token) return;

            try {
                // Fetch User
                const userRes = await fetch('http://localhost:8000/users/me', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (userRes.ok) setUser(await userRes.json());

                // Fetch Automation Status
                const statusRes = await fetch('http://localhost:8000/automation/status');
                if (statusRes.ok) {
                    const statusData = await statusRes.json();
                    setIsAutomationRunning(statusData.running);
                }

                // Fetch Files
                await fetchFiles();

            } catch (error) {
                console.error("Failed to initialize", error);
            }
        };
        init();

        const interval = setInterval(fetchFiles, 5000);
        return () => clearInterval(interval);
    }, []);

    const handleToggleAutomation = async (e) => {
        const newState = e.target.checked;
        setIsAutomationRunning(newState);
        try {
            const endpoint = newState ? 'start' : 'stop';
            await fetch(`http://localhost:8000/automation/${endpoint}`, { method: 'POST' });
            setNotification({
                message: `Automation ${newState ? 'Started' : 'Stopped'}`,
                type: newState ? 'success' : 'info'
            });
        } catch (error) {
            console.error("Failed to toggle automation", error);
            setIsAutomationRunning(!newState);
            setNotification({ message: 'Failed to toggle automation', type: 'error' });
        }
    };

    const COMPANIES = ['SEC', 'Aramco', 'Sabic', 'Hadeed', 'Maaden', 'Marafic'];

    const handleSort = (key) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const filteredFiles = files.filter(file => {
        if (!file) return false;
        const matchesSearch = (file.filename?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
            (file.id?.toString() || '').includes(searchTerm);
        return matchesSearch;
    });

    const sortedFiles = [...filteredFiles].sort((a, b) => {
        if (!sortConfig.key) return 0;

        let valA = a[sortConfig.key];
        let valB = b[sortConfig.key];

        // Handle specific keys like dates or status if needed specially
        if (typeof valA === 'string') valA = valA.toLowerCase();
        if (typeof valB === 'string') valB = valB.toLowerCase();

        if (valA < valB) {
            return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (valA > valB) {
            return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
    });

    const totalPages = Math.ceil(sortedFiles.length / entriesPerPage);
    const indexOfLastEntry = currentPage * entriesPerPage;
    const indexOfFirstEntry = indexOfLastEntry - entriesPerPage;
    const currentFiles = sortedFiles.slice(indexOfFirstEntry, indexOfLastEntry);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    // Checkbox Logic
    const handleSelectAll = (e) => {
        if (e.target.checked) {
            const allIds = currentFiles.map(f => f.id);
            // Add unique IDs to existing selection
            const combined = [...new Set([...selectedItems, ...allIds])];
            setSelectedItems(combined);
        } else {
            // Deselect all visible items
            const visibleIds = new Set(currentFiles.map(f => f.id));
            setSelectedItems(selectedItems.filter(id => !visibleIds.has(id)));
        }
    };

    const handleSelectItem = (id) => {
        if (selectedItems.includes(id)) {
            setSelectedItems(selectedItems.filter(itemId => itemId !== id));
        } else {
            setSelectedItems([...selectedItems, id]);
        }
    };

    // Derived state for 'Select All' checkbox
    const isAllVisibleSelected = currentFiles.length > 0 && currentFiles.every(f => selectedItems.includes(f.id));
    const isSomeVisibleSelected = currentFiles.some(f => selectedItems.includes(f.id));

    return (
        <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900">
            <Sidebar isOpen={isSidebarOpen} user={user} />

            <div className={`flex-1 transition-[margin] duration-300 ease-in-out ${isSidebarOpen ? 'ml-64' : 'ml-0'}`}>
                <Header
                    title="DATA EXTRACTION MANAGMENT"
                    onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
                    extraAction={<UserMenu user={user} />}
                />

                <main className="p-8 max-w-[1920px] mx-auto">
                    <AnimatePresence>
                        {notification && (
                            <Toast
                                message={notification.message}
                                type={notification.type}
                                onClose={() => setNotification(null)}
                            />
                        )}
                    </AnimatePresence>

                    {/* Page Header */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                        <div>
                            <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Processed Files</h2>
                            <p className="text-slate-500 mt-1">Manage and review your extracted RFQ data</p>
                        </div>
                        <div className="flex gap-3">
                            {selectedItems.length > 0 && (
                                <button className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors border border-red-200 shadow-sm">
                                    <Trash2 size={18} />
                                    <span className="font-medium">Delete ({selectedItems.length})</span>
                                </button>
                            )}
                            <button onClick={fetchFiles} className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 bg-white rounded-lg border border-slate-200 shadow-sm transition-all" title="Refresh">
                                <RefreshCw size={20} />
                            </button>
                        </div>
                    </div>

                    {/* Controls Bar */}
                    <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 mb-6 flex flex-col lg:flex-row items-center justify-between gap-6">
                        {/* Filters */}
                        <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto">

                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Filter size={16} className="text-slate-400" />
                                </div>
                                <select
                                    value={selectedCompany}
                                    onChange={(e) => setSelectedCompany(e.target.value)}
                                    className="pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none appearance-none hover:bg-slate-100 cursor-pointer"
                                    style={{ backgroundImage: 'none' }}
                                >
                                    {COMPANIES.map(comp => (
                                        <option key={comp} value={comp}>{comp}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="h-8 w-[1px] bg-slate-200 hidden sm:block"></div>

                            <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-slate-500">Date:</span>
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none hover:bg-slate-100 placeholder-slate-400"
                                />
                                <span className="text-slate-400">-</span>
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none hover:bg-slate-100 placeholder-slate-400"
                                />
                            </div>
                        </div>

                        {/* Search & Automation */}
                        <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
                            <div className="relative w-full sm:w-64">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Search size={18} className="text-slate-400" />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Search files..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                                />
                            </div>

                            <label className={`
                                relative inline-flex items-center cursor-pointer p-1 rounded-full border transition-all duration-300
                                ${isAutomationRunning ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-50 border-slate-200'}
                            `}>
                                <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    checked={isAutomationRunning}
                                    onChange={handleToggleAutomation}
                                />
                                <div className={`
                                    w-11 h-6 rounded-full peer peer-focus:outline-none transition-all duration-300
                                    ${isAutomationRunning ? 'bg-emerald-500' : 'bg-slate-300'}
                                    peer-checked:after:translate-x-full peer-checked:after:border-white 
                                    after:content-[''] after:absolute after:top-[6px] after:left-[6px] after:bg-white 
                                    after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all shadow-sm
                                `}></div>
                                <span className={`ml-3 mr-2 text-sm font-medium ${isAutomationRunning ? 'text-emerald-700' : 'text-slate-500'}`}>
                                    {isAutomationRunning ? 'Live Processing' : 'Processing Paused'}
                                </span>
                            </label>


                        </div>
                    </div>

                    {/* Data Table */}
                    <div className="bg-white rounded-xl shadow-lg shadow-slate-200/50 border border-slate-200 overflow-hidden">
                        {/* Table Top Bar */}
                        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <div className="text-sm text-slate-600 font-medium">
                                Total {files.length} Files
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-slate-500">Rows per page:</span>
                                <select
                                    value={entriesPerPage}
                                    onChange={(e) => setEntriesPerPage(Number(e.target.value))}
                                    className="border-none bg-transparent text-sm font-medium text-slate-700 focus:ring-0 cursor-pointer"
                                >
                                    {[10, 25, 50, 100].map(num => (
                                        <option key={num} value={num}>{num}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                        <th className="p-4 w-12">
                                            <input
                                                type="checkbox"
                                                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                                checked={isAllVisibleSelected}
                                                ref={input => {
                                                    if (input) {
                                                        input.indeterminate = isSomeVisibleSelected && !isAllVisibleSelected;
                                                    }
                                                }}
                                                onChange={handleSelectAll}
                                            />
                                        </th>
                                        <th className="p-4 cursor-pointer hover:bg-slate-100/80 transition-colors" onClick={() => handleSort('id')}>Case ID</th>
                                        <th className="p-4 cursor-pointer hover:bg-slate-100/80 transition-colors" onClick={() => handleSort('filename')}>File Name</th>
                                        <th className="p-4 cursor-pointer hover:bg-slate-100/80 transition-colors" onClick={() => handleSort('uploaded_at')}>Uploaded</th>
                                        <th className="p-4 cursor-pointer hover:bg-slate-100/80 transition-colors" onClick={() => handleSort('completed_at')}>Completed</th>
                                        <th className="p-4 cursor-pointer hover:bg-slate-100/80 transition-colors" onClick={() => handleSort('processed_time')}>Processing Time</th>
                                        <th className="p-4 text-center cursor-pointer hover:bg-slate-100/80 transition-colors" onClick={() => handleSort('status')}>Status</th>
                                        <th className="p-4 text-center">Validation</th>
                                        <th className="p-4 text-center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm divide-y divide-slate-100">
                                    {currentFiles.length === 0 ? (
                                        <tr>
                                            <td colSpan="9" className="p-12 text-center text-slate-400">
                                                <div className="flex flex-col items-center gap-3">
                                                    <div className="p-4 bg-slate-50 rounded-full">
                                                        <Search size={24} className="text-slate-300" />
                                                    </div>
                                                    <p>No files found matching your criteria</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        currentFiles.map((file) => {
                                            const isSelected = selectedItems.includes(file.id);
                                            return (
                                                <tr
                                                    key={file.id}
                                                    className={`
                                                        group transition-colors duration-150 hover:bg-blue-50/30
                                                        ${isSelected ? 'bg-blue-50/50' : ''}
                                                    `}
                                                >
                                                    <td className="p-4">
                                                        <input
                                                            type="checkbox"
                                                            className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                                            checked={isSelected}
                                                            onChange={() => handleSelectItem(file.id)}
                                                        />
                                                    </td>
                                                    <td className="p-4 font-mono text-xs font-medium text-slate-500">{file.id}</td>
                                                    <td className="p-4 font-medium text-slate-900 flex items-center gap-2">
                                                        <span className="p-1.5 bg-blue-50 text-blue-600 rounded">
                                                            <LayoutDashboard size={14} />
                                                        </span>
                                                        {file.filename}
                                                    </td>
                                                    <td className="p-4 text-slate-500 whitespace-nowrap">{new Date(file.uploaded_at).toLocaleString()}</td>
                                                    <td className="p-4 text-slate-500 whitespace-nowrap">{file.completed_at ? new Date(file.completed_at).toLocaleString() : '-'}</td>
                                                    <td className="p-4 text-slate-500 font-mono text-xs">{file.processed_time}</td>
                                                    <td className="p-4 text-center">
                                                        <span className={`
                                                            inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border
                                                            ${file.status === 'Complete' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                                                file.status === 'Exception' ? 'bg-red-50 text-red-700 border-red-100' :
                                                                    'bg-sky-50 text-sky-700 border-sky-100'
                                                            }
                                                        `}>
                                                            {file.status}
                                                        </span>
                                                    </td>
                                                    <td className="p-4 text-center">
                                                        <div className={`flex justify-center ${file.validation ? 'text-emerald-500' : 'text-slate-300'}`}>
                                                            <CheckCircle size={18} className={file.validation ? "fill-emerald-50" : ""} />
                                                        </div>
                                                    </td>
                                                    <td className="p-4 text-center">
                                                        <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <button className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors" title="Edit">
                                                                <Edit size={16} />
                                                            </button>
                                                            <button className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors" title="Delete">
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between">
                            <div className="text-sm text-slate-500">
                                Showing <span className="font-medium text-slate-900">{sortedFiles.length > 0 ? indexOfFirstEntry + 1 : 0}</span> to <span className="font-medium text-slate-900">{Math.min(indexOfLastEntry, sortedFiles.length)}</span> of <span className="font-medium text-slate-900">{sortedFiles.length}</span> entries
                            </div>

                            <div className="flex gap-1.5">
                                <button
                                    onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                                    disabled={currentPage === 1}
                                    className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                >
                                    Previous
                                </button>

                                {/* Simplified Pagination for large numbers */}
                                {totalPages <= 7 ? (
                                    Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
                                        <button
                                            key={number}
                                            onClick={() => handlePageChange(number)}
                                            className={`
                                                w-8 h-8 rounded-lg text-sm font-medium transition-all
                                                ${currentPage === number
                                                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-200'
                                                    : 'text-slate-600 hover:bg-slate-50 border border-transparent hover:border-slate-200'
                                                }
                                            `}
                                        >
                                            {number}
                                        </button>
                                    ))
                                ) : (
                                    // Basic handling for many pages could be added here
                                    <span className="px-3 py-1.5 text-sm">Page {currentPage} of {totalPages}</span>
                                )}

                                <button
                                    onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                                    disabled={currentPage === totalPages}
                                    className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default FileProcessed;
