import { ProjectNote } from "../models/note.models.js";
import { ApiError, ApiResponse, asyncHandler } from "../utils/index.js";

const noteAdd = asyncHandler(async (req, res) => {
  const { content } = req.body;
  const { nid } = req.params;

  if (!content) {
    throw new ApiError(400, "Please fill the required field");
  }

  //   const addNote = await ProjectNote.create({
  //     content,
  //     project: nid,
  //     user: req?.user?.id,
  //   });

  const addNote = await ProjectNote.findOneAndUpdate(
    { project: nid },
    {
      $set: {
        content,
      },
      $setOnInsert: {
        project: nid,
        user: req?.user?.id,
      },
    },
    {
      new: true,
      upsert: true,
    },
  );

  if (!addNote) {
    throw new ApiError(500, "Internal Server issue, Please retry to add note");
  }

  return res
    .status(201)
    .json(new ApiResponse(201, "note add successfully", addNote));
});

const noteDelete = asyncHandler(async (req, res) => {
  const { nid } = req.params;

  const delNote = await ProjectNote.findOneAndDelete({
    $and: [{ project: nid }, { user: req?.user?.id }],
  });

  if (!delNote) {
    throw new ApiError(400, "Some issue arise with deleting note");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "note deleted successfully", delNote));
});

const noteUpdate = asyncHandler(async (req, res) => {
  const { nid } = req.params;
  const { content } = req.body;

  const updateNote = await ProjectNote.findOneAndUpdate(
    { project: nid },
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

const noteGet = asyncHandler(async(req,res) =>{

    const {nid} = req.params

    const getProjectNote = await ProjectNote.findOne({project:nid})

    if(!getProjectNote){
        throw new ApiError(400,"This note doesn't exist")
    }

    return res.status(200).json(new ApiResponse(200,"Get the notes",getProjectNote))
})

export { noteAdd, noteDelete, noteUpdate,noteGet };
