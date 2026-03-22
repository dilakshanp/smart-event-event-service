import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";

import swaggerRoute from "./routes/swaggerRoute.js";
import eventRoutes from "./routes/eventRoutes.js";

dotenv.config();

export const app = express();

// Security middleware (DevSecOps best practices)
app.use(helmet()); // Secure headers
app.use(cors({ origin: "*" })); // Later restrict to your frontend
app.use(express.json());
app.use(apiLimiter); // Rate limiting

// Routes
app.use("/api/events", eventRoutes);

// Swagger docs
app.use("/api-docs", swaggerRoute);

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "healthy",
    service: "event-service",
    timestamp: new Date().toISOString(),
  });
});

// DB connection
export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected");
  } catch (err) {
    console.error(err);
  }
};

// Start server only if not testing
if (process.env.NODE_ENV !== "test") {
  connectDB();

  const PORT = process.env.PORT || 3002;
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}
