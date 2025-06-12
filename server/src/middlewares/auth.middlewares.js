import { ApiError } from "../utils/index.js";
import jwt from "jsonwebtoken";
import { env } from "../config/config.js";
import { User } from "../models/user.models.js";

export const verifyAuthJwt = async (req, _, next) => {
  const token =
    req?.cookies?.accessToken || req?.headers["Authorization"]?.split(" ")[1];

  if (!token) {
    throw new ApiError(401, "unauthorised access");
  }

  const decodeToken = jwt.verify(token, env.access_token_key);

  if (!decodeToken) {
    throw new ApiError(401, "unauthorised access");
  }

  const user = await User.findById(decodeToken.id);

  if (!user) {
    throw new ApiError(401, "unauthorised access");
  }

  req.user = user;
  next();
};
