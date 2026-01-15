import React from 'react';
import { RadialBarChart, RadialBar, Legend, ResponsiveContainer } from 'recharts';

const KPIGauge = ({ title, value, color }) => {
    const data = [
        { name: 'Total', value: 100, fill: '#f1f5f9' },
        { name: title, value: value, fill: color }
    ];

    return (
        <div className="flex flex-col items-center">
            <div className="h-32 w-32 relative">
                <ResponsiveContainer width="100%" height="100%">
                    <RadialBarChart innerRadius="70%" outerRadius="100%" barSize={10} data={data} startAngle={90} endAngle={-270}>
                        <RadialBar background clockWise dataKey="value" cornerRadius={10} />
                    </RadialBarChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex items-center justify-center flex-col">
                    <span className="text-2xl font-bold text-slate-800">{value}%</span>
                </div>
            </div>
            <p className="text-sm font-medium text-slate-500 mt-2">{title}</p>
        </div>
    );
};

const SupplierKPIs = ({ data }) => {
    return (
        <div className="card w-full">
            <h3 className="text-lg font-bold text-slate-800 mb-6">Supplier Performance KPIs</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <KPIGauge title="Delivery Time" value={data.deliveryTime} color="#6366f1" />
                <KPIGauge title="Defect Rate" value={data.defectRate} color="#f43f5e" />
                <KPIGauge title="Response Rate" value={data.responseRate} color="#2dd4bf" />
                <KPIGauge title="Warranty Resp." value={data.warrantyResponse} color="#8b5cf6" />
            </div>
        </div>
    );
};

export default SupplierKPIs;
