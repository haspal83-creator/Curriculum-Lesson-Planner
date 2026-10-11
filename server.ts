import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import generateHandler from "./api/ai/generate";

// Use a safe way to derive __dirname and __filename that works in both ESM and CJS
const getDirname = () => {
  try {
    return path.dirname(fileURLToPath(import.meta.url));
  } catch {
    return process.cwd();
  }
};

async function startServer() {
  const app = express();
  
  // Support CLI arguments (--port, --host) passed by Vite/AI Studio runner
  let port = 3000;
  let host = "0.0.0.0";

  const portArgIndex = process.argv.indexOf("--port");
  if (portArgIndex !== -1 && process.argv[portArgIndex + 1]) {
    const parsed = parseInt(process.argv[portArgIndex + 1], 10);
    if (!isNaN(parsed)) port = parsed;
  }

  const hostArgIndex = process.argv.indexOf("--host");
  if (hostArgIndex !== -1 && process.argv[hostArgIndex + 1]) {
    host = process.argv[hostArgIndex + 1];
  }

  // Allow large payloads for multi-page curriculum PDFs and document uploads
  app.use(express.json({ limit: '100mb' }));
  app.use(express.urlencoded({ limit: '100mb', extended: true }));

  // Gracefully handle payload too large or invalid body formatting
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (err && (err.type === 'entity.too.large' || err.status === 413 || err.statusCode === 413)) {
      return res.status(413).json({
        success: false,
        error: 'The uploaded file or request payload is too large. Please upload files under 50MB.',
      });
    }
    if (err instanceof SyntaxError && 'body' in err) {
      return res.status(400).json({
        success: false,
        error: 'Invalid JSON payload received.',
      });
    }
    next(err);
  });

  // Health Check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // API Routes
  app.all(["/api/ai/generate", "/api/generate"], (req, res) => {
    return generateHandler(req as any, res as any);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(port, host, () => {
    console.log(`Server running on http://${host === '0.0.0.0' ? 'localhost' : host}:${port}`);
    console.log(`  ➜  Local:   http://localhost:${port}/`);
    console.log(`  ➜  Network: http://${host}:${port}/`);
  });
}

startServer().catch(err => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
