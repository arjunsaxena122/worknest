import { Router } from "express";
import { verifyAuthJwt, verifyRoles } from "../middlewares/auth.middlewares.js";
import {
  addProjectMember,
  createProject,
  deleteProject,
  deleteProjectMember,
  getAllProject,
  getProjectById,
  getProjectMemberByProjectId,
  updateProject,
  updateProjectMemberRole,
} from "../controllers/project.controllers.js";
import { createProjectValidators } from "../validators/project/project.validators.js";
import { validator } from "../middlewares/validation.middlewares.js";
import { UserRolesEnum } from "../utils/constants.js";

const router = Router();

router
  .route("/create-project")
  .post(createProjectValidators(), validator, verifyAuthJwt, createProject);

router.route("/delete-project/:pid").delete(verifyAuthJwt, deleteProject);
router.route("/update-project/:pid").put(verifyAuthJwt, updateProject);
router.route("/get-all-project").get(verifyAuthJwt, getAllProject);
router.route("/get-project/:pid").get(verifyAuthJwt, getProjectById);

// ? Project Member Routes

router
  .route("/:pid")
  .post(verifyAuthJwt, verifyRoles([UserRolesEnum.ADMIN]), addProjectMember)
  .get(verifyAuthJwt, getProjectMemberByProjectId);


router
  .route("/:pid/projectmember/:pmid")
  .delete(
    verifyAuthJwt,
    verifyRoles([UserRolesEnum.ADMIN]),
    deleteProjectMember,
  )
  .put(
    verifyAuthJwt,
    verifyRoles([UserRolesEnum.ADMIN]),
    updateProjectMemberRole,
  );

export default router;
