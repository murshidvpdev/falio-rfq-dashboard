import React from 'react';
import { RadialBarChart, RadialBar, ResponsiveContainer } from 'recharts';

const GAUGE_COLORS = {
    'Delivery Time':   '#6366f1',
    'Defect Rate':     '#f43f5e',
    'Response Rate':   '#2dd4bf',
    'Warranty Resp.':  '#8b5cf6',
};

const KPIGauge = ({ title, value, color }) => {
    const chartData = [
        { value: 100, fill: '#f1f5f9' },
        { value: value, fill: color },
    ];

    return (
        <div className="flex flex-col items-center gap-2">
            <div className="relative w-28 h-28">
                <ResponsiveContainer width="100%" height="100%">
                    <RadialBarChart
                        innerRadius="70%"
                        outerRadius="100%"
                        barSize={10}
                        data={chartData}
                        startAngle={90}
                        endAngle={-270}
                    >
                        <RadialBar background clockWise dataKey="value" cornerRadius={10} />
                    </RadialBarChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-xl font-bold text-slate-800">{value}</span>
                    <span className="text-xs text-slate-400 font-medium">%</span>
                </div>
            </div>
            <p className="text-xs font-semibold text-slate-500 text-center">{title}</p>
        </div>
    );
};

const SupplierKPIs = ({ data }) => {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-base font-semibold text-slate-800 mb-6">Supplier Performance KPIs</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <KPIGauge title="Delivery Time"  value={data.deliveryTime}    color={GAUGE_COLORS['Delivery Time']} />
                <KPIGauge title="Defect Rate"    value={data.defectRate}      color={GAUGE_COLORS['Defect Rate']} />
                <KPIGauge title="Response Rate"  value={data.responseRate}    color={GAUGE_COLORS['Response Rate']} />
                <KPIGauge title="Warranty Resp." value={data.warrantyResponse} color={GAUGE_COLORS['Warranty Resp.']} />
            </div>
        </div>
    );
};

export default SupplierKPIs;
