from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import asyncio
import json
import random
from datetime import datetime

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ConnectionManager:
    def __init__(self):
        self.active_connections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            await connection.send_text(message)

manager = ConnectionManager()

# Helper to generate random data (mirroring mockData.js somewhat)
def generate_dashboard_data():
    accounts = ["SEC", "Aramco", "Sabic", "Hadeed", "Maaden", "Marafic"]
    selected_account = random.choice(accounts)
    
    # Random performance factor
    performance_factor = random.uniform(0.8, 1.3)
    
    total_rfq = int(4000 * performance_factor)
    rfq_quoted = int(1800 * performance_factor)
    
    return {
        "timestamp": datetime.now().isoformat(),
        "account": selected_account,
        "kpis": {
            "totalRFQ": total_rfq,
            "rfqQuoted": rfq_quoted,
            "bidRatio": round((rfq_quoted / total_rfq) * 100, 1),
            "winVolumeRatio": round(40.3 * performance_factor, 1),
            "totalLI": int(26000 * performance_factor),
            "liQuoted": int(7900 * performance_factor),
            "liBidRatio": 30.4,
            "winValueRatio": 25.0,
            "poValue": f"{round(38.0 * performance_factor, 1)}M"
        }
    }

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            # Wait for any message from client (optional, mostly for keeping connection alive)
            # data = await websocket.receive_text()
            
            # Simulate pushing data every 5 seconds
            await asyncio.sleep(5)
            dashboard_data = generate_dashboard_data()
            await websocket.send_text(json.dumps(dashboard_data))
            
    except WebSocketDisconnect:
        manager.disconnect(websocket)
