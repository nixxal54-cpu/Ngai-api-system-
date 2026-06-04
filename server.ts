import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { apiRouter } from './src/server/routes/api';
import { createServer as createViteServer } from 'vite';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Trust proxy is required when behind a reverse proxy (like Cloud Run) for express-rate-limit
  app.set('trust proxy', 1);

  // Security Middlewares
  app.use(helmet({
    contentSecurityPolicy: false, // Vite HMR requires relaxed CSP
  }));
  app.use(cors());
  app.use(express.json());

  // Global Rate Limiting
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // Limit each IP to 1000 requests per window
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.use(limiter);

  // Mount API Routes
  app.use('/v1', apiRouter);

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production static serving
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`NGAI platform server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(console.error);
