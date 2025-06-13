import { ApiError } from "../utils/index.js";
import jwt from "jsonwebtoken";
import { env } from "../config/config.js";
import { User } from "../models/user.models.js";
import { ProjectMember } from "../models/projectmember.models.js";

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

export const verifyRoles =
  (roles = []) =>
  async (req, _, next) => {
    try {
      const { pid } = req.params;

      if (!pid) {
        throw new ApiError(400, "pid not available");
      }

      const project = await ProjectMember.findOne({
        project: pid,
        user: req?.user?.id,
      });

      if (!project) {
        throw new ApiError(400, "Project not found");
      }

      const givenRole = project?.role;

      if (!roles.includes(givenRole)) {
        throw new ApiError(
          400,
          "ACCESS DENIED: You don't have a permission to access",
        );
      }

      next();
    } catch (error) {
      throw new ApiError(
        400,
        "ACCESS DENIED: You can't permission to access this context",
      );
    }
  };
