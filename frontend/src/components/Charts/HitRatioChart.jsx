import React from 'react';
import { ComposedChart, Bar, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const HitRatioChart = ({ data }) => {
    return (
        <div className="card h-[400px] flex flex-col">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Hit Ratio (Quote Vs PO Ratio)</h3>
            <div className="flex-1 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart
                        data={data}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                        <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                        <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} unit="%" />
                        <Tooltip
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        />
                        <Legend />
                        <Bar yAxisId="left" dataKey="totalQuoteValue" name="Total Quote Value" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={20} />
                        <Bar yAxisId="left" dataKey="totalPOValue" name="Total PO Value" fill="#2dd4bf" radius={[4, 4, 0, 0]} barSize={20} />
                        <Area yAxisId="right" type="monotone" dataKey="awardedPercentage" name="% Awarded" fill="#94a3b8" stroke="#94a3b8" fillOpacity={0.2} strokeWidth={2} />
                    </ComposedChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default HitRatioChart;
