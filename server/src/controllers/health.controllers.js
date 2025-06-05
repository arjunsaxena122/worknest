import { ApiError, ApiResponse, asyncHandler } from "../utils/index.js";

export const healthCheck = asyncHandler((req, res) => {
  try {
    return res
      .status(200)
      .json(
        new ApiResponse(200, "Server running health is going on perfectly"),
      );
  } catch (err) {
    throw new ApiError(400, "Server running health is not good");
  }
});
