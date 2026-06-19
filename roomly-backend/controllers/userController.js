const User = require("../models/User");

const getMyProfile = async (req, res, next) => {
  try {
    res.status(200).json(req.user);
  } catch (error) {
    next(error);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const allowedFields = ["name", "age", "gender", "bio", "photo", "preferredLocation"];
    const updates = {};

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true,
    });

    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};

const submitQuiz = async (req, res, next) => {
  try {
    const { cleanliness, sleepSchedule, budget, smoking, pets, noiseTolerance, socialLevel } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        quizAnswers: { cleanliness, sleepSchedule, budget, smoking, pets, noiseTolerance, socialLevel },
        quizCompleted: true,
      },
      { new: true, runValidators: true }
    );

    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};

module.exports = { getMyProfile, updateProfile, submitQuiz };
