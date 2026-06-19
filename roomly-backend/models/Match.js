const mongoose = require("mongoose");

const matchSchema = new mongoose.Schema(
  {
    userA: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    userB: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    compatibilityScore: { type: Number, required: true },
    swipeA: { type: String, enum: ["pending", "liked", "rejected"], default: "pending" },
    swipeB: { type: String, enum: ["pending", "liked", "rejected"], default: "pending" },
    status: { type: String, enum: ["pending", "matched", "rejected"], default: "pending" },
  },
  { timestamps: true }
);

matchSchema.index({ userA: 1, userB: 1 }, { unique: true });

module.exports = mongoose.model("Match", matchSchema);
