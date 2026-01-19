import express, { type Express } from "express";
import { createServer as createViteServer, createLogger } from "vite";
import { type Server } from "http";
import viteConfig from "../vite.config";
import fs from "fs";
import path from "path";
import { nanoid } from "nanoid";
import { fileURLToPath } from "url";

const dirname = path.dirname(fileURLToPath(import.meta.url));

const viteLogger = createLogger();

export async function setupVite(server: Server, app: Express) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server, path: "/vite-hmr" },
    allowedHosts: true as const,
  };

  const vite = await createViteServer({
    ...viteConfig,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      },
    },
    server: serverOptions,
    appType: "custom",
  });

  app.use(vite.middlewares);

  // Serve static files (CSS, JS, images) from the frontend directory
  // This must come BEFORE the catch-all route to properly serve static assets
  const frontendPath = path.resolve(dirname, "..", "..", "frontend");
  app.use("/src", express.static(path.join(frontendPath, "src"), {
    setHeaders: (res, filePath) => {
      if (filePath.endsWith('.css')) {
        res.setHeader('Content-Type', 'text/css');
      }
    }
  }));
  app.use("/assets", express.static(path.join(frontendPath, "assets"), {
    setHeaders: (res) => {
      res.setHeader('Cache-Control', 'public, max-age=31536000');
    }
  }));
  app.use("/public", express.static(path.join(frontendPath, "public")));

  // Also serve from root level for built assets
  app.use(express.static(frontendPath));

  app.use("/{*path}", async (req, res, next) => {
    const url = req.originalUrl;

    // Skip if it's a static asset request
    if (url.includes('.') && !url.endsWith('/')) {
      return next();
    }

    try {
      const clientTemplate = path.resolve(
        dirname,
        "..",
        "..",
        "frontend",
        "index.html",
      );

      // always reload the index.html file from disk incase it changes
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`,
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}
