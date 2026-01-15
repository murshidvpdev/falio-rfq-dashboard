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

// Helper to parsing month to index
const monthToIndex = {
    "Jan": 0, "Feb": 1, "Mar": 2, "Apr": 3, "May": 4, "Jun": 5,
    "Jul": 6, "Aug": 7, "Sep": 8, "Oct": 9, "Nov": 10, "Dec": 11
};

export const getDashboardData = (account, type = 'Direct', startDate, endDate) => {
    // Simulate different performance for different accounts
    let performanceFactor = 1.0;
    if (account === "Aramco") performanceFactor = 1.2;
    if (account === "SEC") performanceFactor = 1.1;
    if (account === "Sabic") performanceFactor = 0.9;

    // Adjust for Agreement type - generally higher volume, lower margin maybe? or more stable
    if (type === 'Agreement') {
        performanceFactor *= 1.5; // Agreements have more volume
    }

    const totalRFQ = Math.floor(4000 * performanceFactor);
    const rfqQuoted = Math.floor(1800 * performanceFactor);

    let monthlyData = generateMonthlyData(300 * performanceFactor, 0.45);

    // Filter by Date Range if provided
    if (startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const currentYear = new Date().getFullYear();

        monthlyData = monthlyData.filter(d => {
            // As mock data only has Month names, we assume current year for filtering context or just map months
            // For this demo, let's map the month name to a date in the current year
            const dataMonthIndex = monthToIndex[d.month];
            const dataDate = new Date(currentYear, dataMonthIndex, 15); // Middle of the month
            return dataDate >= start && dataDate <= end;
        });
    }

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
        agreementKPIs: {
            totalRFQ: 4463,
            totalRelevantRFQ: 0,
            rfqQuoted: 1885,
            quotedAgr: 0,
            awardedAgrValue: "0M",
            totalLI: 26147,
            relevantLISelected: 0,
            liQuoted: 7952,
            purchaseLIAgr: 0,
            poValue: "38.0M",
            avgLI: 0,
            avgRelevant: 0,
            avgQuoteLI: 0,
            avgPurchaseLI: 0,
            avgPOLI: 0
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
                { name: 'Total RFQ', value: Math.floor(26607 * performanceFactor), fill: '#2dd4bf' },
                { name: 'Decrease 1', value: Math.floor(-2802 * performanceFactor), fill: '#94a3b8' },
                { name: 'Stage 2', value: Math.floor(23805 * performanceFactor), fill: 'transparent' },
                { name: 'Decrease 2', value: Math.floor(-42 * performanceFactor), fill: '#94a3b8' },
                { name: 'Initial', value: Math.floor(26000 * performanceFactor), type: 'total' },
                { name: 'Tech Rej.', value: Math.floor(-2000 * performanceFactor), type: 'delta' },
                { name: 'Comm Rej.', value: Math.floor(-1500 * performanceFactor), type: 'delta' },
                { name: 'Expired', value: Math.floor(-500 * performanceFactor), type: 'delta' },
                { name: 'Won', value: Math.floor(22000 * performanceFactor), type: 'total' },
            ],
            biddingTable: Array.from({ length: 50 }, (_, i) => ({
                id: `RFQ-${20230000 + i}`,
                date: `2023-${Math.floor(Math.random() * 12) + 1}-${Math.floor(Math.random() * 28) + 1}`,
                status: Math.random() > 0.5 ? 'Won' : Math.random() > 0.5 ? 'Lost' : 'Pending',
                amount: (Math.random() * 100000 * performanceFactor).toFixed(2),
                account: account
            })),
            agreementTable: [
                { id: '1', agreementNo: '', noOfItems: 3, validityStart: '', validityEnd: '', totalValue: '', estVolume: '', releasedValue: '', noOfPO: '', term: '', version: '9493.2', status: '' },
                { id: '2', agreementNo: '4600034238', noOfItems: 301, validityStart: '', validityEnd: '', totalValue: '', estVolume: '10.26M', releasedValue: '10.26M', noOfPO: '', term: '', version: '', status: '' },
                { id: '3', agreementNo: '4600034953', noOfItems: 618, validityStart: '', validityEnd: '', totalValue: '', estVolume: '14.27M', releasedValue: '14.27M', noOfPO: '', term: '', version: '0.18M', status: '' },
                { id: '4', agreementNo: '4600035066', noOfItems: 4, validityStart: '', validityEnd: '', totalValue: '', estVolume: '0.15M', releasedValue: '0.15M', noOfPO: '', term: '', version: '15025', status: '' },
                { id: '5', agreementNo: '4600035161', noOfItems: 44, validityStart: '03-August-2025', validityEnd: '03-August-2027', totalValue: '', estVolume: '0.17M', releasedValue: '0.17M', noOfPO: '', term: '', version: '0.27M', status: '' },
                { id: '6', agreementNo: '4600035230', noOfItems: 149, validityStart: '', validityEnd: '', totalValue: '', estVolume: '2.99M', releasedValue: '2.99M', noOfPO: '', term: '', version: '1.39M', status: '' },
                { id: '7', agreementNo: '4600035271', noOfItems: 972, validityStart: '', validityEnd: '', totalValue: '', estVolume: '16.46M', releasedValue: '16.46M', noOfPO: '', term: '', version: '2.19M', status: '' },
            ]
        },
        supplierStats: {
            deliveryTime: 85 + Math.floor(Math.random() * 10 * performanceFactor),
            defectRate: Math.max(0, 2 + Math.floor(Math.random() * 3 - (type === 'Agreement' ? 1 : 0))),
            responseRate: Math.min(100, 90 + Math.floor(Math.random() * 8)),
            warrantyResponse: 95 + Math.floor(Math.random() * 5)
        },
        spendAnalysis: {
            manufacturer: [
                { name: 'Siemens', value: Math.floor(400 * performanceFactor) },
                { name: 'ABB', value: Math.floor(300 * performanceFactor) },
                { name: 'Schneider', value: Math.floor(300 * performanceFactor) },
                { name: 'GE', value: Math.floor(200 * performanceFactor) }
            ],
            region: [
                { name: 'Dammam', value: Math.floor(500 * performanceFactor) },
                { name: 'Riyadh', value: Math.floor(300 * performanceFactor) },
                { name: 'Jeddah', value: Math.floor(200 * performanceFactor) },
                { name: 'Jubail', value: Math.floor(200 * performanceFactor) }
            ]
        }
    };
};
