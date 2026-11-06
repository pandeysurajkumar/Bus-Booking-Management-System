
import ApiError from "../utils/ApiError.js";

const validateBody = (schema) => {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const errors = result.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message
      }));

      return next(
        new ApiError(400, "Request validation failed", errors)
      );
    }

    req.body = result.data;

    next();
  };
};

export default validateBody;
