import { spawn } from 'child_process';

/**
 * Unified Hackathon Launcher for AgriSense
 * Launches:
 * 1. Shared State Sync Server on :8000
 * 2. Farmer Dashboard on :3000
 * 3. Farm Demo Controller on :3001
 */

console.log('==================================================');
console.log('🚀 Starting AgriSense Farm Simulation Suite...');
console.log('==================================================');

const processes = [];

function runProcess(name, cmd, args, env = {}) {
  const p = spawn(cmd, args, {
    stdio: 'inherit',
    shell: true,
    env: { ...process.env, ...env }
  });

  p.on('error', (err) => {
    console.error(`[${name}] Error:`, err);
  });

  p.on('exit', (code) => {
    console.log(`[${name}] Exited with code ${code}`);
  });

  processes.push(p);
  return p;
}

// 1. Start Sync Server on :8000
runProcess('Sync Server', 'node', ['server/farmStateServer.js']);

// 2. Start Farmer Dashboard on :3000
setTimeout(() => {
  runProcess('Farmer App', 'npx', ['vite', '--port', '3000', '--host', '0.0.0.0']);
}, 600);

// 3. Start Demo Controller on :3001
setTimeout(() => {
  runProcess('Demo Controller', 'npx', ['vite', '--config', 'vite.controller.config.js']);
}, 1200);

function cleanup() {
  console.log('\n🛑 Shutting down AgriSense processes...');
  for (const p of processes) {
    try {
      p.kill();
    } catch (e) {}
  }
  process.exit(0);
}

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
