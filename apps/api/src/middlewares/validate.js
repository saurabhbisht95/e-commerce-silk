import { ApiError } from '../utils/ApiError.js';

export const validate = schemaMap => (req, _res, next) => {
  const parsed = {};

  for (const [location, schema] of Object.entries(schemaMap)) {
    const result = schema.safeParse(req[location]);
    if (!result.success) {
      return next(
        ApiError.badRequest('Validation failed', {
          location,
          issues: result.error.issues.map(issue => ({
            path: issue.path.join('.'),
            message: issue.message
          }))
        })
      );
    }
    parsed[location] = result.data;
  }

  Object.assign(req, parsed);
  return next();
};
