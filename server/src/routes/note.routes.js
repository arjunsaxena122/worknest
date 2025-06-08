import { Router } from "express";
import {
  noteAdd,
  noteDelete,
  noteGet,
  noteUpdate,
} from "../controllers/note.controllers.js";
import { verifyAuthJwt } from "../middlewares/auth.middlewares.js";

const router = Router();

router.route("/create-note/:nid").post(verifyAuthJwt, noteAdd);
router.route("/delete-note/:nid").delete(verifyAuthJwt, noteDelete);
// router.route("/update-note/:nid").put(verifyAuthJwt, noteUpdate);
router.route("/get-note/:nid").get(verifyAuthJwt, noteGet);

export default router;
