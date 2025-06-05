import mongoose, { Schema } from "mongoose";

const subTaskSchema = new Schema(
  {
    title: {
      type: String,
      trim: true,
      required: true,
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
    task: {
      type: Schema.Types.ObjectId,
      ref: "Task",
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  },
);

export const SubTask = mongoose.model("SubTask", subTaskSchema);
