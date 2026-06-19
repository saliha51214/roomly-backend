const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxlength: 50,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 8,
      select: false,
    },
    age: { type: Number, min: 18, max: 100 },
    gender: { type: String, enum: ["male", "female", "other"] },
    bio: { type: String, maxlength: 300, default: "" },
    photo: { type: String, default: "" },
    preferredLocation: { type: String, default: "" },
    quizAnswers: {
      cleanliness: { type: Number, min: 1, max: 5 },
      sleepSchedule: { type: String, enum: ["early", "late"] },
      budget: { type: Number, min: 0 },
      smoking: { type: Boolean, default: false },
      pets: { type: Boolean, default: false },
      noiseTolerance: { type: Number, min: 1, max: 5 },
      socialLevel: { type: Number, min: 1, max: 5 },
    },
    quizCompleted: { type: Boolean, default: false },
    refreshToken: { type: String, select: false },
    failedLoginAttempts: { type: Number, default: 0, select: false },
    lockUntil: { type: Date, select: false },
    isVerified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.isLocked = function () {
  return Boolean(this.lockUntil && this.lockUntil > Date.now());
};

module.exports = mongoose.model("User", userSchema);
