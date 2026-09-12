import http from 'http';

/**
 * AgriSense Real-time Farm Simulation State Sync Server
 * Zero-dependency Node.js HTTP + Server-Sent Events (SSE) server
 * Enables sub-10ms real-time synchronized state broadcasting between:
 * - Phone 1: Farmer Dashboard (http://<IP>:3000)
 * - Phone 2: Farm Demo Controller (http://<IP>:3001)
 */

let PORT = parseInt(process.env.SYNC_SERVER_PORT || process.env.PORT || '8000', 10);
const HOST = '0.0.0.0';

let currentFarmState = {
  mode: 'NORMAL',
  last_updated: new Date().toLocaleTimeString(),
  updated_at: Date.now()
};

// Set of active SSE client responses
const sseClients = new Set();

function broadcastState(state) {
  const payload = `data: ${JSON.stringify(state)}\n\n`;
  for (const client of sseClients) {
    try {
      client.write(payload);
    } catch (err) {
      sseClients.delete(client);
    }
  }
}

// Heartbeat keep-alive every 15s to maintain stable mobile connections
setInterval(() => {
  for (const client of sseClients) {
    try {
      client.write(': keepalive\n\n');
    } catch (err) {
      sseClients.delete(client);
    }
  }
}, 15000);

const server = http.createServer(async (req, res) => {
  // Global CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = url.pathname.replace(/\/+$/, '') || '/';

  // 1. Health check & Root
  if (pathname === '/' || pathname === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'healthy',
      service: 'agrisense-farm-sync-server',
      current_state: currentFarmState,
      active_sse_subscribers: sseClients.size
    }));
    return;
  }

  // 2. Real-time SSE Stream Endpoint
  if (pathname === '/api/farm-state/stream' || pathname === '/api/v1/farm-state/stream') {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no'
    });

    // Send immediate current state snapshot on connect
    res.write(`data: ${JSON.stringify(currentFarmState)}\n\n`);

    sseClients.add(res);

    req.on('close', () => {
      sseClients.delete(res);
    });
    return;
  }

  // 3. GET /api/farm-state (Fetch current simulation state)
  if ((pathname === '/api/farm-state' || pathname === '/api/v1/farm-state') && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(currentFarmState));
    return;
  }

  // 4. POST /api/farm-state (Set simulation mode: NORMAL, DRY, WET)
  if ((pathname === '/api/farm-state' || pathname === '/api/v1/farm-state') && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const parsed = JSON.parse(body || '{}');
        const mode = (parsed.mode || '').toUpperCase().trim();

        if (!['NORMAL', 'DRY', 'WET'].includes(mode)) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Invalid mode. Must be NORMAL, DRY, or WET.' }));
          return;
        }

        currentFarmState = {
          mode,
          last_updated: new Date().toLocaleTimeString(),
          updated_at: Date.now()
        };

        // Instant broadcast to all connected devices (Farmer App, Controller, etc.)
        broadcastState(currentFarmState);

        console.log(`[SyncServer] 🌾 Farm State updated to: [${mode}] at ${currentFarmState.last_updated} (Subscribers: ${sseClients.size})`);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: true,
          mode: currentFarmState.mode,
          last_updated: currentFarmState.last_updated
        }));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid JSON payload' }));
      }
    });
    return;
  }

  // Fallback 404
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Endpoint not found' }));
});

function startListening(port) {
  server.listen(port, HOST, () => {
    console.log(`\n==================================================`);
    console.log(`🚀 AgriSense Farm State Sync Server running!`);
    console.log(`📡 Local / Wi-Fi Access: http://${HOST}:${port}`);
    console.log(`🌱 Current Farm State: [${currentFarmState.mode}]`);
    console.log(`==================================================\n`);
  });
}

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE' && PORT === 8000) {
    console.log(`[SyncServer] Port 8000 in use (e.g. by FastAPI backend). Starting on fallback port 4000...`);
    PORT = 4000;
    startListening(PORT);
  } else {
    console.error('[SyncServer] Server error:', err);
  }
});

startListening(PORT);
