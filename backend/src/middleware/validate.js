/**
 * Creates middleware to validate request payload against a Zod schema.
 * @param {import('zod').ZodSchema} schema
 * @param {'body' | 'query' | 'params'} [source='body']
 */
const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    try {
      const parsed = schema.parse(req[source]);
      req[source] = parsed;
      next();
    } catch (error) {
      if (error.errors) {
        const errorDetails = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message
        }));
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errorDetails
        });
      }
      return res.status(400).json({
        success: false,
        message: 'Invalid request data',
        error: error.message
      });
    }
  };
};

module.exports = validate;
