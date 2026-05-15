// // import express from "express";
// // import cors from "cors";
// // import dotenv from "dotenv";
// // import morgan from "morgan";
// // import rateLimit from "express-rate-limit";

// // import connectDB from "./src/config/db.js";
// // import { errorHandler } from "./src/middleware/errorHandler.js";
// // import { validateEnv } from "./src/config/validateEnv.js";

// // // Routes
// // import authRoutes from "./src/routes/authRoutes.js";
// // import adminRoutes from "./src/routes/adminRoutes.js";
// // import serviceRoutes from "./src/routes/serviceRoutes.js";
// // import superAdminRoutes from "./src/routes/superAdminRoutes.js";

// // dotenv.config();
// // validateEnv();
// // connectDB();

// // const app = express();

// // // Middleware
// // app.use(
// //   cors({
// //     origin: process.env.CLIENT_URL || "http://localhost:5173", // React default
// //     credentials: true,
// //     methods: ["GET", "POST", "PUT", "DELETE"],
// //     allowedHeaders: ["Content-Type", "Authorization"],
// //   }),
// // );
// // app.use(express.json());
// // app.use(express.urlencoded({ extended: true }));

// // const limiter = rateLimit({
// //   windowMs: 15 * 60 * 1000, // 15 minutes
// //   max: 100, // Limit each IP to 100 requests
// //   message: "Too many requests from this IP",
// // });
// // const authLimiter = rateLimit({
// //   windowMs: 15 * 60 * 1000,
// //   max: 10, // Strict limit for login attempts
// //   message: "Too many login attempts, try again later",
// // });

// // app.use("/api", limiter); // Global limit
// // app.use("/api/auth/login", authLimiter); // Strict login limit

// // app.use(morgan("combined")); // Logs all requests

// // // API Routes
// // app.use("/api/auth", authRoutes);
// // app.use("/api/admin", adminRoutes);
// // app.use("/api/services", serviceRoutes);
// // app.use("/api/super-admin", superAdminRoutes);

// // // Health check
// // app.get("/health", (req, res) => {
// //   res.json({
// //     status: "ok",
// //     timestamp: new Date().toISOString(),
// //     uptime: process.uptime(),
// //   });
// // });

// // // Error handler (must be last)
// // app.use(errorHandler);

// // const PORT = process.env.PORT || 3000;
// // app.listen(PORT, () => {
// //   console.log(`🚀 Server running on http://localhost:${PORT}`);
// //   console.log(`📊 Health check: http://localhost:${PORT}/health`);
// // });

// // export default app;

// import express from "express";
// import cors from "cors";
// import dotenv from "dotenv";
// import morgan from "morgan";
// import rateLimit from "express-rate-limit";
// import connectDB from "./src/config/db.js";
// import { errorHandler } from "./src/middleware/errorHandler.js";

// // Route imports
// import authRoutes from "./src/routes/authRoutes.js";
// import adminRoutes from "./src/routes/adminRoutes.js";
// import serviceRoutes from "./src/routes/serviceRoutes.js";
// import superAdminRoutes from "./src/routes/superAdminRoutes.js";

// // Load environment variables
// dotenv.config();

// // Validate required environment variables
// const requiredEnvVars = ["PORT", "MONGO_URI", "JWT_SECRET", "NODE_ENV"];

// const validateEnv = () => {
//   const missing = requiredEnvVars.filter((key) => !process.env[key]);

//   if (missing.length > 0) {
//     console.error(`❌ Missing environment variables: ${missing.join(", ")}`);
//     console.error("Please check your .env file");
//     process.exit(1);
//   }

//   console.log("✅ Environment variables validated");
// };

// validateEnv();

// // Connect to MongoDB
// connectDB();

// const app = express();

// // ========================
// // SECURITY MIDDLEWARE
// // ========================

// // CORS Configuration
// app.use(
//   cors({
//     origin: process.env.CLIENT_URL || "http://localhost:5173",
//     credentials: true,
//     methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
//     allowedHeaders: ["Content-Type", "Authorization"],
//     exposedHeaders: ["Content-Range", "X-Content-Range"],
//     maxAge: 600, // 10 minutes
//   }),
// );

// // Rate Limiting
// const globalLimiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 100, // Limit each IP to 100 requests per windowMs
//   message: {
//     status: 429,
//     message:
//       "Too many requests from this IP, please try again after 15 minutes",
//   },
//   standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
//   legacyHeaders: false, // Disable the `X-RateLimit-*` headers
// });

// const authLimiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 10, // Strict limit for authentication routes
//   message: {
//     status: 429,
//     message: "Too many login attempts, please try again after 15 minutes",
//   },
//   skipSuccessfulRequests: true, // Don't count successful requests
// });

// // Apply rate limiters
// app.use("/api", globalLimiter); // Global API limit
// app.use("/api/auth/login", authLimiter); // Strict login limit

// // Body Parser
// app.use(express.json({ limit: "10mb" }));
// app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// // Request Logging
// if (process.env.NODE_ENV === "development") {
//   app.use(morgan("dev")); // Concise output for development
// } else {
//   app.use(morgan("combined")); // Standard Apache combined log output
// }

// // Request ID middleware (for tracking requests)
// app.use((req, res, next) => {
//   req.requestId =
//     Date.now().toString(36) + Math.random().toString(36).substr(2);
//   res.setHeader("X-Request-ID", req.requestId);
//   next();
// });

// // ========================
// // SECURITY HEADERS
// // ========================

// app.use((req, res, next) => {
//   res.setHeader("X-Content-Type-Options", "nosniff");
//   res.setHeader("X-Frame-Options", "DENY");
//   res.setHeader("X-XSS-Protection", "1; mode=block");
//   res.setHeader(
//     "Strict-Transport-Security",
//     "max-age=31536000; includeSubDomains",
//   );
//   res.setHeader("Content-Security-Policy", "default-src 'self'");
//   next();
// });

// // ========================
// // API ROUTES
// // ========================

// // Health Check
// app.get("/health", (req, res) => {
//   res.status(200).json({
//     status: "healthy",
//     timestamp: new Date().toISOString(),
//     uptime: process.uptime(),
//     environment: process.env.NODE_ENV,
//     memory: process.memoryUsage().heapUsed / 1024 / 1024,
//     requestId: req.requestId,
//   });
// });

// // API Version
// app.get("/api/version", (req, res) => {
//   res.json({
//     version: "1.0.0",
//     name: "Service Portal API",
//     environment: process.env.NODE_ENV,
//   });
// });

// // API Routes
// app.use("/api/auth", authRoutes);
// app.use("/api/admin", adminRoutes);
// app.use("/api/services", serviceRoutes);
// app.use("/api/super-admin", superAdminRoutes);

// // ========================
// // 404 HANDLER
// // ========================

// app.use((req, res, next) => {
//   res.status(404).json({
//     status: "error",
//     message: `Route ${req.originalUrl} not found`,
//     requestId: req.requestId,
//   });
// });

// // ========================
// // ERROR HANDLER (MUST BE LAST)
// // ========================

// app.use(errorHandler);

// // ========================
// // START SERVER
// // ========================

// const PORT = process.env.PORT || 3000;

// const startServer = async () => {
//   try {
//     app.listen(PORT, () => {
//       console.log("=".repeat(60));
//       console.log(`🚀 Server running on http://localhost:${PORT}`);
//       console.log(`📊 Health check: http://localhost:${PORT}/health`);
//       console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
//       console.log(`🔒 Rate limiting: Enabled`);
//       console.log(
//         `📝 Logging: ${process.env.NODE_ENV === "development" ? "Dev" : "Combined"}`,
//       );
//       console.log(
//         `🌐 CORS: ${process.env.CLIENT_URL || "http://localhost:5173"}`,
//       );
//       console.log("=".repeat(60));
//     });
//   } catch (error) {
//     console.error("❌ Failed to start server:", error.message);
//     process.exit(1);
//   }
// };

// startServer();

// // ========================
// // GRACEFUL SHUTDOWN
// // ========================

// const gracefulShutdown = async (signal) => {
//   console.log(`\n${signal} received. Shutting down gracefully...`);

//   try {
//     // Close MongoDB connection
//     await mongoose.connection.close();
//     console.log("📦 MongoDB connection closed");

//     // Exit process
//     process.exit(0);
//   } catch (error) {
//     console.error("❌ Error during shutdown:", error.message);
//     process.exit(1);
//   }
// };

// // Handle shutdown signals
// process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
// process.on("SIGINT", () => gracefulShutdown("SIGINT"));

// // Handle uncaught exceptions
// process.on("uncaughtException", (error) => {
//   console.error("❌ Uncaught Exception:", error);
//   gracefulShutdown("UNCAUGHT_EXCEPTION");
// });

// // Handle unhandled promise rejections
// process.on("unhandledRejection", (reason, promise) => {
//   console.error("❌ Unhandled Rejection at:", promise, "reason:", reason);
//   gracefulShutdown("UNHANDLED_REJECTION");
// });

// export default app;

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import morgan from "morgan";
import connectDB from "./src/config/db.js";
import { errorHandler } from "./src/middleware/errorHandler.js";

// Route imports
import authRoutes from "./src/routes/authRoutes.js";
import adminRoutes from "./src/routes/adminRoutes.js";
import serviceRoutes from "./src/routes/serviceRoutes.js";
import superAdminRoutes from "./src/routes/superAdminRoutes.js";

// Load environment variables
dotenv.config();

// Validate required environment variables
const requiredEnvVars = ["PORT", "MONGO_URI", "JWT_SECRET"];

const validateEnv = () => {
  const missing = requiredEnvVars.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    console.error(`❌ Missing environment variables: ${missing.join(", ")}`);
    console.error("Please check your .env file");
    process.exit(1);
  }

  console.log("✅ Environment variables validated");
};

validateEnv();

// Connect to MongoDB
connectDB();

const app = express();

// ========================
// MIDDLEWARE
// ========================

// CORS
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

// Body Parser
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Request Logging
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
} else {
  app.use(morgan("combined"));
}

// ========================
// ROUTES
// ========================

// Health Check
app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || "development",
  });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/super-admin", superAdminRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    status: "error",
    message: `Route ${req.originalUrl} not found`,
  });
});

// Error Handler
app.use(errorHandler);

// ========================
// START SERVER
// ========================

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("=".repeat(50));
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log("=".repeat(50));
});

export default app;