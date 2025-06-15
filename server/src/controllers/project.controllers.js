import mongoose from "mongoose";
import { Project } from "../models/project.models.js";
import { ProjectMember } from "../models/projectmember.models.js";
import { ProjectNote } from "../models/note.models.js";
import { ApiError, ApiResponse, asyncHandler } from "../utils/index.js";
import { User } from "../models/user.models.js";
import { AvailableUserRoles, UserRolesEnum } from "../utils/constants.js";

const createProject = asyncHandler(async (req, res) => {
  const { title, description } = req.body;

  if (!title || !description) {
    throw new ApiError(400, "Please fill the required fields");
  }

  const existedTitle = await Project.findOne({ title });

  if (existedTitle) {
    throw new ApiError(400, "Title must be unique");
  }

  const project = await Project.create({
    title,
    description,
    createdBy: new mongoose.Types.ObjectId(req?.user?.id),
  });

  const createdProject = await Project.findById(project?._id).populate({
    path: "createdBy",
    select: "avatar username fullname createdAt",
  });

  if (!createProject) {
    throw new ApiError(
      500,
      "Internal server issue, Please create project again",
    );
  }

  const projectmember = await ProjectMember.create({
    project: new mongoose.Types.ObjectId(project?._id),
    user: new mongoose.Types.ObjectId(req?.user?.id),
    role: UserRolesEnum.ADMIN,
  });

  if (!projectmember) {
    throw new ApiError(
      500,
      "Internal server issue, Please create project again",
    );
  }

  return res.status(201).json(
    new ApiResponse(201, "project created successfully", {
      createdProject,
      projectmember,
    }),
  );
});

const updateProject = asyncHandler(async (req, res) => {
  const { pid } = req.params;
  const { title, description } = req.body;

  const project = await Project.findById(mongoose.Types.ObjectId(pid));

  if (!project) {
    throw new ApiError(
      500,
      "Internal server issue, Please try again to update",
    );
  }

  if (project.title === title && project.description === description) {
    throw new ApiError(400, "Please first update something");
  }

  await Project.updateOne(
    { _id: mongoose.Types.ObjectId(pid) },
    {
      $set: { title, description },
    },
  );

  return res
    .status(200)
    .json(new ApiResponse(200, "Project update successfully"));
});

const deleteProject = asyncHandler(async (req, res) => {
  const { pid } = req.params;

  const project = await Project.findByIdAndDelete(pid);
  const projectmember = await ProjectMember.findOneAndDelete({
    $and: [
      { project: new mongoose.Types.ObjectId(pid) },
      { user: new mongoose.Types.ObjectId(req?.user?._id) },
    ],
  });

  return res.status(200).json(
    new ApiResponse(200, "project deleted successfully", {
      project,
      projectmember,
    }),
  );
});

const getAllProject = asyncHandler(async (req, res) => {
  const { id } = req?.user?._id;

  const project = await Project.find({
    createdBy: new mongoose.Types.ObjectId(id),
  });

  if (!project) {
    throw new ApiError(400, "project not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "All project fetched successfully", project));
});

const getProjectById = asyncHandler(async (req, res) => {
  const { pid } = req.params;

  if (!pid) {
    throw new ApiError(400, "you don't give me project id");
  }

  const project = await Project.findById(pid);

  if (!project) {
    throw new ApiError(400, "This project not found");
  }

  const projectmember = await ProjectMember.findOne({
    project: new mongoose.Types.ObjectId(project?._id),
  });

  if (!projectmember) {
    throw new ApiError(400, "Project member doesn't have");
  }

  return res.status(200).json(
    new ApiResponse(200, "Project found successfully", {
      project,
      projectmember,
    }),
  );
});

const addProjectMember = asyncHandler(async (req, res) => {
  const { pid } = req.params;
  const { email, role } = req.body;

  if (!email || !role.toLowerCase()) {
    throw new ApiError(400, "Please fill all the required fields");
  }

  if (!AvailableUserRoles.includes(role.toLowerCase())) {
    throw new ApiError(400, "Invalid role");
  }

  const user = await User.findOne({ email }).select("-password -refreshToken");

  if (!user) {
    throw new ApiError(400, "User not found");
  }

  const addMember = await ProjectMember.create({
    role,
    project: new mongoose.Types.ObjectId(pid),
    user: new mongoose.Types.ObjectId(user?._id),
  });

  if (!addMember) {
    throw new ApiError(
      500,
      "Internal Server issue to add the project member,Please try again",
    );
  }

  return res
    .status(201)
    .json(new ApiResponse(201, "Project Member add successfully", addMember));
});

const deleteProjectMember = asyncHandler(async (req, res) => {
  const { pmid } = req.params;

  if (!pmid) {
    throw new ApiError(400, "Id not found");
  }

  const projectmember = await ProjectMember.findById(pmid);

  if (!projectmember) {
    throw new ApiError(400, "Project member not found");
  }

  const deletedProjectMember = await ProjectMember.deleteOne({
    _id: projectmember?._id,
  });

  if (!deletedProjectMember) {
    throw new ApiError(500, "Internal issue project member can't be deleted");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "Project Member deleted successfully"));
});

const updateProjectMemberRole = asyncHandler(async (req, res) => {
  const { pmid } = req.params;
  const { role } = req.body;

  if (!pmid) {
    throw new ApiError(400, "Id not found");
  }

  if (!role) {
    throw new ApiError(400, "Please fill the required field");
  }

  if (!AvailableUserRoles.includes(role)) {
    throw new ApiError(400, "Invalid role");
  }

  const projectmember = await ProjectMember.findById(pmid);

  if (!projectmember) {
    throw new ApiError(400, "Project member not found");
  }

  const updatemember = await ProjectMember.updateOne(
    { _id: pmid },
    { $set: { role } },
  );

  if (!updatemember) {
    throw new ApiError(
      500,
      "Internal server issue project member can't be update role, Please try again",
    );
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "Project member role update successfully"));
});

const getProjectMemberByProjectId = asyncHandler(async (req, res) => {
  const { pid } = req.params;

  if (!pid) {
    throw new ApiError(400, "Id not found");
  }

  const projectmember = await ProjectMember.find({
    project: new mongoose.Types.ObjectId(pid),
  });

  if(!projectmember){
    throw new ApiError(400,"Project not found")
  }

  return res.status(200).json(new ApiResponse(200,"Fetched all project member",projectmember))



});

export {
  createProject,
  deleteProject,
  updateProject,
  getAllProject,
  getProjectById,
  addProjectMember,
  deleteProjectMember,
  updateProjectMemberRole,
  getProjectMemberByProjectId,
};
