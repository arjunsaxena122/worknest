import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { env } from "../config/config.js";

const userSchema = new mongoose.Schema(
  {
    avatar: {
      type: {
        url: String,
        localPath: String,
      },
      default: {
        url: `https://placehold.co/600x400`,
        localPath: "",
      },
      _id: false,
    },

    username: {
      type: String,
      trim: true,
      lowercase: true,
    },

    fullname: {
      type: String,
      trim: true,
      lowercase: true,
    },

    email: {
      type: String,
      trim: true,
      unique: true,
      required: true,
    },

    password: {
      type: String,
      trim: true,
      required: true,
    },

    isEmailVerification: {
      type: Boolean,
      default: false,
    },

    emailVerificationToken: {
      type: String,
    },

    emailVerificationExpiry: {
      type: Date,
    },

    refreshToken: {
      type: String,
    },

    forgotPasswordToken: {
      type: String,
    }, 

    forgetPasswordExpiry: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
);

userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

userSchema.methods.isCheckCorrectPassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      id: this._id,
    },
    env.access_token_key,
    {
      expiresIn: env.access_token_expiry,
    },
  );
};

userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      id: this._id,
    },
    env.refresh_token_key,
    {
      expiresIn: env.refresh_token_expiry,
    },
  );
};

export const User = mongoose.model("User", userSchema);
