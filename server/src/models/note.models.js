import mongoose, { Schema } from "mongoose";

const projectNoteSchema = new Schema(
  {
    content: {
      type: String,
      trim: true,
      required: true,
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

export const ProjectNote = mongoose.model("ProjectNote", projectNoteSchema);
