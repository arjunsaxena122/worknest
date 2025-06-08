import { Project } from "../models/project.models.js";
import { ProjectMember } from "../models/projectmember.models.js";
import { User } from "../models/user.models.js";
import { AvailableUserRoles } from "../utils/constants.js";
import { ApiError, ApiResponse, asyncHandler } from "../utils/index.js";

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
    createdBy: req?.user?.id,
  });

  const createdProject = await Project.findById(project?._id).populate({
    path: "createdBy",
  });

  if (!createProject) {
    throw new ApiError(
      500,
      "Internal server issue, Please create project again",
    );
  }

  return res
    .status(201)
    .json(new ApiResponse(201, "project created successfully", createdProject));
});

const createProjectMemberRoles = asyncHandler(async (req, res) => {
  const { email, role } = req.body;
  const { pid } = req.params;

  const projectUser = await Project.findById(pid);

  if (!projectUser) {
    throw new ApiError(400, "This project owner doesn't exist");
  }

  const user = await User.findOne({ email }).select("-password -refreshToken");

  if (!user) {
    throw new ApiError(400, "this user doesn't exist");
  }

  if (!AvailableUserRoles.includes(role.toLowerCase())) {
    throw new ApiError(400, "Please check the specific type of role");
  }

  const createProjectMember = await ProjectMember.findOneAndUpdate(
    {
      $and: [{ project: pid }, { user: req?.user?.id }],
    },
    {
      $set: {
        role: role.toLowerCase(),
      },
    },
    {
      upsert: true,
      new: true,
    },
  ).populate({
    path: "project",
  });

  console.log(createProjectMember);

  if (!createProjectMember) {
    throw new ApiError(
      500,
      "Internal Server issue, Please re-assign the roles",
    );
  }

  return res
    .status(201)
    .json(
      new ApiResponse(
        201,
        "project role assign successfully",
        createProjectMember,
      ),
    );
});

const updateProjectTitleAndDes = asyncHandler(async (req, res) => {
  const { pid } = req.params;
  const { title, description } = req.body;

  const project = await Project.findByIdAndUpdate(
    pid,
    {
      $set: {
        title,
        description,
      },
    },
    {
      new: true,
    },
  );

  console.log(project);

  if (!project) {
    throw new ApiError(
      500,
      "Internal server issue, Please try again to update",
    );
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "Project update successfully", project));
});

const deleteProject = asyncHandler(async (req, res) => {
  const { pid } = req.params;

  const project = await Project.findByIdAndDelete(pid);
  const projectRole = await ProjectMember.findOneAndDelete({ project: pid });

  return res.status(200).json(
    new ApiResponse(200, "project deleted successfully", {
      project,
      projectRole,
    }),
  );
});

export {
  createProject,
  createProjectMemberRoles,
  updateProjectTitleAndDes,
  deleteProject,
};
