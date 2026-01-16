from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query, Depends, status
from ...services.data_gen import get_dashboard_data, get_accounts
from ...core.security import verify_token
import asyncio
import json

router = APIRouter()

@router.get("/accounts")
def get_accounts_list():
    return get_accounts()

class ConnectionManager:
    def __init__(self):
        self.active_connections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

manager = ConnectionManager()

# Dependency to check token in WebSocket
async def get_token(
    websocket: WebSocket,
    token: str | None = Query(default=None)
):
    if token is None or verify_token(token) is None:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return None
    return token

@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    # For simplicity, we are accepting connection first then checking auth via init message or query param
    # Passing token in query param is standard for WS
    token = websocket.query_params.get("token")
    if not token or not verify_token(token):
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return

    await manager.connect(websocket)
    
    current_filters = {
        "account": "SEC",
        "type": "Direct",
        "startDate": "",
        "endDate": ""
    }

    try:
        while True:
            try:
                data = await asyncio.wait_for(websocket.receive_text(), timeout=5.0)
                payload = json.loads(data)
                
                if payload.get("action") == "update_filters":
                    current_filters.update(payload.get("filters", {}))
                    dashboard_data = get_dashboard_data(
                        current_filters["account"],
                        current_filters["type"],
                        current_filters["startDate"],
                        current_filters["endDate"]
                    )
                    await websocket.send_text(json.dumps(dashboard_data))
                    continue
                    
            except asyncio.TimeoutError:
                pass
            except json.JSONDecodeError:
                pass
                
            # Periodic Update
            dashboard_data = get_dashboard_data(
                current_filters["account"],
                current_filters["type"],
                current_filters["startDate"],
                current_filters["endDate"]
            )
            await websocket.send_text(json.dumps(dashboard_data))
            
    except WebSocketDisconnect:
        manager.disconnect(websocket)
