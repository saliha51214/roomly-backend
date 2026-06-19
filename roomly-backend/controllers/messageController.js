const Message = require("../models/Message");
const Match = require("../models/Match");

const getMessages = async (req, res, next) => {
  try {
    const { matchId } = req.params;

    const match = await Match.findById(matchId);
    if (!match) {
      return res.status(404).json({ message: "Match not found" });
    }

    const isParticipant =
      match.userA.toString() === req.user._id.toString() ||
      match.userB.toString() === req.user._id.toString();

    if (!isParticipant || match.status !== "matched") {
      return res.status(403).json({ message: "Not authorized to view this chat" });
    }

    const messages = await Message.find({ matchId }).sort({ createdAt: 1 });
    res.status(200).json(messages);
  } catch (error) {
    next(error);
  }
};

module.exports = { getMessages };
