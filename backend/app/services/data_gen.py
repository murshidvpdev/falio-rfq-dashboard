import random
from datetime import datetime

# --- Data Generation Logic ---

month_to_index = {
    "Jan": 0, "Feb": 1, "Mar": 2, "Apr": 3, "May": 4, "Jun": 5,
    "Jul": 6, "Aug": 7, "Sep": 8, "Oct": 9, "Nov": 10, "Dec": 11
}

ACCOUNTS = ["SEC", "Aramco", "Sabic", "Hadeed", "Maaden", "Marafic"]

def get_accounts():
    return ACCOUNTS

def generate_monthly_data(base_received, base_quoted):
    months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    data = []
    
    # Random variation helper
    def rand_factor(base, min_var, max_var):
        return base * (min_var + random.random() * (max_var - min_var))

    for month in months:
        rfq_received = int(rand_factor(base_received, 0.8, 1.2))
        quoted = int(base_quoted * rfq_received * (1 + random.random() * 0.1)) 
        quoted = min(quoted, rfq_received)
        
        data.append({
            "month": month,
            "rfqReceived": rfq_received,
            "quoted": quoted,
            "lineItems": int(rfq_received * 5)
        })
    return data

def get_dashboard_data(account, type_="Direct", start_date="", end_date=""):
    # Simulate different performance for different accounts
    performance_factor = 1.0
    if account == "Aramco": performance_factor = 1.2
    if account == "SEC": performance_factor = 1.1
    if account == "Sabic": performance_factor = 0.9

    # Adjust for Agreement type
    if type_ == 'Agreement':
        performance_factor *= 1.5

    total_rfq = int(4000 * performance_factor)
    rfq_quoted = int(1800 * performance_factor)

    # Base monthly data
    monthly_data = generate_monthly_data(300 * performance_factor, 0.45)

    # Filter by Date Range
    filtered_data = monthly_data
    if start_date and end_date:
        try:
            start = datetime.strptime(start_date, "%Y-%m-%d")
            end = datetime.strptime(end_date, "%Y-%m-%d")
            current_year = datetime.now().year
            
            def is_in_range(m_data):
                m_idx = month_to_index.get(m_data["month"], 0)
                # Middle of the month estimation
                d_date = datetime(current_year, m_idx + 1, 15)
                return start <= d_date <= end

            filtered_data = [d for d in monthly_data if is_in_range(d)]
        except ValueError:
            pass # Invalid date format, ignore filter

    # Charts Data Generation
    charts = {
        "rfqFlow": filtered_data,
        "bidQuoteRatio": [
            {
                "month": d["month"],
                "liQuoted": d["quoted"] * 4,
                "quotePercentage": int(20 + random.random() * 30)
            } for d in filtered_data
        ],
        "participation": [
            {
                "month": d["month"],
                "totalQuoted": d["quoted"],
                "participationRate": int(30 + random.random() * 20)
            } for d in filtered_data
        ],
        "quoteValue": [
            {
                "month": d["month"],
                "value": round(d["quoted"] * 0.05, 1)
            } for d in filtered_data
        ],
        "hitRatio": [
            {
                "month": d["month"],
                "totalQuoteValue": round(d["quoted"] * 0.06, 1),
                "totalPOValue": round(d["quoted"] * 0.02, 1),
                "awardedPercentage": int(10 + random.random() * 25)
            } for d in filtered_data
        ],
        "waterfall": [
            {"name": 'Total RFQ', "value": int(26607 * performance_factor), "fill": '#2dd4bf'},
            {"name": 'Decrease 1', "value": int(-2802 * performance_factor), "fill": '#94a3b8'},
            {"name": 'Stage 2', "value": int(23805 * performance_factor), "fill": 'transparent'},
            {"name": 'Decrease 2', "value": int(-42 * performance_factor), "fill": '#94a3b8'},
            {"name": 'Initial', "value": int(26000 * performance_factor), "type": 'total'},
            {"name": 'Tech Rej.', "value": int(-2000 * performance_factor), "type": 'delta'},
            {"name": 'Comm Rej.', "value": int(-1500 * performance_factor), "type": 'delta'},
            {"name": 'Expired', "value": int(-500 * performance_factor), "type": 'delta'},
            {"name": 'Won', "value": int(22000 * performance_factor), "type": 'total'},
        ],
        "biddingTable": [
            {
                "id": f"RFQ-{20230000 + i}",
                "date": f"2023-{random.randint(1, 12)}-{random.randint(1, 28)}",
                "status": "Won" if random.random() > 0.5 else "Lost" if random.random() > 0.5 else "Pending",
                "amount": f"{random.random() * 100000 * performance_factor:.2f}",
                "account": account
            } for i in range(50)
        ],
        "agreementTable": [
            {"id": '1', "agreementNo": '', "noOfItems": 3, "validityStart": '', "validityEnd": '', "totalValue": '', "estVolume": '', "releasedValue": '', "noOfPO": '', "term": '', "version": '9493.2', "status": ''},
            {"id": '2', "agreementNo": '4600034238', "noOfItems": 301, "validityStart": '', "validityEnd": '', "totalValue": '', "estVolume": '10.26M', "releasedValue": '10.26M', "noOfPO": '', "term": '', "version": '', "status": ''},
        ]
    }

    return {
        "timestamp": datetime.now().isoformat(),
        "account": account,
        "kpis": {
            "totalRFQ": total_rfq,
            "rfqQuoted": rfq_quoted,
            "bidRatio": round((rfq_quoted / total_rfq) * 100, 1) if total_rfq else 0,
            "winVolumeRatio": round(40.3 * performance_factor, 1),
            "totalLI": int(26000 * performance_factor),
            "liQuoted": int(7900 * performance_factor),
            "liBidRatio": 30.4,
            "winValueRatio": 25.0,
            "poValue": f"{round(38.0 * performance_factor, 1)}M"
        },
        "agreementKPIs": {
             "totalRFQ": 4463, "totalRelevantRFQ": 0, "rfqQuoted": 1885, "quotedAgr": 0,
             "awardedAgrValue": "0M", "totalLI": 26147, "relevantLISelected": 0,
             "liQuoted": 7952, "purchaseLIAgr": 0, "poValue": "38.0M", "avgLI": 0,
             "avgRelevant": 0, "avgQuoteLI": 0, "avgPurchaseLI": 0, "avgPOLI": 0
        },
        "charts": charts,
        "supplierStats": {
            "deliveryTime": 85 + int(random.random() * 10 * performance_factor),
            "defectRate": max(0, 2 + int(random.random() * 3)),
            "responseRate": min(100, 90 + int(random.random() * 8)),
            "warrantyResponse": 95 + int(random.random() * 5)
        },
        "spendAnalysis": {
            "manufacturer": [
                {"name": 'Siemens', "value": int(400 * performance_factor)},
                {"name": 'ABB', "value": int(300 * performance_factor)},
                {"name": 'Schneider', "value": int(300 * performance_factor)},
                {"name": 'GE', "value": int(200 * performance_factor)}
            ],
            "region": [
                {"name": 'Dammam', "value": int(500 * performance_factor)},
                {"name": 'Riyadh', "value": int(300 * performance_factor)},
                {"name": 'Jeddah', "value": int(200 * performance_factor)},
                {"name": 'Jubail', "value": int(200 * performance_factor)}
            ]
        }
    }
