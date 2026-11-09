#!/usr/bin/env python3
"""Test the app connection WITHOUT a drone: fake telemetry, prints the commands it receives.
Run:  pip install websockets   then   python3 test_bridge.py
Open the printed http://IP:8080 link on the phone (same Wi-Fi)."""
import asyncio, json, os, socket, threading
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
import websockets

S = dict(alt=0.0, mode='DISARMED', bat=100.0)
clients = set()

class Web(SimpleHTTPRequestHandler):
    def log_message(self, *x):
        pass

def my_ip():
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(('8.8.8.8', 80))
        return s.getsockname()[0]
    except Exception:
        return '<this-ip>'

async def handler(ws):
    clients.add(ws)
    print('Phone connected')
    try:
        async for raw in ws:
            d = json.loads(raw)
            if d.get('t') == 'cmd':
                print('Command:', d['c'])
                S['mode'] = {'takeoff': 'TAKEOFF', 'land': 'LANDING', 'rth': 'RETURN HOME',
                             'manual': 'MANUAL', 'disarm': 'DISARMED'}.get(d['c'], S['mode'])
            elif d.get('t') == 'rc' and S['mode'] == 'MANUAL':
                S['alt'] = max(0, S['alt'] + d['thr'] * 0.2)
    finally:
        clients.discard(ws)
        print('Phone disconnected')

async def loop():
    while True:
        await asyncio.sleep(0.2)
        if S['mode'] == 'TAKEOFF':
            S['alt'] += 0.5
            if S['alt'] >= 5:
                S['mode'] = 'MANUAL'
        elif S['mode'] in ('LANDING', 'RETURN HOME'):
            S['alt'] = max(0, S['alt'] - 0.4)
            if S['alt'] == 0:
                S['mode'] = 'DISARMED'
        if clients:
            websockets.broadcast(clients, json.dumps(dict(
                t='tele', alt=S['alt'], spd=0, bat=S['bat'], sat=12, dist=0, mode=S['mode'])))

async def main():
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    threading.Thread(target=ThreadingHTTPServer(('0.0.0.0', 8080), Web).serve_forever, daemon=True).start()
    async with websockets.serve(handler, '0.0.0.0', 8765):
        print(f'Open on phone: http://{my_ip()}:8080   (phone and computer on same Wi-Fi)')
        await loop()

asyncio.run(main())
