import { body } from "express-validator";

const userRegisterValidator = () => {
  return [
    body("email")
      .trim()
      .notEmpty()
      .withMessage("email is required")
      .isEmail()
      .withMessage("Invalid email"),

    body("password")
      .trim()
      .notEmpty()
      .withMessage("password is required")
      .isStrongPassword({
        minLength: 8,
        minLowercase: 1,
        minNumbers: 1,
        minSymbols: 1,
        minUppercase: 1,
      })
      .withMessage(
        "Password must be at least 8 character with one minimum length, lowercase,number,symbols and uppercase",
      ),
  ];
};

const userLoginValidator = () => {
  return [
    body("email")
      .trim()
      .notEmpty()
      .withMessage("email is required")
      .isEmail()
      .withMessage("Invalid email"),

    body("password")
      .trim()
      .notEmpty()
      .withMessage("password is required")
      .isStrongPassword({
        minLength: 8,
        minLowercase: 1,
        minNumbers: 1,
        minSymbols: 1,
        minUppercase: 1,
      })
      .withMessage(
        "Password must be at least 8 character with one minimum length, lowercase,number,symbols and uppercase",
      ),
  ];
};

const userChangePasswordValidator = () => {
  return [
    body("oldPassword")
      .trim()
      .notEmpty()
      .withMessage("old password is required")
      .isStrongPassword({
        minLength: 8,
        minLowercase: 1,
        minNumbers: 1,
        minSymbols: 1,
        minUppercase: 1,
      })
      .withMessage(
        "Old Password must be at least 8 character with one minimum length, lowercase,number,symbols and uppercase",
      ),
    body("newPassword")
      .trim()
      .notEmpty()
      .withMessage("new password is required")
      .isStrongPassword({
        minLength: 8,
        minLowercase: 1,
        minNumbers: 1,
        minSymbols: 1,
        minUppercase: 1,
      })
      .withMessage(
        "New Password must be at least 8 character with one minimum length, lowercase,number,symbols and uppercase",
      ),
    body("confirmPassword")
      .trim()
      .notEmpty()
      .withMessage("confirm password is required")
      .isStrongPassword({
        minLength: 8,
        minLowercase: 1,
        minNumbers: 1,
        minSymbols: 1,
        minUppercase: 1,
      })
      .withMessage(
        "confirm Password must be at least 8 character with one minimum length, lowercase,number,symbols and uppercase",
      ),
  ];
};

const userResetPasswordValidator = () => {
  return [
    body("newPassword")
      .trim()
      .notEmpty()
      .withMessage("old password is required")
      .isStrongPassword({
        minLength: 8,
        minLowercase: 1,
        minNumbers: 1,
        minSymbols: 1,
        minUppercase: 1,
      })
      .withMessage(
        "Old Password must be at least 8 character with one minimum length, lowercase,number,symbols and uppercase",
      ),
    body("confirmPassword")
      .trim()
      .notEmpty()
      .withMessage("new password is required")
      .isStrongPassword({
        minLength: 8,
        minLowercase: 1,
        minNumbers: 1,
        minSymbols: 1,
        minUppercase: 1,
      })
      .withMessage(
        "New Password must be at least 8 character with one minimum length, lowercase,number,symbols and uppercase",
      ),
    body("confirmPassword")
      .trim()
      .notEmpty()
      .withMessage("confirm password is required")
      .isStrongPassword({
        minLength: 8,
        minLowercase: 1,
        minNumbers: 1,
        minSymbols: 1,
        minUppercase: 1,
      })
      .withMessage(
        "confirm Password must be at least 8 character with one minimum length, lowercase,number,symbols and uppercase",
      ),
  ];
};

export {
  userRegisterValidator,
  userLoginValidator,
  userChangePasswordValidator,
  userResetPasswordValidator,
};
