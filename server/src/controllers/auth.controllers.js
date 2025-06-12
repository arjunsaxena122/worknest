import {
  ApiError,
  ApiResponse,
  asyncHandler,
  emailVerificationCustomMail,
  sendCustomMail,
} from "../utils/index.js";
import { User } from "../models/user.models.js";
import { isGeneratingAccessAndRefreshToken } from "../utils/access-refresh-token.js";
import { env } from "../config/config.js";
import crypto from "crypto";
import { forgetPasswordCustomMail } from "../utils/mail.js";
import path from "path";
import { uploadImageInImagekit } from "../utils/imagekit.io.js";
import jwt from "jsonwebtoken";

const userRegister = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, "Please fill the required fields");
  }

  const existedUser = await User.findOne({ email });

  if (existedUser) {
    throw new ApiError(
      400,
      "This credentials are already registered, Please Login!",
    );
  }

  const user = await User.create({
    email,
    password,
  });

  user.emailVerificationToken = crypto.randomBytes(32).toString("hex");
  user.emailVerificationExpiry = Date.now() + 1000 * 60 * 24;
  user.save({ validationBeforeSave: false });

  sendCustomMail({
    mailGen: emailVerificationCustomMail(
      "Arjun Saxena",
      `http://localhost:3000/api/user/verify-email/${user?.emailVerificationToken}`,
    ),

    fromSender: "taskManager@gmail.com",
    toReceiver: email,
    subject: "Email verification",
  });

  const createdUser = await User.findById(user?._id).select(
    "-password -avatar -emailVerificationToken -emailVerificationExpiry",
  );

  if (!createdUser) {
    throw new ApiError(
      500,
      "Internal server issue, Please re-try the register process",
    );
  }

  return res
    .status(201)
    .json(
      new ApiResponse(
        201,
        "This credentials are successfully registered",
        createdUser,
      ),
    );
});

const userLogin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, "Please fill the required fields");
  }

  const existedUser = await User.findOne({ email });

  if (!existedUser) {
    throw new ApiError(
      401,
      "This credentials doesn't exist, Please registered first!",
    );
  }

  const isCorrectPassword = await existedUser.isCheckCorrectPassword(password);

  if (!isCorrectPassword) {
    throw new ApiError(401, "Invalid credentials");
  }

  const { accessToken, refreshToken } = await isGeneratingAccessAndRefreshToken(
    existedUser?._id,
  );

  if (!accessToken || !refreshToken) {
    throw new ApiError(400, "Tokens are not generated correctly");
  }

  const options = {
    httpOnly: true,
    secure: true,
    sameSite: env.node_env !== "development" ? "strict" : "none",
    maxAge: 1000 * 60 * 30,
  };

  const loggedInUser = await User.findById(existedUser?._id).select(
    "-password -refreshToken",
  );

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(new ApiResponse(200, "Login Successfully", loggedInUser));
});

const userLogout = asyncHandler(async (req, res) => {
  const { id } = req?.user;

  const user = await User.findByIdAndUpdate(
    id,
    {
      $unset: {
        refreshToken: 1,
      },
    },
    {
      new: true,
    },
  ).select("-password");

  if (!user) {
    throw new ApiError(401, "user doesn't exist");
  }

  const options = {
    httpOnly: true,
    secure: true,
    sameSite: env.node_env !== "development" ? "strict" : "none",
    expires: Date.now(0),
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, "Logout successfully", user));
});

const userVerifyEmail = asyncHandler(async (req, res) => {
  const { tokenId } = req.params;

  const user = await User.findOne({
    $and: [
      { emailVerificationToken: tokenId },
      {
        emailVerificationExpiry: {
          $gt: Date.now(),
        },
      },
    ],
  });

  if (user?.isEmailVerification) {
    throw new ApiError(400, "Your email is already verified");
  }

  if (!user) {
    throw new ApiError(400, "verify email token is expired");
  }

  user.isEmailVerification = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpiry = undefined;
  user.save({ validationBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, "email verification successfully done"));
});

const userResendVerifyEmail = asyncHandler(async (req, res) => {
  const { id } = req?.user;

  const user = await User.findById(id);

  if (!user) {
    throw new ApiError(400, "user doesn't exist");
  }

  if (user?.isEmailVerification) {
    throw new ApiError(400, "your email is already verified");
  }

  user.emailVerificationToken = crypto.randomBytes(32).toString("hex");
  user.emailVerificationExpiry = Date.now() + 1000 * 60 * 24;
  user.save({ validateBeforeSave: false });

  sendCustomMail({
    mailGen: emailVerificationCustomMail(
      user?.username,
      `http://localhost:3000/api/v1/user/verify-email/${user?.emailVerificationToken}`,
    ),

    fromSender: "taskManager@gmail.com",
    toReceiver: user?.email,
    subject: "Email verification",
  });

  return res
    .status(200)
    .json(new ApiResponse(200, "resend email verification successfully", user));
});

const userRefreshAccessToken = asyncHandler(async (req, res) => {
  const token = req?.cookies?.refreshToken;

  if (!token) {
    throw new ApiError(401, "Invalid refresh Token");
  }

  const decodeRefreshToken = jwt.verify(token, env.refresh_token_key);

  if (!decodeRefreshToken) {
    throw new ApiError(400, "Unauthorised token");
  }

  const user = await User.findById(decodeRefreshToken.id);

  if (!user) {
    throw new ApiError(400, "User not found");
  }

  if (token !== user?.refreshToken) {
    throw new ApiError(400, "unauthorised refresh token");
  }

  const { accessToken, refreshToken } = await isGeneratingAccessAndRefreshToken(
    decodeRefreshToken.id,
  );

  if (!accessToken || !refreshToken) {
    throw new ApiError(400, "Token doesn't generate");
  }

  const options = {
    httpOnly: true,
    secure: true,
    sameSite: env.node_env !== "development" ? "stric" : "none",
  };

  res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("accessToken", accessToken, options)
    .json(200, "new token generate successfully");
});

const userForgetPasswordRequest = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    throw new ApiError(400, "user doesn't exist");
  }

  user.forgotPasswordToken = crypto.randomBytes(32).toString("hex");
  user.forgetPasswordExpiry = Date.now() + 1000 * 120;
  user.save({ validationBeforeSave: false });

  sendCustomMail({
    mailGen: forgetPasswordCustomMail(
      user?.username,
      `http://localhost:3000/api/v1/reset-password/${user?.forgotPasswordToken}`,
    ),
    fromSender: "taskManager@gmail.com",
    toReceiver: user?.email,
    subject: "Reset your password",
  });

  return res
    .status(200)
    .json(new ApiResponse(200, "forget password link sent successfully", user));
});

const userResetPassword = asyncHandler(async (req, res) => {
  const { resetId } = req.params;
  const { newPassword, confirmPassword } = req.body;

  const user = await User.findOne({
    $and: [
      { forgotPasswordToken: resetId },
      {
        forgetPasswordExpiry: {
          $gt: Date.now(),
        },
      },
    ],
  });

  if (!user) {
    throw new ApiError(400, "reset password time expired");
  }

  if (newPassword !== confirmPassword) {
    throw new ApiError(400, "your password doesn't match");
  }

  user.password = confirmPassword;
  user.save({ validationBeforeSave: true });

  return res
    .status(200)
    .json(new ApiResponse(200, "Password reset successfully"));
});

const userChangePassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword, confirmPassword } = req.body;
  const { id } = req?.user;

  // if (!id) {
  //   throw new ApiError(401, "unauthroised access");
  // }

  if (!oldPassword || !newPassword || !confirmPassword) {
    throw new ApiError(400, "Please fill all the field are required");
  }

  const user = await User.findById(id);

  console.log(user);

  const isCorrectPassword = await user.isCheckCorrectPassword(oldPassword);

  if (!isCorrectPassword) {
    throw new ApiError(400, "Invalid old password");
  }

  if (oldPassword === newPassword) {
    throw new ApiError(
      400,
      "Please enter new password has differ from old password",
    );
  }

  if (newPassword !== confirmPassword) {
    throw new ApiError(400, "your password doesnt match");
  }

  user.password = confirmPassword;
  user.save();

  return res
    .status(200)
    .json(new ApiResponse(200, "Password changed successfully"));
});

const userGetMe = asyncHandler(async (req, res) => {
  const { id } = req?.user;

  const user = await User.findById(id).select("-password -refreshToken");

  if (!user) {
    throw new ApiError(400, "unauthorised access");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "user detailed fetched successfully", user));
});

const userUploadAvatar = asyncHandler(async (req, res) => {
  const getImage = req.file;

  if (!getImage) {
    throw new ApiError(400, "Image not found");
  }

  const rootPath = path.resolve(getImage.path);

  const afterUploadImage = await uploadImageInImagekit(
    rootPath,
    req?.user?.id,
    uploadImage.originalname,
  );

  if (!afterUploadImage) {
    throw new ApiError(400, "Failed to upload image");
  }

  const updatedUser = await User.findByIdAndUpdate(
    req?.user?.id,
    {
      $set: {
        avatar: {
          url: afterUploadImage?.url,
          localPath: getImage.path,
        },
      },
    },
    { new: true },
  );

  if (!updatedUser) {
    throw new ApiError(400, "Avatar not upload");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "Avatar Upload successfully", updatedUser));
});

export {
  userRegister,
  userLogin,
  userLogout,
  userVerifyEmail,
  userResendVerifyEmail,
  userRefreshAccessToken,
  userForgetPasswordRequest,
  userResetPassword,
  userChangePassword,
  userGetMe,
  userUploadAvatar,
};
