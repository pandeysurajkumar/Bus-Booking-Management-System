
import ApiError from "../utils/ApiError.js";

const REQUEST_KEYS = ["body", "query", "params"];

const assignQuery = (req, query) => {
  try {
    req.query = query;
  } catch {
    for (const key of Object.keys(req.query || {})) {
      delete req.query[key];
    }

    Object.assign(req.query, query);
  }
};

const validate = (schema) => {
  return (req, res, next) => {
    const shape =
      schema?.shape ||
      (typeof schema?._def?.shape === "function" ? schema._def.shape() : schema?._def?.shape) ||
      {};
    const hasRequestParts = REQUEST_KEYS.some((key) => key in shape);

    const payload = hasRequestParts
      ? {
          body: req.body,
          query: req.query,
          params: req.params
        }
      : req.body;

    const result = schema.safeParse(payload);

    if (!result.success) {
      const errors = result.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message
      }));

      return next(
        new ApiError(400, "Request validation failed", errors)
      );
    }

    if (hasRequestParts) {
      if (result.data.body !== undefined) {
        req.body = result.data.body;
      }

      if (result.data.query !== undefined) {
        assignQuery(req, result.data.query);
      }

      if (result.data.params !== undefined) {
        Object.assign(req.params, result.data.params);
      }
    } else {
      req.body = result.data;
    }

    next();
  };
};

export default validate;
