import "dotenv/config";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import logger from "./logger/index.js";
import todoRoutes from "./routes/todo.js";
import { AppError } from "./errors/index.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import { rateLimiter } from "./middlewares/rateLimiter.js";

const app = express();
const PORT = process.env.PORT ?? 5000;

app.use(cors());
app.use(express.json());
app.use(rateLimiter);
app.use("/api/todos", todoRoutes);

app.use((req, _res, next) => {
  next(new AppError(`Route ${req.method} ${req.originalUrl} not found`, 404));
});

app.use(errorHandler);

process.on("unhandledRejection", (reason) => {
  logger.fatal({ reason }, "Unhandled Rejection");
  process.exit(1);
});

process.on("uncaughtException", (error) => {
  logger.fatal({ error }, "Uncaught Exception");
  process.exit(1);
});

const start = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI!);
    logger.info("Connected to MongoDB");

    app.listen(PORT, () => {
      logger.info({ port: PORT }, "Server running");
    });
  } catch (error) {
    logger.fatal({ error }, "Failed to start server");
    process.exit(1);
  }
};

start();
