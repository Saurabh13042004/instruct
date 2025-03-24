// models/User.js
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    dateOfBirth: { type: Date },
    email: { type: String, required: true, unique: true },
    phoneNumber: { type: String, required: true },
    is_verified: { type: Boolean, default: false },
    password: { type: String, required: true },
    type: { type: String, enum: ["student", "instructor", "admin"], default: "student" },
    purchasedCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: "Course" }],
    otp: { type: String },
    otpExpiry: { type: Date }
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
