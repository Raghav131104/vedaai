import { WebSocket, WebSocketServer } from 'ws';
import http from 'http';

let wss: WebSocketServer;
const clients = new Map<string, WebSocket>();

export function setupWebSocket(server: http.Server): void {
  wss = new WebSocketServer({ server, path: '/ws' });

  wss.on('connection', (ws, req) => {
    const url = new URL(req.url || '', `http://${req.headers.host}`);
    const jobId = url.searchParams.get('jobId') || 'anonymous';
    
    clients.set(jobId, ws);
    console.log(`WebSocket connected for job: ${jobId}`);

    ws.on('close', () => {
      clients.delete(jobId);
    });

    ws.send(JSON.stringify({ type: 'connected', jobId }));
  });

  console.log('WebSocket server initialized');
}

export function sendJobUpdate(jobId: string, payload: object): void {
  const client = clients.get(jobId);
  if (client && client.readyState === WebSocket.OPEN) {
    client.send(JSON.stringify(payload));
  }
}

export function broadcast(payload: object): void {
  wss?.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(payload));
    }
  });
}
