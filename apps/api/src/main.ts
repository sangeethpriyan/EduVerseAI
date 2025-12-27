import express, { Express, Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { connectMongoDB, disconnectMongoDB, disconnectPrisma } from "@eduverse/db";
import authRoutes from "./routes/auth.routes";
import studentRoutes from "./routes/student.routes";
import teacherRoutes from "./routes/teacher.routes";
import adminRoutes from "./routes/admin.routes";
import aiRoutes from "./routes/ai.routes";
import documentRoutes from "./routes/document.routes";
import { errorHandler } from "./middleware/auth";
import { ApiResponseHandler, logger } from "./utils/index";
import cookieParser from "cookie-parser";

const app: Express = express();
const PORT = process.env.API_PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.NEXT_PUBLIC_WEB_URL || "http://localhost:3000",
  credentials: true,
}));

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use(cookieParser());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});
app.use("/api/", limiter);

// Request logging middleware
app.use((req: Request, _res: Response, next: NextFunction) => {
  logger.info(`${req.method} ${req.path}`, {
    query: req.query,
    body: req.method !== "GET" ? req.body : undefined,
  });
  next();
});

// Health check
app.get("/health", (_req: Request, res: Response) => {
  ApiResponseHandler.success(res, { status: "healthy" });
});

// API routes
app.use("/api", authRoutes);
app.use("/api", studentRoutes);
app.use("/api", teacherRoutes);
app.use("/api", adminRoutes);
app.use("/api", aiRoutes);
app.use("/api", documentRoutes);

// 404 handler
app.use((_req: Request, res: Response) => {
  ApiResponseHandler.notFound(res, "Endpoint not found");
});

// Error handler
app.use(errorHandler);

// Initialize server
async function startServer(): Promise<void> {
  try {
    // Connect to MongoDB
    await connectMongoDB();
    logger.info("Connected to MongoDB");

    // Start server
    app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
      console.log(`✅ API server listening on http://localhost:${PORT}`);
      console.log(`🏥 Health check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    logger.error("Failed to start server", { error });
    process.exit(1);
  }
}

// Graceful shutdown
process.on("SIGTERM", async () => {
  logger.info("SIGTERM received, shutting down gracefully");
  await disconnectPrisma();
  await disconnectMongoDB();
  process.exit(0);
});

process.on("SIGINT", async () => {
  logger.info("SIGINT received, shutting down gracefully");
  await disconnectPrisma();
  await disconnectMongoDB();
  process.exit(0);
});

startServer();

export default app;
