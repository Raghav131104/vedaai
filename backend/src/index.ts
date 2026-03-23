import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import http from 'http';
import { connectDB } from './services/database';
import { setupWebSocket } from './services/websocket';
import { setupWorkers } from './workers/assessmentWorker';
import assignmentRoutes from './routes/assignments';
import assessmentRoutes from './routes/assessments';
import settingsRoutes from './routes/settings';

console.log("REDIS_URL =", process.env.REDIS_URL);

const app = express();
const server = http.createServer(app);

app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.use('/api/assignments', assignmentRoutes);
app.use('/api/assessments', assessmentRoutes);
app.use('/api/settings', settingsRoutes);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 8080;

async function bootstrap() {
  try {
    await connectDB();
    setupWebSocket(server);
    setupWorkers();

    server.listen(PORT, () => {
      console.log(`VedaAI Backend running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

bootstrap();