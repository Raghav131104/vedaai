import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import http from "http";

import { connectDB } from "./services/database";
import { setupWebSocket } from "./services/websocket";
import { setupWorkers } from "./workers/assessmentWorker";

import assignmentRoutes from "./routes/assignments";
import assessmentRoutes from "./routes/assessments";
import settingsRoutes from "./routes/settings";

console.log("REDIS_URL =", process.env.REDIS_URL);

const app = express();
const server = http.createServer(app);

/* -------------------- MIDDLEWARE -------------------- */

app.use(
  cors({
    origin: process.env.ALLOWED_ORIGINS?.split(",") || "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

/* -------------------- ROUTES -------------------- */

app.use("/api/assignments", assignmentRoutes);
app.use("/api/assessments", assessmentRoutes);
app.use("/api/settings", settingsRoutes);

app.get("/health", (_req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

/* -------------------- PORT FIX -------------------- */
/* Railway gives PORT env variable */

const PORT = Number(process.env.PORT) || 8080;

/* -------------------- BOOTSTRAP -------------------- */

async function bootstrap() {
  try {
    console.log("Connecting Mongo...");
    await connectDB();
    console.log("Mongo Connected");

    console.log("Starting WebSocket...");
    setupWebSocket(server);

    console.log("Starting BullMQ Workers...");
    setupWorkers();

    server.listen(PORT, "0.0.0.0", () => {
      console.log(`VedaAI Backend running on port ${PORT}`);
    });
  } catch (error) {
    console.error(" Failed to start server:", error);
    process.exit(1);
  }
}

bootstrap();