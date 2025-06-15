import mongoose from "mongoose";
import { ProjectNote } from "../models/note.models.js";
import { ApiError, ApiResponse, asyncHandler } from "../utils/index.js";

const noteAdd = asyncHandler(async (req, res) => {
  const { content } = req.body;
  const { pid } = req.params;

  if (!pid) {
    throw new ApiError(400, "Id not found");
  }

  if (!content) {
    throw new ApiError(400, "Please fill the required field");
  }

  const note = await ProjectNote.create({
    content,
    project: new mongoose.Types.ObjectId(pid),
    createdBy: new mongoose.Types.ObjectId(req?.user?._id),
  });

  const populatedNote = await ProjectNote.findById(note?._id).populate({
    path: "createdBy",
    select: "username avatar createdAt",
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

  if (!populatedNote) {
    throw new ApiError(500, "Internal Server issue, Please retry to add note");
  }

  return res
    .status(201)
    .json(new ApiResponse(201, "note add successfully", populatedNote));
});

const noteDelete = asyncHandler(async (req, res) => {
  const { nid } = req.params;

  if (!nid) {
    throw new ApiError(400, "Id not found");
  }

  const isNoteExist = await ProjectNote.findById(nid);

  if (!isNoteExist) {
    throw new ApiError(400, "Project note not found");
  }

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

  if (!nid) {
    throw new ApiError(400, "Id not found");
  }

  const isNoteExist = await ProjectNote.findById(nid);

  if (!isNoteExist) {
    throw new ApiError(400, "Project note not found");
  }

  const updateNote = await ProjectNote.findByIdAndUpdate(
    nid,
    {
      $set: { content },
    },
    {
      new: true,
    },
  );

  if (!updateNote) {
    throw new ApiError(
      400,
      "Some issue arise with updating note,Please try again",
    );
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "note update successfully", updateNote));
});

const getAllNote = asyncHandler(async (req, res) => {
  const { pid } = req.params;

  const getProjectNote = await ProjectNote.find({
    project: new mongoose.Types.ObjectId(pid),
  });

  if (!getProjectNote) {
    throw new ApiError(400, "Note doesn't exist");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, "Fetched all the note successfully", getProjectNote),
    );
});

const getNoteById = asyncHandler(async (req, res) => {
  const { nid } = req.params;

  const getUserNote = await ProjectNote.findById(nid);

  if (!getUserNote) {
    throw new ApiError(400, "Note doesn't exist");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "Note found successfully", getUserNote));
});

export { noteAdd, noteDelete, noteUpdate, getAllNote, getNoteById };
