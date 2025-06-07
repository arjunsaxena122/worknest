import { env } from "../config/config.js";

export const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    message: err.message,
    errors: err.errors || [],
    stack: env.node_env ? err.stack : "",
    success: err.success,
  });
};
