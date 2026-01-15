import React from 'react';
import { motion } from 'framer-motion';

const KPICard = ({ title, value, subtext, colorClass }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`bg-white rounded-xl shadow-sm border-l-4 p-6 ${colorClass}`}
    >
        <div className="flex flex-col">
            <h3 className="text-3xl font-bold text-slate-800">{value}</h3>
            <p className="text-sm font-medium text-slate-500 mt-1 uppercase tracking-wide">{title}</p>
            {subtext && <p className="text-xs text-slate-400 mt-2">{subtext}</p>}
        </div>
    </motion.div>
);

const KPIGrid = ({ data }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <KPICard
                title="Total RFQ"
                value={data.totalRFQ}
                colorClass="border-indigo-500"
            />
            <KPICard
                title="RFQ Quoted"
                value={data.rfqQuoted}
                colorClass="border-indigo-500"
            />
            <KPICard
                title="Bid Ratio"
                value={`${data.bidRatio}%`}
                colorClass="border-indigo-400"
            />
            <KPICard
                title="Win Vol Ratio"
                value={`${data.winVolumeRatio}%`}
                colorClass="border-indigo-400"
            />

            <KPICard
                title="Total Line Items"
                value={data.totalLI}
                colorClass="border-teal-500"
            />
            <KPICard
                title="LI Quoted"
                value={data.liQuoted}
                colorClass="border-teal-500"
            />
            <KPICard
                title="LI Bid Ratio"
                value={`${data.liBidRatio}%`}
                colorClass="border-teal-400"
            />
            <KPICard
                title="PO Value"
                value={data.poValue}
                colorClass="border-teal-400"
            />
        </div>
    );
};

export default KPIGrid;
