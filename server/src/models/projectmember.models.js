import mongoose, { Schema } from "mongoose";
import { AvailableUserRoles, UserRolesEnum } from "../utils/constants.js";

const projectMemberSchema = new Schema(
  {
    role: {
      enum: AvailableUserRoles,
      default: UserRolesEnum.MEMBER,
    },
    project: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

export const ProjectMember = mongoose.model(
  "ProjectMember",
  projectMemberSchema,
);
