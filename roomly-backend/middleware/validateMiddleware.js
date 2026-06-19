const { body, validationResult } = require("express-validator");

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

const signupValidation = [
  body("name").trim().notEmpty().withMessage("Name is required").isLength({ max: 50 }),
  body("email").trim().isEmail().withMessage("Valid email is required").normalizeEmail(),
  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters")
    .matches(/\d/)
    .withMessage("Password must contain a number")
    .matches(/[A-Z]/)
    .withMessage("Password must contain an uppercase letter"),
];

const loginValidation = [
  body("email").trim().isEmail().withMessage("Valid email is required").normalizeEmail(),
  body("password").notEmpty().withMessage("Password is required"),
];

const quizValidation = [
  body("cleanliness").isInt({ min: 1, max: 5 }),
  body("sleepSchedule").isIn(["early", "late"]),
  body("budget").isFloat({ min: 0 }),
  body("noiseTolerance").isInt({ min: 1, max: 5 }),
  body("socialLevel").isInt({ min: 1, max: 5 }),
];

module.exports = { validate, signupValidation, loginValidation, quizValidation };
