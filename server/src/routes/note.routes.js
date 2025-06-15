import { Router } from "express";
import {
  noteAdd,
  noteDelete,
  getAllNote,
  noteUpdate,
  getNoteById,
} from "../controllers/note.controllers.js";
import { verifyAuthJwt, verifyRoles } from "../middlewares/auth.middlewares.js";
import { AvailableUserRoles, UserRolesEnum } from "../utils/constants.js";

const router = Router();

router
  .route("/:pid")
  .post(verifyAuthJwt, verifyRoles([UserRolesEnum.ADMIN]), noteAdd)

router
  .route("/:pid/note/:nid")
  .delete(verifyAuthJwt, verifyRoles([UserRolesEnum.ADMIN]), noteDelete)
  .put(verifyAuthJwt, verifyRoles([UserRolesEnum.ADMIN]), noteUpdate)


router
  .route("/get-all-note/:pid/note/:nid")
  .get(verifyAuthJwt, verifyRoles(AvailableUserRoles), getAllNote);
router
  .route("/get-note/:pid/note/:nid")
  .get(verifyAuthJwt, verifyRoles([UserRolesEnum.ADMIN]), getNoteById);

export default router;
