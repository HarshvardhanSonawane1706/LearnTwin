import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { apiRouter } from './server/routes.js';
import { dbStore } from './server/store.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = parseInt(process.env.PORT || '3000', 10);

  // Parse JSON payloads
  app.use(express.json());

  // Initialize DB store (attempts MongoDB if MONGODB_URI exists, else resilient in-memory)
  await dbStore.init();

  // Mount API router
  app.use('/api', apiRouter);

  // Development vs Production serving
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    console.log('Mounting Vite dev server middleware in Express...');
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    console.log('Serving production static build from dist...');
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`LearnTwin server running on http://0.0.0.0:${PORT}`);
    console.log(`Mode: ${dbStore.getDbMode()}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal error starting LearnTwin server:', err);
  process.exit(1);
});
