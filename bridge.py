#!/usr/bin/env python3
"""UAV/DRONE bridge: phone app <-> ArduPilot Copter (MAVLink).
Run on a computer connected to the drone (Raspberry Pi, laptop, telemetry radio).
Then open  http://<this-computer-ip>:8080  on the phone (same Wi-Fi / hotspot)."""
import argparse, asyncio, json, math, os, socket, threading, time
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
import websockets
from pymavlink import mavutil

ap = argparse.ArgumentParser()
ap.add_argument('--mav', default='udp:127.0.0.1:14550', help='e.g. /dev/ttyACM0 or udp:127.0.0.1:14550')
ap.add_argument('--baud', type=int, default=115200)
ap.add_argument('--ws-port', type=int, default=8765)
ap.add_argument('--http-port', type=int, default=8080)
ap.add_argument('--video', type=int, default=None, help='camera index, serves /video (needs opencv-python)')
ap.add_argument('--max-alt', type=float, default=30.0, help='takeoff height limit in metres')
a = ap.parse_args()

m = mavutil.mavlink_connection(a.mav, baud=a.baud)
m.wait_heartbeat()
m.mav.request_data_stream_send(m.target_system, m.target_component, mavutil.mavlink.MAV_DATA_STREAM_ALL, 4, 1)
print('Drone connected')

S = dict(alt=0.0, spd=0.0, bat=0, sat=0, dist=0.0, armed=False, fm='')
home = None
manual = False
last_rc = time.time()
clients = set()

def my_ip():
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(('8.8.8.8', 80))
        return s.getsockname()[0]
    except Exception:
        return '<this-ip>'

def dist(p, q):
    la1, lo1, la2, lo2 = map(math.radians, (*p, *q))
    h = math.sin((la2 - la1) / 2) ** 2 + math.cos(la1) * math.cos(la2) * math.sin((lo2 - lo1) / 2) ** 2
    return 2 * 6371000 * math.asin(math.sqrt(h))

def reader():
    global home
    while True:
        msg = m.recv_match(blocking=True, timeout=1)
        if not msg:
            continue
        t = msg.get_type()
        if t == 'GLOBAL_POSITION_INT':
            S['alt'] = msg.relative_alt / 1000
            S['pos'] = (msg.lat / 1e7, msg.lon / 1e7)
            if home:
                S['dist'] = dist(home, S['pos'])
        elif t == 'VFR_HUD':
            S['spd'] = msg.groundspeed
        elif t == 'SYS_STATUS':
            S['bat'] = msg.battery_remaining
        elif t == 'GPS_RAW_INT':
            S['sat'] = msg.satellites_visible
        elif t == 'HEARTBEAT' and msg.get_srcSystem() == m.target_system:
            armed = bool(msg.base_mode & mavutil.mavlink.MAV_MODE_FLAG_SAFETY_ARMED)
            if armed and not S['armed'] and 'pos' in S:
                home = S['pos']
            S['armed'] = armed
            S['fm'] = m.flightmode

threading.Thread(target=reader, daemon=True).start()

def app_mode():
    if not S['armed']:
        return 'DISARMED'
    return {'RTL': 'RETURN HOME', 'LAND': 'LANDING', 'GUIDED': 'TAKEOFF'}.get(S['fm'], 'MANUAL')

def pwm(v):
    return int(1500 + 400 * max(-1, min(1, v)))

def send_rc(thr, yaw, pit, rol):
    # ArduCopter: ch1 roll, ch2 pitch (forward = lower pwm), ch3 throttle, ch4 yaw
    m.mav.rc_channels_override_send(m.target_system, m.target_component,
                                    pwm(rol), pwm(-pit), pwm(thr), pwm(yaw), 0, 0, 0, 0)

def release():
    m.mav.rc_channels_override_send(m.target_system, m.target_component, 0, 0, 0, 0, 0, 0, 0, 0)

def failsafe():
    global manual
    print('Failsafe: control lost -> RTL')
    release()
    m.set_mode('RTL')
    manual = False

def cmd(c):
    global manual
    if c == 'manual':
        m.set_mode('LOITER')   # GPS position hold; centred sticks = hover
        manual = True
        return
    manual = False
    release()
    if c == 'takeoff':
        m.set_mode('GUIDED')
        m.arducopter_arm()
        for _ in range(100):
            if S['armed']:
                break
            time.sleep(0.1)
        m.mav.command_long_send(m.target_system, m.target_component,
                                mavutil.mavlink.MAV_CMD_NAV_TAKEOFF, 0, 0, 0, 0, 0, 0, 0, min(5, a.max_alt))
    elif c == 'land':
        m.set_mode('LAND')
    elif c == 'rth':
        m.set_mode('RTL')
    elif c == 'disarm':
        m.arducopter_disarm()

async def handler(ws):
    global last_rc
    clients.add(ws)
    try:
        async for raw in ws:
            d = json.loads(raw)
            if d.get('t') == 'rc':
                last_rc = time.time()
                if manual:
                    send_rc(d['thr'], d['yaw'], d['pit'], d['rol'])
            elif d.get('t') == 'cmd':
                await asyncio.get_running_loop().run_in_executor(None, cmd, d['c'])
    finally:
        clients.discard(ws)
        if not clients and manual:
            failsafe()

async def telemetry():
    while True:
        await asyncio.sleep(0.2)
        if clients:
            websockets.broadcast(clients, json.dumps(dict(
                t='tele', alt=S['alt'], spd=S['spd'], bat=S['bat'], sat=S['sat'],
                dist=S['dist'], mode=app_mode())))

async def watchdog():
    while True:
        await asyncio.sleep(0.5)
        if manual and time.time() - last_rc > 1.5:
            failsafe()

cap = None
if a.video is not None:
    import cv2
    cap = cv2.VideoCapture(a.video)

class Web(SimpleHTTPRequestHandler):
    def log_message(self, *x):
        pass
    def do_GET(self):
        if self.path == '/video' and cap:
            self.send_response(200)
            self.send_header('Content-Type', 'multipart/x-mixed-replace; boundary=f')
            self.end_headers()
            try:
                while True:
                    ok, fr = cap.read()
                    if not ok:
                        break
                    j = cv2.imencode('.jpg', fr, [cv2.IMWRITE_JPEG_QUALITY, 60])[1].tobytes()
                    self.wfile.write(b'--f\r\nContent-Type: image/jpeg\r\nContent-Length: %d\r\n\r\n' % len(j) + j + b'\r\n')
            except Exception:
                pass
            return
        super().do_GET()

os.chdir(os.path.dirname(os.path.abspath(__file__)))
threading.Thread(target=ThreadingHTTPServer(('0.0.0.0', a.http_port), Web).serve_forever, daemon=True).start()

async def main():
    async with websockets.serve(handler, '0.0.0.0', a.ws_port):
        print(f'Open on phone: http://{my_ip()}:{a.http_port}   (same Wi-Fi)')
        await asyncio.gather(telemetry(), watchdog())

asyncio.run(main())
