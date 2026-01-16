import asyncio
import websockets
import json
import requests

async def test_websocket():
    # 1. Login to get token
    login_url = "http://localhost:8000/token"
    login_data = {"username": "admin", "password": "admin"}
    print(f"Logging in to {login_url}...")
    try:
        response = requests.post(login_url, data=login_data)
        response.raise_for_status()
        token = response.json()["access_token"]
        print("Login successful. Token obtained.")
    except Exception as e:
        print(f"Login failed: {e}")
        return

    # 2. Connect to WebSocket
    ws_uri = f"ws://localhost:8000/ws?token={token}"
    print(f"Connecting to WebSocket: {ws_uri}")
    
    try:
        async with websockets.connect(ws_uri) as websocket:
            print("WebSocket connected.")
            
            # Send initial filter equivalent to frontend
            init_msg = {
                "action": "update_filters",
                "filters": {
                    "account": "SEC",
                    "type": "Direct",
                    "startDate": "",
                    "endDate": ""
                }
            }
            await websocket.send(json.dumps(init_msg))
            print(f"Sent: {init_msg}")
            
            # Wait for response
            try:
                message = await asyncio.wait_for(websocket.recv(), timeout=10.0)
                print(f"Received message of length: {len(message)}")
                data = json.loads(message)
                print("First few keys in data:", list(data.keys()))
            except asyncio.TimeoutError:
                print("Timed out waiting for message.")
                
    except websockets.exceptions.InvalidStatusCode as e:
        print(f"WebSocket connection failed: {e.status_code}")
    except Exception as e:
        print(f"WebSocket Error: {e}")

if __name__ == "__main__":
    asyncio.run(test_websocket())
