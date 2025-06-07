import { User } from "../models/user.models.js";

export const isGeneratingAccessAndRefreshToken = async (id) => {
  const user = await User.findById(id);
  const accessToken = await user.generateAccessToken();
  const refreshToken = await user.generateRefreshToken();

  user.refreshToken = refreshToken;
  user.save({ validationBeforeSave: false });

  return { accessToken, refreshToken };
};
