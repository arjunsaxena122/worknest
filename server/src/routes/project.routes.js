import { Router } from "express";
import { verifyAuthJwt } from "../middlewares/auth.middlewares.js";
import {
  createProject,
  createProjectMemberRoles,
  deleteProject,
  updateProjectTitleAndDes,
} from "../controllers/project.controllers.js";
import { createProjectValidators } from "../validators/project/project.validators.js";
import { validator } from "../middlewares/validation.middlewares.js";

const router = Router();

router
  .route("/create-project")
  .post(createProjectValidators(), validator, verifyAuthJwt, createProject);

router
  .route("/assign-project-member/:pid")
  .post(verifyAuthJwt, createProjectMemberRoles);

router.route("/delete-project/:pid").delete(verifyAuthJwt, deleteProject);

router
  .route("/update-project/:pid")
  .put(verifyAuthJwt, updateProjectTitleAndDes);

export default router;
