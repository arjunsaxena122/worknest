import { body } from "express-validator";

const createProjectValidators = () => {
  return [
    body("title")
      .trim()
      .notEmpty()
      .withMessage("Title is required")
      .isString()
      .withMessage("Invalid string format"),
    body("description")
      .trim()
      .notEmpty()
      .withMessage("Description is required")
      .isString()
      .withMessage("Invalid string format"),
  ];
};

export { createProjectValidators };
