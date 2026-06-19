const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const { getMessages } = require("../controllers/messageController");

const router = express.Router();

router.get("/:matchId", protect, getMessages);

module.exports = router;
