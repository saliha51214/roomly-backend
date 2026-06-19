const User = require("../models/User");
const Match = require("../models/Match");

const WEIGHTS = {
  cleanliness: 0.25,
  budget: 0.25,
  noiseTolerance: 0.15,
  socialLevel: 0.15,
  sleepSchedule: 0.2,
};

const calculateCompatibility = (a, b) => {
  let totalDiff = 0;

  totalDiff += (Math.abs(a.cleanliness - b.cleanliness) / 4) * WEIGHTS.cleanliness;
  totalDiff += (Math.abs(a.noiseTolerance - b.noiseTolerance) / 4) * WEIGHTS.noiseTolerance;
  totalDiff += (Math.abs(a.socialLevel - b.socialLevel) / 4) * WEIGHTS.socialLevel;

  const maxBudget = Math.max(a.budget, b.budget, 1);
  totalDiff += (Math.abs(a.budget - b.budget) / maxBudget) * WEIGHTS.budget;

  totalDiff += (a.sleepSchedule === b.sleepSchedule ? 0 : 1) * WEIGHTS.sleepSchedule;

  return Math.max(0, Math.round((1 - totalDiff) * 100));
};

const getSuggestions = async (req, res, next) => {
  try {
    const currentUser = req.user;

    if (!currentUser.quizCompleted) {
      return res.status(400).json({ message: "Complete the lifestyle quiz first" });
    }

    const existingMatches = await Match.find({
      $or: [{ userA: currentUser._id }, { userB: currentUser._id }],
    });

    const excludedIds = existingMatches.map((m) =>
      m.userA.toString() === currentUser._id.toString() ? m.userB.toString() : m.userA.toString()
    );
    excludedIds.push(currentUser._id.toString());

    const candidates = await User.find({
      _id: { $nin: excludedIds },
      quizCompleted: true,
    }).select("name age bio photo preferredLocation quizAnswers");

    const suggestions = candidates
      .map((candidate) => ({
        id: candidate._id,
        name: candidate.name,
        age: candidate.age,
        bio: candidate.bio,
        photo: candidate.photo,
        preferredLocation: candidate.preferredLocation,
        compatibilityScore: calculateCompatibility(currentUser.quizAnswers, candidate.quizAnswers),
      }))
      .sort((a, b) => b.compatibilityScore - a.compatibilityScore);

    res.status(200).json(suggestions);
  } catch (error) {
    next(error);
  }
};

const swipeUser = async (req, res, next) => {
  try {
    const currentUserId = req.user._id.toString();
    const { targetUserId, action } = req.body;

    if (!["liked", "rejected"].includes(action)) {
      return res.status(400).json({ message: "Invalid swipe action" });
    }

    if (targetUserId === currentUserId) {
      return res.status(400).json({ message: "Cannot swipe on yourself" });
    }

    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const [userA, userB] = [currentUserId, targetUserId].sort();
    let match = await Match.findOne({ userA, userB });

    const score = calculateCompatibility(req.user.quizAnswers, targetUser.quizAnswers);

    if (!match) {
      match = await Match.create({ userA, userB, compatibilityScore: score });
    }

    if (userA === currentUserId) {
      match.swipeA = action;
    } else {
      match.swipeB = action;
    }

    if (match.swipeA === "liked" && match.swipeB === "liked") {
      match.status = "matched";
    } else if (action === "rejected") {
      match.status = "rejected";
    }

    await match.save();

    res.status(200).json({
      mutualMatch: match.status === "matched",
      match,
    });
  } catch (error) {
    next(error);
  }
};

const getMyMatches = async (req, res, next) => {
  try {
    const matches = await Match.find({
      status: "matched",
      $or: [{ userA: req.user._id }, { userB: req.user._id }],
    }).populate("userA userB", "name age photo bio");

    res.status(200).json(matches);
  } catch (error) {
    next(error);
  }
};

module.exports = { getSuggestions, swipeUser, getMyMatches };
