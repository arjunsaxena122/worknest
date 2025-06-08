import { Router } from "express";
import {
  createTask,
  deleteTask,
  getAllTask,
  updateTask,
} from "../controllers/task.controllers.js";
import { verifyAuthJwt } from "../middlewares/auth.middlewares.js";

const router = Router();

router.route("/create-task/:pid").post(verifyAuthJwt, createTask);

router.route("/delete-task/:tid").delete(verifyAuthJwt, deleteTask);

router.route("/update-task/:tid").put(verifyAuthJwt, updateTask);

router.route("/get-all-task/:pid").get(verifyAuthJwt, getAllTask);

export default router;
