import { Router } from "express";
import { userRegister } from "../controllers/auth.controllers.js";
import { validator } from "../middlewares/validation.middlewares.js";
import { userRegisterValidator } from "../validators/auth/auth.validators.js";

const router = Router();

router
  .route("/user-register")
  .post(userRegisterValidator(), validator, userRegister);

export default router;
