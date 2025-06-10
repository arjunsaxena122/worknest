import { ProjectNote } from "../models/note.models.js";
import { ApiError, ApiResponse, asyncHandler } from "../utils/index.js";

const noteAdd = asyncHandler(async (req, res) => {
  const { content } = req.body;
  const { pid } = req.params;

  if (!content) {
    throw new ApiError(400, "Please fill the required field");
  }

  const addNote = await ProjectNote.create({
    content,
    project: pid,
    user: req?.user?.id,
  });

  const userNote = await ProjectNote.findById(addNote?._id).populate({
    path: "user",
    select: "username avatar",
  });

  // const addNote = await ProjectNote.findOneAndUpdate(
  //   { project: nid },
  //   {
  //     $set: {
  //       content,
  //     },
  //     $setOnInsert: {
  //       project: nid,
  //       user: req?.user?.id,
  //     },
  //   },
  //   {
  //     new: true,
  //     upsert: true,
  //   },
  // );

  if (!userNote) {
    throw new ApiError(500, "Internal Server issue, Please retry to add note");
  }

  return res
    .status(201)
    .json(new ApiResponse(201, "note add successfully", userNote));
});

const noteDelete = asyncHandler(async (req, res) => {
  const { nid } = req.params;

  const delNote = await ProjectNote.findByIdAndDelete(nid);

  if (!delNote) {
    throw new ApiError(400, "Some issue arise with deleting the project note");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "note deleted successfully", delNote));
});

const noteUpdate = asyncHandler(async (req, res) => {
  const { nid } = req.params;
  const { content } = req.body;

  const updateNote = await ProjectNote.findOneAndUpdate(
    nid,
    {
      $set: { content },
    },
    {
      new: true,
    },
  );

  if (!updateNote) {
    throw new ApiError(400, "Some issue arise with updating note");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "note update successfully", updateNote));
});

const getAllNote = asyncHandler(async (req, res) => {
  const { pid } = req.params;

  const getProjectNote = await ProjectNote.find({
    $and: [{ project: pid }, { user: req?.user?.id }],
  });

  if (!getProjectNote) {
    throw new ApiError(400, "note doesn't exist");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, "Get the all note successfully", getProjectNote),
    );
});

const getNoteById = asyncHandler(async (req, res) => {
  const { nid } = req.params;

  const getUserNote = await ProjectNote.findById(nid);

  if (!getUserNote) {
    throw new ApiError(400, "note doesn't exist");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "note found successfully", getUserNote));
});

export { noteAdd, noteDelete, noteUpdate, getAllNote, getNoteById };
