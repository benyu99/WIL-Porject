import { prisma } from '../lib/prisma.js';
import { ApiError } from '../utils/apiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { verifyToken } from '../utils/jwt.js';

/**
 * Requires a valid `Authorization: Bearer <token>` header and loads the user
 * onto `req.user`. Tokens are self-contained JWTs; the user is re-read from
 * the database so deleted accounts immediately lose access.
 */
export const requireAuth = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization ?? '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    throw ApiError.unauthorized('Missing bearer token.');
  }

  let payload;
  try {
    payload = verifyToken(token);
  } catch {
    throw ApiError.unauthorized('Invalid or expired token.');
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.sub },
    select: { id: true, name: true, email: true, createdAt: true },
  });

  if (!user) {
    throw ApiError.unauthorized('Invalid or expired token.');
  }

  req.user = user;
  next();
});
