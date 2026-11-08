import { Prisma } from '@prisma/client';
import { ZodError } from 'zod';
import { env } from '../config/env.js';
import { ApiError } from '../utils/apiError.js';

const isProduction = env.nodeEnv === 'production';

export const notFoundHandler = (req, res) => {
  res.status(404).json({
    error: {
      code: 'NOT_FOUND',
      message: `Route ${req.method} ${req.originalUrl} not found.`,
    },
  });
};

// eslint-disable-next-line no-unused-vars
export const errorHandler = (error, req, res, next) => {
  if (res.headersSent) {
    return next(error);
  }

  if (error instanceof ApiError) {
    return res.status(error.statusCode).json({
      error: {
        code: error.code,
        message: error.message,
        ...(error.details ? { details: error.details } : {}),
      },
    });
  }

  if (error instanceof ZodError) {
    return res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Request validation failed.',
        details: error.issues.map((issue) => ({
          path: issue.path.join('.') || '(root)',
          message: issue.message,
        })),
      },
    });
  }

  if (error?.type === 'entity.parse.failed') {
    return res.status(400).json({
      error: { code: 'INVALID_JSON', message: 'Request body is not valid JSON.' },
    });
  }

  if (error?.type === 'entity.too.large') {
    return res.status(413).json({
      error: { code: 'PAYLOAD_TOO_LARGE', message: 'Request body is too large.' },
    });
  }

  if (error instanceof Prisma.PrismaClientInitializationError) {
    return res.status(503).json({
      error: {
        code: 'DATABASE_UNAVAILABLE',
        message: 'The database is currently unavailable.',
      },
    });
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2002') {      return res.status(409).json({
        error: { code: 'CONFLICT', message: 'A record with these values already exists.' },
      });
    }
    if (error.code === 'P2025') {
      return res.status(404).json({
        error: { code: 'NOT_FOUND', message: 'Resource not found.' },
      });
    }
    if (error.code === 'P2003' || error.code === 'P2014') {
      return res.status(400).json({
        error: { code: 'INVALID_REFERENCE', message: 'Referenced resource does not exist.' },
      });
    }
    if (error.code === 'P2023') {
      return res.status(400).json({
        error: { code: 'INVALID_ID', message: 'One of the provided identifiers is invalid.' },
      });
    }
  }

  console.error('[ERROR]', error);
  res.status(500).json({
    error: {
      code: 'INTERNAL_ERROR',
      message: isProduction ? 'Something went wrong. Please try again later.' : error.message,
    },
  });
};
