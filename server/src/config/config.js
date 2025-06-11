import dotenv from "dotenv";
import { ApiError } from "../utils/api-error.js";

dotenv.config({
  path: "./.env",
});

const createEnv = (processEnv) => {
  if (!processEnv) {
    throw new ApiError(400, "Env doesn't exist", env);
  }

  const processEnvObject = {
    port: processEnv.PORT,
    mongouri: processEnv.MONGO_URI,
    node_env: processEnv.NODE_ENV,
    access_token_key: processEnv.ACCESS_TOKEN_KEY,
    access_token_expiry: processEnv.ACCESS_TOKEN_EXPIRY,
    refresh_token_key: processEnv.REFRESH_TOKEN_KEY,
    refresh_token_expiry: processEnv.REFRESH_TOKEN_EXPIRY,
    mailtrap_host: processEnv.MAILTRAP_HOST,
    mailtrap_port: processEnv.MAILTRAP_PORT,
    mailtrap_auth_user: processEnv.MAILTRAP_AUTH_USER,
    mailtrap_auth_pass: processEnv.MAILTRAP_AUTH_PASS,
    cloudinary_url: process.env.CLOUDINARY_URL,
    publicKey : process.env.PUBLIC_KEY,
    privateKey : process.env.PRIVATE_KEY,
    urlEndpoint : process.env.URLENDPOINT
  };

  return processEnvObject;
};

export const env = createEnv(process.env);
