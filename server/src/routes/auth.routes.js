import { Router } from "express";
import {
  userChangePassword,
  userForgetPasswordRequest,
  userGetMe,
  userLogin,
  userLogout,
  userRegister,
  userResendVerifyEmail,
  userResetPassword,
  userVerifyEmail,
} from "../controllers/auth.controllers.js";
import { validator } from "../middlewares/validation.middlewares.js";
import {
  userLoginValidator,
  userRegisterValidator,
  userChangePasswordValidator,
} from "../validators/auth/auth.validators.js";
import { verifyAuthJwt } from "../middlewares/auth.middlewares.js";

const router = Router();

router
  .route("/register")
  .post(userRegisterValidator(), validator, userRegister);

router.route("/login").post(userLoginValidator(), validator, userLogin);

router.route("/logout").get(verifyAuthJwt, userLogout);

router
  .route("/change-password")
  .post(
    userChangePasswordValidator(),
    validator,
    verifyAuthJwt,
    userChangePassword,
  );

router.route("/verify-email/:tokenId").get(userVerifyEmail);
router.route("/resend-email").get(verifyAuthJwt, userResendVerifyEmail);
router.route("/forget-password").post(userForgetPasswordRequest);
router.route("/reset-password/:resetId").post(userResetPassword);

router.route("/get-me").get(verifyAuthJwt, userGetMe);

export default router;
