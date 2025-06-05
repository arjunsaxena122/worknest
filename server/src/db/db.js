import mongoose from "mongoose";
import { env } from "../config/config.js";
import { ApiError } from "../utils/api-error.js";

const connectDB = async () => {
  try {
    if (!env.mongouri) {
      throw new ApiError(400, "database uri doesn't exist");
    }

    const connectionInstance = await mongoose.connect(env.mongouri);

    console.log(
      `MongoDB connection Successfully done ${connectionInstance.connection.host}`,
    );
  } catch (error) {
    console.log(`ERROR: MongoDB failed connection ${error}`);
    process.exit(1);
  }
};

export default connectDB;
