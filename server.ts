import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import generateHandler from "./api/ai/generate";

// Use a safe way to derive __dirname and __filename that works in both ESM and CJS
let __filename = '';
let __dirname = '';

try {
  // @ts-ignore
  if (typeof __filename !== 'undefined') {
    // @ts-ignore
    __filename = __filename;
    // @ts-ignore
    __dirname = __dirname;
  } else {
    __filename = fileURLToPath(import.meta.url);
    __dirname = path.dirname(__filename);
  }
} catch (e) {
  __dirname = process.cwd();
  __filename = path.join(__dirname, 'server.ts');
}

async function startServer() {
  const app = express();
  const PORT = 3000;

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

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer().catch(err => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
