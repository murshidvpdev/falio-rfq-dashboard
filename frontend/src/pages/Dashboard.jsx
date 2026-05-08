import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { Download } from 'lucide-react';
import Sidebar from '../components/Layout/Sidebar';
import Header from '../components/Layout/Header';
import FilterBar from '../components/Dashboard/FilterBar';
import KPIGrid from '../components/Dashboard/KPIGrid';
import RFQFlowChart from '../components/Charts/RFQFlowChart';
import BidQuoteRatioChart from '../components/Charts/BidQuoteRatioChart';
import ParticipationChart from '../components/Charts/ParticipationChart';
import QuoteValueChart from '../components/Charts/QuoteValueChart';
import HitRatioChart from '../components/Charts/HitRatioChart';
import WaterfallChart from '../components/Charts/WaterfallChart';
import BiddingTable from '../components/Dashboard/BiddingTable';
import SupplierKPIs from '../components/Dashboard/SupplierKPIs';
import SpendAnalysisChart from '../components/Charts/SpendAnalysisChart';
import AgreementTable from '../components/Dashboard/AgreementTable';
import UserMenu from '../components/Layout/UserMenu';
import { useNavigate } from 'react-router-dom';
import { API_BASE, getWsUrl } from '../config';

const Dashboard = () => {
    const [accounts, setAccounts] = useState([]);
    const [selectedAccount, setSelectedAccount] = useState('');
    const [selectedType, setSelectedType] = useState('Direct');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [supplierName, setSupplierName] = useState('');
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [user, setUser] = useState(null);
    const [data, setData] = useState(null);
    const [ws, setWs] = useState(null);
    const navigate = useNavigate();

    // Fetch Accounts
    useEffect(() => {
        const fetchAccounts = async () => {
            try {
                const response = await fetch(`${API_BASE}/accounts`);
                if (response.ok) {
                    const data = await response.json();
                    setAccounts(data);
                    if (data.length > 0 && !selectedAccount) {
                        setSelectedAccount(data[0]);
                    }
                }
            } catch (error) {
                console.error("Failed to fetch accounts", error);
            }
        };
        fetchAccounts();

        // Fetch User
        const fetchUser = async () => {
            const token = localStorage.getItem('token');
            if (!token) return;
            try {
                const response = await fetch(`${API_BASE}/users/me`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (response.ok) {
                    const userData = await response.json();
                    setUser(userData);
                }
            } catch (error) {
                console.error("Failed to fetch user", error);
            }
        };
        fetchUser();
    }, []);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }
        // WebSocket Connection
        // Pass token in query param
        const url = getWsUrl(`/ws?token=${token}`);
        const socket = new WebSocket(url);
        setWs(socket);

        socket.onopen = () => {
            console.log('Connected to WebSocket');
            socket.send(JSON.stringify({
                action: 'update_filters',
                filters: {
                    account: selectedAccount,
                    type: selectedType,
                    startDate: startDate,
                    endDate: endDate,
                    supplierName: supplierName,
                    minPrice: minPrice,
                    maxPrice: maxPrice
                }
            }));
        };

        socket.onmessage = (event) => {
            try {
                const update = JSON.parse(event.data);
                setData(update);
            } catch (error) {
                console.error('Error parsing WebSocket message:', error);
            }
        };

        socket.onclose = (e) => {
            console.log('Disconnected from WebSocket', e.code);
            if (e.code === 1008) { // Policy Violation (Auth failed)
                localStorage.removeItem('token');
                navigate('/login');
            }
        };

        socket.onerror = (e) => {
            console.error('WebSocket error', e);
        };

        return () => {
            socket.close();
        };
    }, [navigate]);

    useEffect(() => {
        if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({
                action: 'update_filters',
                filters: {
                    account: selectedAccount,
                    type: selectedType,
                    startDate: startDate,
                    endDate: endDate,
                    supplierName: supplierName,
                    minPrice: minPrice,
                    maxPrice: maxPrice
                }
            }));
        }
    }, [selectedAccount, selectedType, startDate, endDate, supplierName, minPrice, maxPrice, ws]);

    const handleDateChange = (type, value) => {
        if (type === 'start') setStartDate(value);
        else setEndDate(value);
    };

    const handleExport = () => {
        if (!data) return;
        const wb = XLSX.utils.book_new();
        const kpiWS = XLSX.utils.json_to_sheet([data.kpis]);
        XLSX.utils.book_append_sheet(wb, kpiWS, "KPIs");
        const biddingWS = XLSX.utils.json_to_sheet(data.charts.biddingTable);
        XLSX.utils.book_append_sheet(wb, biddingWS, "Bidding Data");
        XLSX.writeFile(wb, `${selectedAccount}_Dashboard_Report.xlsx`);
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    if (!data) return (
        <div className="flex flex-col h-screen items-center justify-center space-y-4">
            <div className="text-xl text-slate-700">Loading dashboard...</div>
            <button
                onClick={handleLogout}
                className="text-sm text-red-600 hover:text-red-700 font-medium hover:underline"
            >
                Cancel & Logout
            </button>
        </div>
    );

    return (
        <div className="flex min-h-screen bg-slate-50/50">
            <Sidebar isOpen={isSidebarOpen} user={user} />

            <div className={`flex-1 transition-[margin] duration-500 ease-in-out ${isSidebarOpen ? 'ml-64' : 'ml-0'}`}>
                <Header
                    title="Customer Dashboard"
                    onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
                    extraAction={<UserMenu user={user} />}
                />

                <main className="p-8 max-w-[1600px] mx-auto">
                    <div className="flex justify-between items-center mb-6">
                        <FilterBar
                            accounts={accounts}
                            selectedAccount={selectedAccount}
                            onAccountChange={setSelectedAccount}
                            selectedType={selectedType}
                            onTypeChange={setSelectedType}
                            startDate={startDate}
                            endDate={endDate}
                            onDateChange={handleDateChange}
                            supplierName={supplierName}
                            onSupplierNameChange={setSupplierName}
                            minPrice={minPrice}
                            onMinPriceChange={setMinPrice}
                            maxPrice={maxPrice}
                            onMaxPriceChange={setMaxPrice}
                        />
                        <button
                            onClick={handleExport}
                            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm"
                        >
                            <Download size={18} />
                            Export Excel
                        </button>
                    </div>

                    <KPIGrid data={data.kpis} selectedType={selectedType} />

                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 gap-6 mb-6">
                        <RFQFlowChart data={data.charts.rfqFlow} />
                        <BidQuoteRatioChart data={data.charts.bidQuoteRatio} />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 gap-6 mb-6">
                        <ParticipationChart data={data.charts.participation} />
                        <QuoteValueChart data={data.charts.quoteValue} />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 gap-6 mb-8">
                        <HitRatioChart data={data.charts.hitRatio} />
                        <WaterfallChart data={data.charts.waterfall} />
                    </div>

                    {selectedType === 'Agreement' && (
                        <div className="mb-8">
                            <AgreementTable data={data.charts.agreementTable} />
                        </div>
                    )}

                    <div className="mb-8">
                        <h2 className="text-xl font-bold text-slate-800 mb-4">Manufacturing & Supplier Insights</h2>
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                            <SupplierKPIs data={data.supplierStats} />
                            <SpendAnalysisChart data={data.spendAnalysis} />
                        </div>
                    </div>

                    <BiddingTable data={data.charts.biddingTable} />

                </main>
            </div>
        </div>
    );
};

export default Dashboard;
