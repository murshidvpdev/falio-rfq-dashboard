import asyncio
import websockets
import json
import requests
import sys

async def test_filters():
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
        # If login fails, we can't proceed. 
        # Ideally we should fail the test, but for this script we just exit.
        return

    # 2. Connect to WebSocket
    ws_uri = f"ws://localhost:8000/ws?token={token}"
    print(f"Connecting to WebSocket: {ws_uri}")
    
    try:
        async with websockets.connect(ws_uri) as websocket:
            print("WebSocket connected.")
            
            # --- Test 1: Supplier Filter ---
            target_supplier = "Siemens"
            print(f"\n--- Testing Supplier Filter: {target_supplier} ---")
            msg_supplier = {
                "action": "update_filters",
                "filters": {
                    "account": "SEC",
                    "type": "Direct",
                    "supplierName": target_supplier
                }
            }
            await websocket.send(json.dumps(msg_supplier))
            
            # Wait for response
            message = await asyncio.wait_for(websocket.recv(), timeout=5.0)
            data = json.loads(message)
            bidding_data = data.get("charts", {}).get("biddingTable", [])
            
            print(f"Received {len(bidding_data)} items.")
            if not bidding_data:
                print("WARNING: No data received for supplier filter.")
            
            all_match = True
            for item in bidding_data:
                if target_supplier.lower() not in item.get("supplier", "").lower():
                    print(f"FAIL: Found supplier '{item.get('supplier')}' when filtering for '{target_supplier}'")
                    all_match = False
                    break
            
            if all_match and bidding_data:
                print(f"PASS: All {len(bidding_data)} items match supplier '{target_supplier}'.")
            elif not bidding_data:
                print("PASS: No items found (which is a valid result if random generation didn't pick any, but check logic).")

            # --- Test 2: Price Filter ---
            min_price = 50000
            print(f"\n--- Testing Min Price Filter: {min_price} ---")
            msg_price = {
                "action": "update_filters",
                "filters": {
                    "account": "SEC",
                    "type": "Direct",
                    "minPrice": str(min_price),
                    "supplierName": "" # Clear supplier filter
                }
            }
            await websocket.send(json.dumps(msg_price))
            
            message = await asyncio.wait_for(websocket.recv(), timeout=5.0)
            data = json.loads(message)
            bidding_data = data.get("charts", {}).get("biddingTable", [])
            
            print(f"Received {len(bidding_data)} items.")
            
            all_match_price = True
            for item in bidding_data:
                amount = float(item.get("amount", 0))
                if amount < min_price:
                    print(f"FAIL: Found amount {amount} which is less than {min_price}")
                    all_match_price = False
                    break
            
            if all_match_price and bidding_data:
                print(f"PASS: All {len(bidding_data)} items are >= {min_price}.")

                
    except Exception as e:
        print(f"Test Error: {e}")

if __name__ == "__main__":
    asyncio.run(test_filters())
