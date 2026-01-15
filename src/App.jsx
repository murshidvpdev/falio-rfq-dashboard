import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { Download, Menu } from 'lucide-react';
import Sidebar from './components/Layout/Sidebar';
import Header from './components/Layout/Header';
import FilterBar from './components/Dashboard/FilterBar';
import KPIGrid from './components/Dashboard/KPIGrid';
import RFQFlowChart from './components/Charts/RFQFlowChart';
import BidQuoteRatioChart from './components/Charts/BidQuoteRatioChart';
import ParticipationChart from './components/Charts/ParticipationChart';
import QuoteValueChart from './components/Charts/QuoteValueChart';
import HitRatioChart from './components/Charts/HitRatioChart';
import WaterfallChart from './components/Charts/WaterfallChart';
import BiddingTable from './components/Dashboard/BiddingTable';
import { getDashboardData, ACCOUNTS } from './data/mockData';

function App() {
  const [selectedAccount, setSelectedAccount] = useState(ACCOUNTS[0]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    // Simulate API fetch
    const dashboardData = getDashboardData(selectedAccount);
    setData(dashboardData);
  }, [selectedAccount]);

  const handleExport = () => {
    if (!data) return;

    // Create workbook and worksheets
    const wb = XLSX.utils.book_new();

    const kpiWS = XLSX.utils.json_to_sheet([data.kpis]);
    XLSX.utils.book_append_sheet(wb, kpiWS, "KPIs");

    const biddingWS = XLSX.utils.json_to_sheet(data.charts.biddingTable);
    XLSX.utils.book_append_sheet(wb, biddingWS, "Bidding Data");

    // Export
    XLSX.writeFile(wb, `${selectedAccount}_Dashboard_Report.xlsx`);
  };

  if (!data) return <div className="flex h-screen items-center justify-center">Loading...</div>;

  return (
    <div className="flex min-h-screen bg-slate-50/50">
      <Sidebar isOpen={isSidebarOpen} />

      <div className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-0'}`}>
        <Header
          title="Customer Dashboard"
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        />

        <main className="p-8 max-w-[1600px] mx-auto">
          <div className="flex justify-between items-center mb-6">
            <FilterBar
              selectedAccount={selectedAccount}
              onAccountChange={setSelectedAccount}
            />
            <button
              onClick={handleExport}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm"
            >
              <Download size={18} />
              Export Excel
            </button>
          </div>

          <KPIGrid data={data.kpis} />

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

          <BiddingTable data={data.charts.biddingTable} />

        </main>
      </div>
    </div>
  );
}

export default App;
