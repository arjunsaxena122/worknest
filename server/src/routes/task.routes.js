import { Router } from "express";
import {
  createSubTask,
  createTask,
  deleteTask,
  delSubTask,
  getAllTask,
  getSubTask,
  updateSubTask,
  updateTask,
} from "../controllers/task.controllers.js";
import { verifyAuthJwt } from "../middlewares/auth.middlewares.js";
import { upload } from "../middlewares/multer.middlewares.js";

const router = Router();

router.route("/create-task/:pid").post(verifyAuthJwt, upload.fields("attachment",4) , createTask);

router.route("/delete-task/:tid").delete(verifyAuthJwt, deleteTask);

router.route("/update-task/:tid").put(verifyAuthJwt, updateTask);

router.route("/get-all-task/:pid").get(verifyAuthJwt, getAllTask);

router
  .route("/subtask/:tid")
  .post(createSubTask)
  .post(updateSubTask)
  .get(delSubTask)
  .get(getSubTask);

export default router;
