import { Router } from "express";
import {
  noteAdd,
  noteDelete,
  getAllNote,
  noteUpdate,
  getNoteById,
} from "../controllers/note.controllers.js";
import { verifyAuthJwt } from "../middlewares/auth.middlewares.js";

const router = Router();

router.route("/create-note/:pid").post(verifyAuthJwt, noteAdd);
router.route("/delete-note/:nid").delete(verifyAuthJwt, noteDelete);
router.route("/update-note/:nid").put(verifyAuthJwt, noteUpdate);
router.route("/get-all-note/:pid").get(verifyAuthJwt, getAllNote);
router.route("/get-note/:nid").get(verifyAuthJwt, getNoteById);

export default router;
