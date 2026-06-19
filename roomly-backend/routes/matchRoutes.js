const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const { getSuggestions, swipeUser, getMyMatches } = require("../controllers/matchController");

const router = express.Router();

router.get("/suggestions", protect, getSuggestions);
router.post("/swipe", protect, swipeUser);
router.get("/my-matches", protect, getMyMatches);

module.exports = router;
