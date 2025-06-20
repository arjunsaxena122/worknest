import { Router } from "express";
import {
  createSubTask,
  createTask,
  deleteTask,
  delSubTask,
  getAllSubTask,
  getAllTask,
  getSubTaskById,
  getTaskById,
  updateSubTask,
  updateTask,
} from "../controllers/task.controllers.js";
import { verifyAuthJwt, verifyRoles } from "../middlewares/auth.middlewares.js";
import { upload } from "../middlewares/multer.middlewares.js";
import { UserRolesEnum } from "../utils/constants.js";

const router = Router();

router
  .route("/create-task/:pid")
  .post(
    verifyAuthJwt,
    verifyRoles([UserRolesEnum.ADMIN, UserRolesEnum.PROJECT_ADMIN]),
    upload.array("attachment",3),
    createTask,
  );

router
  .route("/:pid/t/:tid")
  .delete(
    verifyAuthJwt,
    verifyRoles([UserRolesEnum.ADMIN, UserRolesEnum.PROJECT_ADMIN]),
    deleteTask,
  )
  .put(
    verifyAuthJwt,
    verifyRoles([UserRolesEnum.ADMIN, UserRolesEnum.PROJECT_ADMIN]),
    updateTask,
  );

router.route("/get-all-task/:pid").get(verifyAuthJwt, getAllTask);
router.route("/get-task/:tid").get(verifyAuthJwt, getTaskById);

router
  .route("/:tid/project/:pid")
  .post(
    verifyAuthJwt,
    verifyRoles([UserRolesEnum.ADMIN, UserRolesEnum.PROJECT_ADMIN]),
    createSubTask,
  );

router
  .route("/subtask/:stId/project/:pid")
  .put(
    verifyAuthJwt,
    verifyRoles([UserRolesEnum.ADMIN, UserRolesEnum.PROJECT_ADMIN]),
    updateSubTask,
  )
  .delete(
    verifyAuthJwt,
    verifyRoles([UserRolesEnum.ADMIN, UserRolesEnum.PROJECT_ADMIN]),
    delSubTask,
  );

router.route("/get-subtask/:stId").get(getSubTaskById);
router.route("/get-all-subtask/:tid").get(getAllSubTask);

export default router;
