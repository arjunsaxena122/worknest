import mongoose from "mongoose";
import { SubTask } from "../models/subtask.models.js";
import { Task } from "../models/task.models.js";
import { AvailableTaskStatusEnum } from "../utils/constants.js";
import { ApiError, ApiResponse, asyncHandler } from "../utils/index.js";
import { uploadAttachmentInImagekit } from "../utils/imagekit.io.js";
import path from "path";
import { User } from "../models/user.models.js";
import fs from "fs";

const createTask = asyncHandler(async (req, res) => {
  const taskAttachment = req.files;
  const { title, description, status, ids } = req.body;
  const { pid } = req.params;

  const existedTitle = await Task.findOne({
    title: {
      $in: title,
    },
  });

  if (existedTitle) {
    taskAttachment.map((file) => fs.unlinkSync(path.resolve(file.path)));
    throw new ApiError(400, "Please give unique title");
  }

  const convertIds = ids.split(",");
  const verifiedIds = convertIds.map((id) => {
    if (!mongoose.Types.ObjectId.isValid(id.trim())) {
      throw new ApiError(400, "Convert id is not valid id");
    }
    return new mongoose.Types.ObjectId(id.trim());
  });

  const projectmemberIds = await User.find({
    _id: {
      $in: [...verifiedIds],
    },
  }).select("_id");

  if (!title || !description) {
    throw new ApiError(400, "Please fill all the required fields");
  }

  if (!AvailableTaskStatusEnum.includes(status)) {
    throw new ApiError(400, "Invalid status");
  }

  let arrayOfAttachment = [];

  for (const attachment of taskAttachment) {
    const uploadAttachment = await uploadAttachmentInImagekit(
      path.resolve(attachment?.path) || "",
      req?.user?.id || "",
      attachment?.originalname || "",
    );
    console.log("upload attachment waala", uploadAttachment);

    if (!uploadAttachment) {
      throw new ApiError(400, "failed uploading image on imagekit");
    }

    const attachmentObj = {
      url: uploadAttachment?.url,
      mimeType: attachment?.mimetype,
      size: attachment?.size,
    };

    console.log("attachment waala object", attachmentObj);

    arrayOfAttachment.push(attachmentObj);

    if (!attachmentObj) {
      throw new ApiError(400, "failed to make object of attachment");
    }
  }

  if (!Array.isArray(arrayOfAttachment)) {
    throw new ApiError(400, "attachments are not array");
  }

  const task = await Task.create({
    title,
    description,
    project: new mongoose.Types.ObjectId(pid),
    assignedTo: [...projectmemberIds],
    assignedBy: new mongoose.Types.ObjectId(req?.user?.id),
    status: "todo",
    attachments: [...arrayOfAttachment],
  });

  if (!task) {
    throw new ApiError(500, "Internal server issue, Please re-create the Task");
  }

  const populateTask = await Task.findById(task?._id).populate([
    { path: "assignedTo", select: "avatar email" },
    { path: "assignedBy", select: "avatar email createdAt" },
  ]);

  return res
    .status(201)
    .json(new ApiResponse(201, "Task create successfully", populateTask));
});

const deleteTask = asyncHandler(async (req, res) => {
  const { tid } = req.params;

  const task = await Task.findById(tid);

  if (!task) {
    throw new ApiError(400, "Task not found");
  }

  const subtask = await SubTask.findOne({
    task: new mongoose.Types.ObjectId(tid),
  });

  if (!subtask) {
    throw new ApiError(400, "Task not found");
  }

  if (!task || !subtask) {
    throw new ApiError(400, `${task ?? subtask} not found`);
  }

  const delTask = await Task.findByIdAndDelete(tid);

  if (!delTask) {
    throw new ApiError(500, "Internal Server issue, Task not deleted");
  }

  const delsubtask = await SubTask.findOneAndDelete({
    project: new mongoose.Types.ObjectId(tid),
  });

  if (!delSubTask) {
    throw new ApiError(500, "Internal Server issue, Task not deleted");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "Task deleted successfully"));
});

const updateTask = asyncHandler(async (req, res) => {
  const { tid } = req.params;
  const { title, description, status } = req.body;

  const task = await Task.findById(tid);

  if (!task) {
    throw new ApiError(400, "This task doesn't exist");
  }

  if (!AvailableTaskStatusEnum.includes(status)) {
    throw new ApiError(400, "Invalid Status");
  }

  const editTask = await Task.findByIdAndUpdate(
    {
      _id: tid,
    },
    {
      $set: {
        title,
        description,
        status: status.toLowerCase(),
      },
    },
    { new: true },
  );

  if (!editTask) {
    throw new ApiError(
      500,
      "Internal server issue, Still task doesn't edit yet, Please try again",
    );
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "Task updated Successfylly", editTask));
});

const getAllTask = asyncHandler(async (req, res) => {
  const { pid } = req.params;

  const task = await Task.find({
    project: new mongoose.Types.ObjectId(pid),
  });

  if (!task) {
    throw new ApiError(400, "task are not fetched successfully");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "Task fetched successfully", task));
});

const getTaskById = asyncHandler(async (req, res) => {
  const { tid } = req.params;

  if (!tid) {
    throw new ApiError(400, "Task Id not found");
  }

  const task = await Task.findById(tid);

  if (!task) {
    throw new ApiError(400, "Task not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "task found successfully", task));
});

const createSubTask = asyncHandler(async (req, res) => {
  const { title, isCompleted } = req.body;
  const { tid } = req.params;

  if (!title) {
    throw new ApiError(400, "All field are required");
  }

  if (!tid) {
    throw new ApiError(400, "Id not found");
  }

  const subTask = await SubTask.create({
    title,
    isCompleted,
    task: new mongoose.Types.ObjectId(tid),
    createdBy: new mongoose.Types.ObjectId(req?.user?._id),
  });

  if (!subTask) {
    throw new ApiError(
      500,
      "Internal server issue, Please create sub task again",
    );
  }

  const populateTask = await SubTask.findById(subTask?._id).populate([
    { path: "task" },
    { path: "createdBy", select: "avatar email createdAt" },
  ]);

  return res
    .status(201)
    .json(new ApiResponse(201, "Subtask create successfully", populateTask));
});

const delSubTask = asyncHandler(async (req, res) => {
  const { stId } = req.params;

  if (!stId) {
    throw new ApiError(400, "Id not found");
  }

  const subTask = await SubTask.findById(stId);

  if (!subTask) {
    throw new ApiError(400, "subTask not found");
  }

  const deletedSubTask = await SubTask.findByIdAndDelete(stId);

  if (!deletedSubTask) {
    throw new ApiError(
      500,
      "Internal Server issue sub task couldn't deleted yet, Please try again",
    );
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "sub task delete successfully"));
});

const updateSubTask = asyncHandler(async (req, res) => {
  const { title, isCompleted } = req.body;
  const { stId } = req.params;

  if (!title) {
    throw new ApiError(400, "All fields are required");
  }

  if (!stId) {
    throw new ApiError(400, "Id not found");
  }

  const subtask = await SubTask.findById(stId);

  if (!subtask) {
    throw new ApiError(400, "Subtask not found");
  }

  if (subtask.title === title) {
    throw new ApiError(400, "Please first update something");
  }

  const updatedSubtask = await SubTask.findByIdAndUpdate(
    stId,
    {
      $set: {
        title,
        isCompleted,
      },
    },
    {
      new: true,
    },
  );

  if (!updatedSubtask) {
    throw new ApiError(
      500,
      "Internal server issue sub task couldn't be updated yet, Please try again",
    );
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "subtask updated Successfully", updatedSubtask));
});

const getSubTaskById = asyncHandler(async (req, res) => {
  const { stId } = req.params;

  if (!stId) {
    throw new ApiError(400, "Id not found");
  }

  const subTask = await SubTask.findById(stId);

  if (!subTask) {
    throw new ApiError(400, "subtask not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "get subtask successfully", subTask));
});

const getAllSubTask = asyncHandler(async (req, res) => {
  const { tid } = req.params;

  if (!tid) {
    throw new ApiError(400, "Id not found");
  }

  const subTask = await SubTask.find({
    task: new mongoose.Types.ObjectId(tid),
  });

  if (!subTask) {
    throw new ApiError(400, "subtask not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "get subtask successfully", subTask));
});

export {
  createTask,
  deleteTask,
  updateTask,
  getAllTask,
  getTaskById,
  createSubTask,
  delSubTask,
  updateSubTask,
  getSubTaskById,
  getAllSubTask,
};
