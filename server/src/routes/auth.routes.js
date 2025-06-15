import { Router } from "express";
import {
  userChangePassword,
  userForgetPasswordRequest,
  userGetMe,
  userLogin,
  userLogout,
  userRefreshAccessToken,
  userRegister,
  userResendVerifyEmail,
  userResetPassword,
  userUploadAvatar,
  userVerifyEmail,
} from "../controllers/auth.controllers.js";
import { validator } from "../middlewares/validation.middlewares.js";
import {
  userLoginValidator,
  userRegisterValidator,
  userChangePasswordValidator,
  userResetPasswordValidator,
} from "../validators/auth/auth.validators.js";
import { verifyAuthJwt } from "../middlewares/auth.middlewares.js";
import { upload } from "../middlewares/multer.middlewares.js";

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
router.route("/refresh-token").get(userRefreshAccessToken);
router.route("/resend-email").get(verifyAuthJwt, userResendVerifyEmail);
router.route("/forget-password").post(userForgetPasswordRequest);
router
  .route("/reset-password/:resetId")
  .post(userResetPasswordValidator(), validator, userResetPassword);

router.route("/get-me").get(verifyAuthJwt, userGetMe);
router
  .route("/upload-image")
  .patch(verifyAuthJwt, upload.single("avatar"), userUploadAvatar);

export default router;
