import { env } from './config/env.js';
import { app } from './app.js';
import { prisma } from './lib/prisma.js';

const server = app.listen(env.port, '0.0.0.0', () => {
  console.log(`Campaign API listening on port ${env.port} (${env.nodeEnv})`);
});

let shuttingDown = false;

const shutdown = (signal) => {
  if (shuttingDown) return;
  shuttingDown = true;
  console.log(`${signal} received, shutting down gracefully...`);

  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });

  // Do not hang forever if open connections keep the server alive.
  setTimeout(() => process.exit(1), 10_000).unref();
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
