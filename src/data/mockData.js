export const ACCOUNTS = [
    "SEC", "Aramco", "Sabic", "Hadeed", "Maaden", "Marafic"
];

const generateMonthlyData = (baseReceived, baseQuoted) => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return months.map(month => {
        const rfqReceived = Math.floor(baseReceived * (0.8 + Math.random() * 0.4));
        const quoted = Math.floor(rfqReceived * (baseQuoted + Math.random() * 0.1));
        return {
            month,
            rfqReceived,
            quoted,
            lineItems: Math.floor(rfqReceived * 5),
        };
    });
};

export const getDashboardData = (account) => {
    // Simulate different performance for different accounts
    let performanceFactor = 1.0;
    if (account === "Aramco") performanceFactor = 1.2;
    if (account === "SEC") performanceFactor = 1.1;
    if (account === "Sabic") performanceFactor = 0.9;

    const totalRFQ = Math.floor(4000 * performanceFactor);
    const rfqQuoted = Math.floor(1800 * performanceFactor);

    const monthlyData = generateMonthlyData(300 * performanceFactor, 0.45);

    return {
        kpis: {
            totalRFQ: totalRFQ,
            rfqQuoted: rfqQuoted,
            bidRatio: ((rfqQuoted / totalRFQ) * 100).toFixed(1),
            winVolumeRatio: (40.3 * performanceFactor).toFixed(1),
            totalLI: Math.floor(26000 * performanceFactor),
            liQuoted: Math.floor(7900 * performanceFactor),
            liBidRatio: 30.4,
            winValueRatio: 25.0,
            poValue: (38.0 * performanceFactor).toFixed(1) + "M"
        },
        charts: {
            rfqFlow: monthlyData,
            bidQuoteRatio: monthlyData.map(d => ({
                month: d.month,
                liQuoted: d.quoted * 4,
                quotePercentage: Math.floor(20 + Math.random() * 30)
            })),
            participation: monthlyData.map(d => ({
                month: d.month,
                totalQuoted: d.quoted,
                participationRate: Math.floor(30 + Math.random() * 20)
            })),
            quoteValue: monthlyData.map(d => ({
                month: d.month,
                value: (d.quoted * 0.05).toFixed(1) // in Millions
            })),
            hitRatio: monthlyData.map(d => ({
                month: d.month,
                totalQuoteValue: (d.quoted * 0.06).toFixed(1),
                totalPOValue: (d.quoted * 0.02).toFixed(1),
                awardedPercentage: Math.floor(10 + Math.random() * 25)
            })),
            waterfall: [
                { name: 'Total RFQ', value: 26607, fill: '#2dd4bf' },
                { name: 'Decrease 1', value: -2802, fill: '#94a3b8' },
                { name: 'Stage 2', value: 23805, fill: 'transparent' }, // Intermediate logic usually handled in chart
                { name: 'Decrease 2', value: -42, fill: '#94a3b8' },
                // Simplified for demo, Waterfall logic can be complex in Recharts
                // We will implement a simplified version or just bar chart representation
                { name: 'Initial', value: 26000, type: 'total' },
                { name: 'Tech Rej.', value: -2000, type: 'delta' },
                { name: 'Comm Rej.', value: -1500, type: 'delta' },
                { name: 'Expired', value: -500, type: 'delta' },
                { name: 'Won', value: 22000, type: 'total' },
            ],
            biddingTable: Array.from({ length: 50 }, (_, i) => ({
                id: `RFQ-${20230000 + i}`,
                date: `2023-${Math.floor(Math.random() * 12) + 1}-${Math.floor(Math.random() * 28) + 1}`,
                status: Math.random() > 0.5 ? 'Won' : Math.random() > 0.5 ? 'Lost' : 'Pending',
                amount: (Math.random() * 100000).toFixed(2),
                account: account
            }))
        },
        supplierStats: {
            deliveryTime: 85 + Math.floor(Math.random() * 10),
            defectRate: 2 + Math.floor(Math.random() * 3),
            responseRate: 90 + Math.floor(Math.random() * 8),
            warrantyResponse: 95 + Math.floor(Math.random() * 5)
        },
        spendAnalysis: {
            manufacturer: [
                { name: 'Siemens', value: 400 },
                { name: 'ABB', value: 300 },
                { name: 'Schneider', value: 300 },
                { name: 'GE', value: 200 }
            ],
            region: [
                { name: 'Dammam', value: 500 },
                { name: 'Riyadh', value: 300 },
                { name: 'Jeddah', value: 200 },
                { name: 'Jubail', value: 200 }
            ]
        }
    };
};
