import { spawn } from 'child_process';
import net from 'net';

const GATEWAY_PORT = 5173;
const VITE_PORT = 5174;

// 1. Gateway Server
const gateway = net.createServer((clientSocket) => {
  clientSocket.once('data', (firstChunk) => {
    // 0x16 (22 in decimal) is TLS ClientHello (HTTPS)
    if (firstChunk[0] === 22) {
      const viteSocket = net.connect(VITE_PORT, '127.0.0.1', () => {
        viteSocket.write(firstChunk);
        clientSocket.pipe(viteSocket);
        viteSocket.pipe(clientSocket);
      });

      viteSocket.on('error', () => {
        clientSocket.destroy();
      });
      clientSocket.on('error', () => {
        viteSocket.destroy();
      });
    } else {
      // Plain HTTP request: Send 302 Redirect to HTTPS
      const raw = firstChunk.toString('utf-8');
      const hostMatch = raw.match(/Host:\s*([^\r\n]+)/i);
      const host = hostMatch ? hostMatch[1].split(':')[0] : '192.168.69.197';
      const pathMatch = raw.match(/GET\s+([^\s]+)/i);
      const path = pathMatch ? pathMatch[1] : '/';

      const response =
        'HTTP/1.1 302 Found\r\n' +
        `Location: https://${host}:${GATEWAY_PORT}${path}\r\n` +
        'Connection: close\r\n' +
        'Content-Type: text/html\r\n' +
        'Content-Length: 0\r\n\r\n';

      clientSocket.end(response);
    }
  });

  clientSocket.on('error', () => {});
});

gateway.listen(GATEWAY_PORT, '0.0.0.0', () => {
  console.log(`[Bionet Gateway] Running on port ${GATEWAY_PORT}`);
  console.log(`  -> HTTP traffic automatically redirects to HTTPS :${GATEWAY_PORT}`);
  console.log(`  -> HTTPS traffic is piped to Vite :${VITE_PORT}`);
});

// 2. Start Vite on port 5174
const isWindows = process.platform === 'win32';
const npxCmd = isWindows ? 'npx.cmd' : 'npx';
const viteProc = spawn(npxCmd, ['vite', '--host', '0.0.0.0', '--port', String(VITE_PORT)], {
  stdio: 'inherit',
  shell: true,
});

viteProc.on('exit', (code) => {
  gateway.close();
  process.exit(code || 0);
});

process.on('SIGINT', () => {
  viteProc.kill();
  gateway.close();
  process.exit(0);
});

