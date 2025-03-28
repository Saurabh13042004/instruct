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
    adminRole: { 
      type: String, 
      enum: ["Super Admin", "Content Admin", "UMAA Admin", "Financial Admin"], 
      default: "Super Admin" 
    },
    purchasedCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: "Course" }],
    otp: { type: String },
    otpExpiry: { type: Date },
    isBlocked: { type: Boolean, default: false },
    blockType: { type: String, enum: ["temporary", "permanent"], default: null },
    blockEndDate: { type: Date, default: null },
    lastActive: { type: Date, default: Date.now },
    activityLog: [{
      activityType: { type: String, enum: ["video", "audio", "pdf", "quiz"] },
      courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course" },
      timestamp: { type: Date, default: Date.now }
    }]
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
