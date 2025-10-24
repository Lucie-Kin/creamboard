import express, { type Request, Response, NextFunction } from "express";
import cors from "cors";
import { createServer } from "http";
import { registerRoutes } from "./routes";

const app = express();

// CORS configuration
const corsOptions = {
  origin: process.env.CORS_ORIGIN || "http://localhost:5173",
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

// Body parsing middleware
declare module 'http' {
  interface IncomingMessage {
    rawBody: unknown
  }
}

app.use(express.json({
  verify: (req, _res, buf) => {
    req.rawBody = buf;
  }
}));
app.use(express.urlencoded({ extended: false }));

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      console.log(logLine);
    }
  });

  next();
});

// Health check endpoint
app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

(async () => {
  const server = createServer(app);
  
  // Register API routes
  await registerRoutes(app, server);

  // Error handling middleware
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    console.error("Error:", err);
    res.status(status).json({ message, error: process.env.NODE_ENV === "development" ? err.stack : undefined });
  });

  // Server port configuration
  const port = parseInt(process.env.PORT || '3001', 10);
  
  server.listen(port, "0.0.0.0", () => {
    console.log(`🚀 Backend server running on port ${port}`);
    console.log(`📡 CORS enabled for: ${corsOptions.origin}`);
    console.log(`🏥 Health check: http://localhost:${port}/health`);
    console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
  });
})();
