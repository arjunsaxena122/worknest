import { asyncHandler } from "../utils/index.js";

const userRegister = asyncHandler(async (req, res) => {});

const userLogin = asyncHandler(async (req, res) => {});

const userLogout = asyncHandler(async (req, res) => {});

const userVerifyEmail = asyncHandler(async (req, res) => {});

const userResendVerifyEmail = asyncHandler(async (req, res) => {});

const userRefreshAccessToken = asyncHandler(async (req, res) => {});

const userForgetPasswordRequest = asyncHandler(async (req, res) => {});

const userChangePassword = asyncHandler(async (req, res) => {});

const userGetMe = asyncHandler(async (req, res) => {});

export {
  userRegister,
  userLogin,
  userLogout,
  userVerifyEmail,
  userResendVerifyEmail,
  userRefreshAccessToken,
  userForgetPasswordRequest,
  userChangePassword,
  userGetMe,
};
