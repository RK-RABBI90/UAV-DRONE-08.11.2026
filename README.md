# SkyDeck

Drone control simulator (virtual joysticks, telemetry, takeoff/land/return-home) and a searchable Learn section, with Bangla pronunciation and meaning for English words.

## Run
Open `index.html` in a browser. No build step needed.

## Host free on GitHub Pages
Settings -> Pages -> Deploy from branch -> `main` / root.

## Connect a real drone
Edit `sendToDrone(cmd)` in `index.html` and send commands to a MAVLink-to-WebSocket bridge (for example mavlink2rest or MAVProxy) running on a companion computer.
