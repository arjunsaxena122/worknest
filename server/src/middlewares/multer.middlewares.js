import multer from "multer";
import path from "path";
import { ApiError } from "../utils/index.js";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/attachment");
  },

  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.fieldname);
  },
});

export const upload = multer({
  storage: storage,
  limits: {
    fieldSize: 1000 * 1000 * 2,
  },
  // fileFilter: function (req, file, cb) {
  //   let ext = path.extname(file.originalname);

  //   if (["png,jpeg,jpg"].some((f) => f !== ext)) {
  //     cb(null, false);
  //     throw new ApiError(400, "Only these extension are valid");
  //   }

  //   cb(null, true);
  // },
});
