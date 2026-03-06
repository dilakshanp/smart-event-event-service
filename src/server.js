import express, { json } from "express";
import { connect } from "mongoose";
import cors from "cors";
import helmet from "helmet";
import { config } from "dotenv";

config();

import eventRoutes from "./routes/eventRoutes.js";

const app = express();

// Security & middleware
app.use(helmet());
app.use(cors());
app.use(json());

// Routes
app.use("/api/events", eventRoutes);

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "healthy",
    service: "event-service",
    timestamp: new Date().toISOString(),
  });
});

// MongoDB connection
connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`🚀 Event Service running on http://localhost:${PORT}`);
});
