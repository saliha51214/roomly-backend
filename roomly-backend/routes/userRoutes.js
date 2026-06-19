const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const { quizValidation, validate } = require("../middleware/validateMiddleware");
const { getMyProfile, updateProfile, submitQuiz } = require("../controllers/userController");

const router = express.Router();

router.get("/me", protect, getMyProfile);
router.put("/me", protect, updateProfile);
router.post("/quiz", protect, quizValidation, validate, submitQuiz);

module.exports = router;
