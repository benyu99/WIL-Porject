import cors from 'cors';
import express from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { env } from './config/env.js';
import { prisma } from './lib/prisma.js';
import { errorHandler, notFoundHandler } from './middleware/error.js';
import { authRouter } from './routes/auth.routes.js';
import { campaignRouter } from './routes/campaign.routes.js';
import { categoryRouter } from './routes/category.routes.js';
import { asyncHandler } from './utils/asyncHandler.js';

const app = express();

// Render terminates TLS in front of the service.
app.set('trust proxy', 1);
app.disable('x-powered-by');

const isVercelPreview = /^https:\/\/[a-z0-9-]+\.vercel\.app$/i;
const isLocalhost = /^http:\/\/localhost(:\d+)?$/;

/**
 * Allowed origins: the comma-separated CORS_ORIGIN list, any Vercel preview
 * deployment, and localhost on any port. Requests without an Origin header
 * (curl, Render health checks) are always allowed.
 */
const corsOrigin = (origin, callback) => {
  if (!origin) return callback(null, true);

  if (
    env.corsOrigins.includes('*') ||
    env.corsOrigins.includes(origin) ||
    isLocalhost.test(origin) ||
    isVercelPreview.test(origin)
  ) {
    return callback(null, true);
  }

  return callback(null, false);
};

app.use(
  helmet({
    // The API is consumed cross-origin by the Vercel frontend.
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  }),
);
app.use(
  cors({
    origin: corsOrigin,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }),
);
app.use(express.json({ limit: '1mb' }));

// Minimal request log: method, path, status, duration. Never logs bodies.
app.use((req, res, next) => {
  const startedAt = Date.now();
  res.on('finish', () => {
    console.log(
      `${req.method} ${req.originalUrl} -> ${res.statusCode} (${Date.now() - startedAt}ms)`,
    );
  });
  next();
});

// Only failed authentication attempts count toward the limit.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  message: {
    error: {
      code: 'TOO_MANY_REQUESTS',
      message: 'Too many authentication attempts. Please try again later.',
    },
  },
});

app.get('/', (req, res) => {
  res.json({ name: 'Campaign API', version: '1.0.0', health: '/health' });
});

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// Liveness probe that also checks the database connection. Useful when
// debugging the Render deployment.
app.get(
  '/health/db',
  asyncHandler(async (req, res) => {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'ok', database: 'up' });
  }),
);

app.use('/api/auth', authLimiter, authRouter);
app.use('/api/campaigns', campaignRouter);
app.use('/api/categories', categoryRouter);

app.use(notFoundHandler);
app.use(errorHandler);

export { app };
