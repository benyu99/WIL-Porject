/**
 * Parses and validates request data with zod schemas.
 *
 * Express 4 exposes `req.query` through a getter without a setter, so parsed
 * query/params are exposed as `req.validatedQuery` / `req.validatedParams`.
 * `req.body` can be reassigned and is replaced with the parsed (and therefore
 * sanitized) object, which also prevents mass-assignment of extra fields.
 */
export const validate = (schemas) => (req, res, next) => {
  try {
    if (schemas.body) {
      req.body = schemas.body.parse(req.body ?? {});
    }
    if (schemas.query) {
      req.validatedQuery = schemas.query.parse(req.query);
    }
    if (schemas.params) {
      req.validatedParams = schemas.params.parse(req.params);
    }
    next();
  } catch (error) {
    next(error);
  }
};
