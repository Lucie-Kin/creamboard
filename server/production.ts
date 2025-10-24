import express, { type Request, Response, NextFunction } from "express";
import fs from "fs";
import path from "path";
import { createServer } from "http";
import { registerRoutes } from "./src/routes";

const app = express();

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  const reqPath = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (reqPath.startsWith("/api")) {
      let logLine = `${req.method} ${reqPath} ${res.statusCode} in ${duration}ms`;
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

const server = createServer(app);

(async () => {
  // Register API routes first
  await registerRoutes(app, server);

  // Production: serve pre-built static files
  const distPath = path.resolve(process.cwd(), "dist/public");
  
  if (!fs.existsSync(distPath)) {
    console.error(`❌ Production build not found at ${distPath}`);
    console.error(`Please run 'npm run build' first.`);
    process.exit(1);
  }

  app.use(express.static(distPath));

  // Serve index.html for all non-API routes (SPA fallback)
  app.get("*", (_req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });

  // Error handling middleware
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    console.error("Error:", err);
    res.status(status).json({ 
      message, 
      error: process.env.NODE_ENV === "development" ? err.stack : undefined 
    });
  });

  const port = parseInt(process.env.PORT || "5000", 10);
  
  server.listen(port, "0.0.0.0", () => {
    console.log(`🚀 Production server running on port ${port}`);
    console.log(`📁 Serving static files from: ${distPath}`);
    console.log(`🌐 URL: http://0.0.0.0:${port}`);
  });
})();
