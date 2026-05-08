import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const DonutChart = ({ title, data, colors }) => (
    <div className="flex flex-col h-80">
        <h4 className="text-md font-semibold text-slate-700 text-center mb-2">{title}</h4>
        <div className="flex-1 w-full">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={data}
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                        ))}
                    </Pie>
                    <Tooltip
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        formatter={(value) => [`${value}k`, 'Spend']}
                    />
                    <Legend verticalAlign="bottom" height={36} />
                </PieChart>
            </ResponsiveContainer>
        </div>
    </div>
);

const SpendAnalysisChart = ({ data }) => {
    const COLORS_MANUFACTURER = ['#0ea5e9', '#22c55e', '#eab308', '#f97316'];
    const COLORS_REGION = ['#8b5cf6', '#ec4899', '#6366f1', '#14b8a6'];

    return (
        <div className="card w-full">
            <h3 className="text-lg font-bold text-slate-800 mb-6">Spend Analysis</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <DonutChart title="Spend By Manufacturer" data={data.manufacturer} colors={COLORS_MANUFACTURER} />
                <DonutChart title="Spend By Region" data={data.region} colors={COLORS_REGION} />
            </div>
        </div>
    );
};

export default SpendAnalysisChart;
