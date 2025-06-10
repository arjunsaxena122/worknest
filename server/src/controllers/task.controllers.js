import { Schema } from "mongoose";
import { ProjectMember } from "../models/projectmember.models.js";
import { SubTask } from "../models/subtask.models.js";
import { Task } from "../models/task.models.js";
import { AvailableTaskStatusEnum } from "../utils/constants.js";
import { ApiError, ApiResponse, asyncHandler } from "../utils/index.js";

const createTask = asyncHandler(async (req, res) => {
  // const {taskFile} = req.files
  const { title, description, status } = req.body;
  const { pid } = req.params;

  if (!title || !description) {
    throw new ApiError(400, "Please fill all the required fields");
  }

  console.log(AvailableTaskStatusEnum.includes(status));

  if (!AvailableTaskStatusEnum.includes(status)) {
    throw new ApiError(400, "this status doesn't exist");
  }

  const projectMemberId = await ProjectMember.findOne({
    $and: [{ project: pid }, { user: req?.user?.id }],
  });

  if (!projectMemberId) {
    throw new ApiError(400, "this project doesn't exist");
  }

  console.log(projectMemberId._id);

  const task = await Task.create({
    title,
    description,
    project: pid,
    assignedTo: projectMemberId?._id ?? " ",
    assignedBy: req?.user?.id,
    status: status.toLowerCase(),
    attachments: [],
  });

  if (!task) {
    throw new ApiError(500, "Internal server issue, Please re-create the Task");
  }

  console.log(task);

  const populateTask = await Task.findOne(task._id).populate([
    { path: "assignedTo" },
    { path: "assignedBy" },
  ]);

  return res
    .status(201)
    .json(new ApiResponse(201, "Task create successfully", populateTask));
});

const deleteTask = asyncHandler(async (req, res) => {
  const { tid } = req.params;

  const task = await Task.findById(tid);

  if (!task) {
    throw new ApiError(400, "This task doesn't exist");
  }

  const delTask = await Task.deleteOne({ _id: tid });

  if (!delTask) {
    throw new ApiError(500, "Internal Server issue, Task not deleted");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "Task deleted successfully"));
});

const updateTask = asyncHandler(async (req, res) => {
  const { tid } = req.params;
  const task = await Task.findById(tid);
  const { title, description, status } = req.body;

  //   let updatedTask = {}

  //   if("title" in req.body || "description" in req.body || "status" in req.body){
  //     updateTask[]
  //   }

  if (!task) {
    throw new ApiError(400, "This task doesn't exist");
  }

  if (!AvailableTaskStatusEnum.includes(status)) {
    throw new ApiError(400, "this status doesn't exist");
  }

  const editTask = await Task.updateOne(
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
    {
      upsert: true,
    },
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

  const getAllTask = await Task.find({
    $and: [{ project: pid }, { createdBy: req?.user?.id }],
  });

  if (!getAllTask) {
    throw new ApiError(400, "task are not fetched successfully");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "Task fetched successfully", getAllTask));
});

const getTaskById = asyncHandler(async (req, res) => {
  const { tid } = req.params;

  if (!tid) {
    throw new ApiError(400, "you don't give me task id");
  }

  const getTask = await Task.findById(tid);

  if (!getTask) {
    throw new ApiError(400, "Task not found");
  }

  return res.status(200).json(200, "task found successfully");
});

const createSubTask = asyncHandler(async (req, res) => {
  const { title, isCompleted } = req.body;
  const { tid } = req.params;

  if (!title || !isCompleted) {
    throw new ApiError(400, "All fields are required");
  }

  if (!tid) {
    throw new ApiError(400, "you don't give me the tid");
  }

  const subTask = await SubTask.create({
    title,
    isCompleted,
    task: Schema.Types.ObjectId(tid),
    createdBy: req?.user?.id,
  });

  if (!subTask) {
    throw new ApiError(
      500,
      "Internal server issue, Please create sub task again",
    );
  }

  return res.status(201).json(201, "Subtask create successfully", subTask);
});

const delSubTask = asyncHandler(async (req, res) => {
  const { tid } = req.params;

  if (!tid) {
    throw new ApiError(400, "you don't give me the task id");
  }

  const subTask = await SubTask.findOne({ task: tid });

  if (!subTask) {
    throw new ApiError(400, "sub task not exist");
  }

  return res.status(200).json(200, "sub task delete successfully", subTask);
});

const updateSubTask = asyncHandler(async (req, res) => {
  const { title, isCompleted } = req.body;
  const { tid } = req.params;

  if (!title || !isCompleted) {
    throw new ApiError(400, "All fields are required");
  }

  if (!tid) {
    throw new ApiError(400, "you don't give me the tid");
  }

  const subTask = await SubTask.findByIdAndUpdate(
    { task: tid },
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

  if (!subTask) {
    throw new ApiError(400, "sub task not be updated");
  }

  return res.status(200).json(200, "sub task updated Successfully", subTask);
});

const getSubTask = asyncHandler(async (req, res) => {
  const { tid } = req.params;

  if (!tid) {
    throw new ApiError(400, "you don't give me the tid");
  }

  const subTask = await SubTask.findOne({ task: tid });

  if (!subTask) {
    throw new ApiError(400, "subtask not found");
  }

  return res.status(200).json(200, "get subtask successfully", subTask);
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
  getSubTask,
};
