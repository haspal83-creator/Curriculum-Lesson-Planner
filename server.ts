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

  app.use(express.json({ limit: '10mb' }));

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
