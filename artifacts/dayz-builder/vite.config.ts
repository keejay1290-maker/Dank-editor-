import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import fs from "fs";
import { exec } from "child_process";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";

const rawPort = process.env.PORT || "5173";

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

const basePath = process.env.BASE_PATH || "/";

if (!basePath) {
  throw new Error(
    "BASE_PATH environment variable is required but was not provided.",
  );
}

export default defineConfig({
  base: basePath,
  plugins: [
    react(),
    tailwindcss(),
    runtimeErrorOverlay(),
    {
      name: 'airdrop-api',
      configureServer(server) {
        const AIRDROPS_DIR = 'C:/Users/Shadow/Documents/DayZ/Editor/Custom/airdrops';
        
        server.middlewares.use('/api/vault/fetch', (req: any, res: any, next: any) => {
          if (req.method === 'GET') {
            const url = new URL(req.url, `http://${req.headers.host}`);
            const filePath = url.searchParams.get('path');
            if (filePath && fs.existsSync(filePath)) {
              try {
                const content = fs.readFileSync(filePath, 'utf-8');
                res.setHeader('Content-Type', 'text/plain; charset=utf-8');
                res.end(content);
              } catch (e: any) {
                res.statusCode = 500;
                res.end(JSON.stringify({ error: e.message }));
              }
              return;
            }
          }
          next();
        });

        server.middlewares.use('/api/vault/download', (req: any, res: any, next: any) => {
          if (req.method === 'GET') {
            const url = new URL(req.url, `http://${req.headers.host}`);
            const filePath = url.searchParams.get('path');
            if (filePath && fs.existsSync(filePath)) {
              try {
                const filename = path.basename(filePath);
                res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
                res.setHeader('Content-Type', 'application/octet-stream');
                fs.createReadStream(filePath).pipe(res);
              } catch (e: any) {
                res.statusCode = 500;
                res.end(JSON.stringify({ error: e.message }));
              }
              return;
            }
          }
          next();
        });

        server.middlewares.use((req: any, res: any, next: any) => {
          if ((req.url.endsWith('/api/vault/sync') || req.url.includes('/api/vault/sync?')) && req.method === 'POST') {
            const scriptPath = path.resolve(import.meta.dirname, '..', '..', 'scripts', 'sync_vault.mjs');
            console.log(`[DankVault] Attempting sync with script: ${scriptPath}`);
            
            res.setHeader('Content-Type', 'application/json');
            
            if (!fs.existsSync(scriptPath)) {
              res.statusCode = 500;
              res.end(JSON.stringify({ success: false, error: `Sync script not found at ${scriptPath}` }));
              return;
            }

            exec(`node "${scriptPath}"`, (error: any, stdout: any, stderr: any) => {
              if (error) {
                console.error(`[DankVault] Sync Error: ${error.message}`);
                res.statusCode = 500;
                res.end(JSON.stringify({ success: false, error: error.message, stderr }));
                return;
              }
              console.log(`[DankVault] Sync Success: ${stdout.trim()}`);
              res.end(JSON.stringify({ success: true, message: "Sync complete", output: stdout.trim() }));
            });
            return;
          }
          next();
        });

        server.middlewares.use('/api/pipeline/summary', (req: any, res: any, next: any) => {
          if (req.method === 'POST') {
            let body = '';
            req.on('data', (chunk: any) => { body += chunk; });
            req.on('end', () => {
              try {
                const data = JSON.parse(body);
                const desktop = path.join(process.env.USERPROFILE || 'C:/Users/Shadow', 'Desktop');
                const copilotDir = path.join(desktop, 'copilot');
                if (!fs.existsSync(copilotDir)) fs.mkdirSync(copilotDir, { recursive: true });

                const ts = Date.now();
                const filename = `last_summary.txt`;
                const filePath = path.join(copilotDir, filename);

                const content = [
                  `DANKVAULT™ PIPELINE SUMMARY ARCHIVE`,
                  `------------------------------------`,
                  `builderName: ${data.builderName}`,
                  `theme: ${data.theme}`,
                  `shape_original: ${data.shape_original}`,
                  `shape_normalised: ${data.shape_normalised}`,
                  `silhouette: ${data.silhouette}`,
                  `total object count: ${data.totalObjectCount}`,
                  `stageCounts: ${JSON.stringify(data.stageCounts, null, 2)}`,
                  `pipelineMap: ${JSON.stringify(data.pipelineMap, null, 2)}`,
                  `errors: ${JSON.stringify(data.errors, null, 2)}`,
                  `final fidelityScore: ${data.fidelityScore}`,
                  `timestamp: ${data.timestamp}`,
                  `------------------------------------`
                ].join('\n');

                fs.writeFileSync(filePath, content, 'utf-8');
                console.log(`[PIPELINE_SUMMARY] Written: ${filePath}`);
                res.end(JSON.stringify({ success: true, path: filePath }));
              } catch (e: any) {
                res.statusCode = 500;
                res.end(JSON.stringify({ error: e.message }));
              }
            });
            return;
          }
          next();
        });

        server.middlewares.use('/api/airdrops', (req: any, res: any, next: any) => {
          if (req.method === 'GET' && (req.url === '/' || req.url === '')) {
            try {
              if (!fs.existsSync(AIRDROPS_DIR)) fs.mkdirSync(AIRDROPS_DIR, { recursive: true });
              const files = fs.readdirSync(AIRDROPS_DIR).filter(f => f.endsWith('.json'));
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify(files));
            } catch (e: any) {
              res.statusCode = 500;
              res.end(JSON.stringify({ error: e.message }));
            }
            return;
          }

          const match = req.url?.match(/^\/([^/]+\.json)$/);
          if (match) {
            const filename = match[1];
            const filePath = path.join(AIRDROPS_DIR, filename);

            if (req.method === 'GET') {
               try {
                 const content = fs.readFileSync(filePath, 'utf-8');
                 res.setHeader('Content-Type', 'application/json');
                 res.end(content);
               } catch (e) {
                 res.statusCode = 404;
                 res.end(JSON.stringify({ error: "File not found" }));
               }
            } else if (req.method === 'POST') {
               let body = '';
               req.on('data', (chunk: any) => { body += chunk; });
               req.on('end', () => {
                 try {
                   fs.writeFileSync(filePath, body, 'utf-8');
                   res.end(JSON.stringify({ success: true }));
                 } catch (e: any) {
                   res.statusCode = 500;
                   res.end(JSON.stringify({ error: e.message }));
                 }
               });
            }
            return;
          }
          next();
        });
      }
    },
    ...(process.env.NODE_ENV !== "production" &&
    process.env.REPL_ID !== undefined
      ? [
          await import("@replit/vite-plugin-cartographer").then((m) =>
            m.cartographer({
              root: path.resolve(import.meta.dirname, ".."),
            }),
          ),
          await import("@replit/vite-plugin-dev-banner").then((m) =>
            m.devBanner(),
          ),
        ]
      : []),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
      "@assets": path.resolve(import.meta.dirname, "..", "..", "attached_assets"),
    },
    dedupe: ["react", "react-dom"],
  },
  root: path.resolve(import.meta.dirname),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
  },
  server: {
    port,
    host: "0.0.0.0",
    allowedHosts: true,
    hmr: {
      overlay: false,
    },
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
  preview: {
    port,
    host: "0.0.0.0",
    allowedHosts: true,
  },
});
