import React, { useState, useEffect, useRef } from 'react';
import Header from '../components/Layout/Header';
import Sidebar from '../components/Layout/Sidebar';
import UserMenu from '../components/Layout/UserMenu';
import Toast from '../components/UI/Toast';
import { Search, Download, Trash2, Edit, CheckCircle, Smartphone, LayoutDashboard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

const MOCK_FILES = Array.from({ length: 15 }, (_, i) => ({
    id: 43559 - i,
    fileName: `SEC RFP-C0017280${75 - i}.doc`,
    uploadedAt: 'Thu, 15 Jan 2026 15:15:41 GMT',
    completedAt: 'Thu, 15 Jan 2026 15:15:42 GMT',
    processedTime: '00:00:01',
    status: 'Complete',
    validation: true
}));

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
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });
    const [user, setUser] = useState(null);
    const [isAutomationRunning, setIsAutomationRunning] = useState(false);
    const [notification, setNotification] = useState(null); // { message, type }
    const latestFileIdRef = useRef(null);
    const navigate = useNavigate();

    const fetchFiles = async () => {
        try {
            const response = await fetch('http://localhost:8000/automation/files');
            if (response.ok) {
                const data = await response.json();

                // Check for new files if we have previous data
                if (data.length > 0) {
                    const newestFile = data[0];
                    if (latestFileIdRef.current && newestFile.id > latestFileIdRef.current) {
                        // New file detected
                        setNotification({
                            message: `Processed: ${newestFile.filename}`,
                            type: newestFile.status === 'Exception' ? 'error' : 'success'
                        });
                    }
                    latestFileIdRef.current = newestFile.id;
                }

                setFiles(data);
            }
        } catch (error) {
            console.error("Failed to fetch files", error);
        }
    };

    useEffect(() => {
        // Fetch User, Automation Status, and Files
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

        // Poll for new files every 5 seconds
        const interval = setInterval(fetchFiles, 5000);
        return () => clearInterval(interval);
    }, []);

    const handleToggleAutomation = async (e) => {
        const newState = e.target.checked;
        setIsAutomationRunning(newState);
        try {
            const endpoint = newState ? 'start' : 'stop';
            await fetch(`http://localhost:8000/automation/${endpoint}`, { method: 'POST' });
        } catch (error) {
            console.error("Failed to toggle automation", error);
            setIsAutomationRunning(!newState); // Revert on error
        }
    };

    // Accounts/Companies list
    const COMPANIES = ['SEC', 'Aramco', 'Sabic', 'Hadeed', 'Maaden', 'Marafic'];

    // Sorting Logic
    const handleSort = (key) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    // Filter and Sort Data
    const filteredFiles = files.filter(file => {
        const matchesSearch = file.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
            file.id.toString().includes(searchTerm);
        // Add more filters (date, company) if applicable to mock data
        return matchesSearch;
    });

    const sortedFiles = [...filteredFiles].sort((a, b) => {
        if (!sortConfig.key) return 0;
        if (a[sortConfig.key] < b[sortConfig.key]) {
            return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
            return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
    });

    // Pagination Logic
    const totalPages = Math.ceil(sortedFiles.length / entriesPerPage);
    const indexOfLastEntry = currentPage * entriesPerPage;
    const indexOfFirstEntry = indexOfLastEntry - entriesPerPage;
    const currentFiles = sortedFiles.slice(indexOfFirstEntry, indexOfLastEntry);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    return (
        <div className="flex min-h-screen bg-slate-50 font-sans">
            <Sidebar isOpen={isSidebarOpen} user={user} />

            <div className={`flex-1 transition-[margin] duration-500 ease-in-out ${isSidebarOpen ? 'ml-64' : 'ml-0'}`}>
                <Header
                    title="DATA EXTRACTION"
                    onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
                    extraAction={<UserMenu user={user} />}
                />

                <main className="p-8 max-w-[1600px] mx-auto">
                    <AnimatePresence>
                        {notification && (
                            <Toast
                                message={notification.message}
                                type={notification.type}
                                onClose={() => setNotification(null)}
                            />
                        )}
                    </AnimatePresence>

                    {/* Page Title & Breadcrumb */}
                    <div className="mb-6">
                        <h2 className="text-xl font-bold text-slate-800 uppercase tracking-wide">Data Extraction</h2>
                        <div className="text-sm text-slate-500 flex gap-2">
                            <span>Home</span>
                            <span>&gt;</span>
                            <span>Data Extraction</span>
                        </div>
                    </div>

                    {/* Filter Bar */}
                    <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 mb-6 flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center gap-6">
                            <span className="font-bold text-slate-700 uppercase">DATA EXTRACTION STATUS</span>

                            {/* Contract Type Toggle REMOVED as per request */}

                            {/* Company Select */}
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-bold text-green-700">COMPANY:</span>
                                <select
                                    value={selectedCompany}
                                    onChange={(e) => setSelectedCompany(e.target.value)}
                                    className="border border-slate-300 rounded px-2 py-1 text-sm focus:outline-none focus:border-green-500"
                                >
                                    {COMPANIES.map(comp => (
                                        <option key={comp} value={comp}>{comp}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Date Range */}
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-bold text-green-700">FROM:</span>
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="border border-slate-300 rounded px-2 py-1 text-sm focus:outline-none focus:border-green-500"
                                />
                                <span className="text-sm font-bold text-green-700">TO:</span>
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="border border-slate-300 rounded px-2 py-1 text-sm focus:outline-none focus:border-green-500"
                                />
                            </div>
                        </div>

                        {/* Right Actions */}
                        <div className="flex items-center gap-3">
                            <label className="relative inline-flex items-center cursor-pointer mr-2">
                                <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    checked={isAutomationRunning}
                                    onChange={handleToggleAutomation}
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                                <span className="ml-3 text-sm font-medium text-slate-700">
                                    {isAutomationRunning ? 'Processing On' : 'Processing Off'}
                                </span>
                            </label>

                            <button className="p-2 text-slate-500 hover:text-slate-700 border border-slate-300 rounded bg-white cursor-pointer">
                                <Download size={18} />
                            </button>
                        </div>
                    </div>

                    {/* Table Section */}
                    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
                        <div className="flex justify-between items-center mb-6">
                            <div className="flex items-center gap-2 text-sm text-slate-600">
                                <span>Show</span>
                                <select
                                    value={entriesPerPage}
                                    onChange={(e) => setEntriesPerPage(Number(e.target.value))}
                                    className="border border-slate-300 rounded px-2 py-1 focus:outline-none"
                                >
                                    {[10, 25, 50, 100].map(num => (
                                        <option key={num} value={num}>{num}</option>
                                    ))}
                                </select>
                                <span>entries</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-slate-600">Search:</span>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="border border-slate-300 rounded-full px-4 py-1 text-sm focus:outline-none focus:border-blue-500 w-48"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-slate-100 text-xs font-bold text-slate-700 uppercase">
                                        <th className="p-3 w-10">
                                            <input type="checkbox" className="rounded border-slate-300" />
                                        </th>
                                        <th className="p-3 cursor-pointer hover:bg-slate-50" onClick={() => handleSort('id')}>Case ID</th>
                                        <th className="p-3 cursor-pointer hover:bg-slate-50" onClick={() => handleSort('fileName')}>File Name</th>
                                        <th className="p-3 cursor-pointer hover:bg-slate-50" onClick={() => handleSort('uploadedAt')}>Uploaded at</th>
                                        <th className="p-3 cursor-pointer hover:bg-slate-50" onClick={() => handleSort('completedAt')}>Completed at</th>
                                        <th className="p-3 cursor-pointer hover:bg-slate-50" onClick={() => handleSort('processedTime')}>Total Processed Time</th>
                                        <th className="p-3 text-center cursor-pointer hover:bg-slate-50" onClick={() => handleSort('status')}>Status</th>
                                        <th className="p-3 text-center">Actions</th>
                                        <th className="p-3 text-center">Validation</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm">
                                    {currentFiles.map((file) => (
                                        <tr key={file.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                                            <td className="p-3">
                                                <input type="checkbox" className="rounded border-slate-300" />
                                            </td>
                                            <td className="p-3 font-medium text-slate-900">{file.id}</td>
                                            <td className="p-3 text-slate-600">{file.filename}</td>
                                            <td className="p-3 text-slate-500">{new Date(file.uploaded_at).toLocaleString()}</td>
                                            <td className="p-3 text-slate-500">{file.completed_at ? new Date(file.completed_at).toLocaleString() : '-'}</td>
                                            <td className="p-3 text-slate-500">{file.processed_time}</td>
                                            <td className="p-3 text-center">
                                                <span className={`inline-block px-3 py-1 text-white text-xs font-bold rounded-full ${file.status === 'Complete' ? 'bg-green-500' :
                                                    file.status === 'Exception' ? 'bg-red-500' : 'bg-blue-500'
                                                    }`}>
                                                    {file.status}
                                                </span>
                                            </td>
                                            <td className="p-3 text-center">
                                                <div className="flex items-center justify-center gap-2 text-slate-400">
                                                    <button className="hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
                                                    <button className="hover:text-blue-500 transition-colors"><Edit size={16} /></button>
                                                </div>
                                            </td>
                                            <td className="p-3 text-center">
                                                <div className={`flex justify-center ${file.validation ? 'text-green-500' : 'text-red-500'}`}>
                                                    <CheckCircle size={18} />
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="flex justify-between items-center mt-6 text-sm text-slate-500">
                            <div>
                                Showing {indexOfFirstEntry + 1} to {Math.min(indexOfLastEntry, sortedFiles.length)} of {sortedFiles.length} entries
                            </div>
                            <div className="flex gap-1">
                                <button
                                    onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                                    disabled={currentPage === 1}
                                    className="px-3 py-1 border border-slate-200 rounded hover:bg-slate-50 disabled:opacity-50"
                                >
                                    Previous
                                </button>

                                {Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
                                    <button
                                        key={number}
                                        onClick={() => handlePageChange(number)}
                                        className={`px-3 py-1 rounded ${currentPage === number ? 'bg-green-400 text-white' : 'border border-slate-200 hover:bg-slate-50'}`}
                                    >
                                        {number}
                                    </button>
                                ))}

                                <button
                                    onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                                    disabled={currentPage === totalPages}
                                    className="px-3 py-1 border border-slate-200 rounded hover:bg-slate-50 disabled:opacity-50 text-blue-500"
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
