import { validationResult } from "express-validator";
import { ApiError } from "../utils/index.js";

const validator = (req, res, next) => {
  const errors = validationResult(req);

  if (errors.isEmpty()) return next();

  let extractedError = [];

  errors.array().map((err) => extractedError.push(err));

  throw new ApiError(400, "Invalidation in register user", extractedError);
};

export { validator };
