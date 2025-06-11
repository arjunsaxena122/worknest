import ImageKit from "imagekit";
import fs from "fs";
import path from "path";
import { ApiError } from "./api-error.js";
import { env } from "../config/config.js";

let imagekit = new ImageKit({
  publicKey: env.publicKey,
  privateKey: env.privateKey,
  urlEndpoint: env.urlEndpoint,
});

const uploadImageInImagekit = async (localPath, id, originalFilename) => {
  if (!localPath) return null;

  const bufferLocalPath = fs.readFileSync(localPath);

  if (!bufferLocalPath) {
    throw new ApiError(400, "Conversion failed image to buffer");
  }

  const ext = path.extname(originalFilename);

  if (!ext) {
    throw new ApiError(400, "Image extesnion not valid");
  }

  try {
    const image = await imagekit.upload({
      file: bufferLocalPath,
      fileName: `${id}${ext}`,
      overwriteFile: true,
      useUniqueFileName: false,
    });

    if (!image) {
      throw new ApiError(400, "Image url not generated");
    }

    fs.unlinkSync(localPath);
    return image;
  } catch (err) {
    fs.unlinkSync(localPath);
    console.log("ERROR: Uploading file on Imagekit", err);
  }
};

export { uploadImageInImagekit };
