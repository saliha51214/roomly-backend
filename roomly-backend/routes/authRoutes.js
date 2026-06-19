const express = require("express");
const rateLimit = require("express-rate-limit");
const { registerUser, loginUser, refreshToken, logoutUser } = require("../controllers/authController");
const { validate, signupValidation, loginValidation } = require("../middleware/validateMiddleware");

const router = express.Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { message: "Too many attempts, please try again later" },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post("/register", authLimiter, signupValidation, validate, registerUser);
router.post("/login", authLimiter, loginValidation, validate, loginUser);
router.post("/refresh", refreshToken);
router.post("/logout", logoutUser);

module.exports = router;
