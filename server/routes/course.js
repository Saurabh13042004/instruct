// routes/course.js
const express = require("express");
const jwt = require("jsonwebtoken");
const Course = require("../models/Course");
const User = require("../models/User");
// If you are using file uploads for assets, include your upload middleware here
// const upload = require("../utils/upload");
const router = express.Router();

// JWT-based authentication middleware
const authenticateToken = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token)
        return res.status(401).json({ message: "No token provided!" });
    try {
        req.user = jwt.verify(token, process.env.JWT_SECRET);
        next();
    } catch (error) {
        res.status(401).json({ message: "Invalid token!" });
    }
};

/* =========================
   ADMIN CRUD OPERATIONS
   ========================= */

// Create a new course (admin only)
// This endpoint expects a JSON body with the new course details, including subjects and chapters.
// For example:
/*
{
  "courseName": "Vision",
  "description": "Lorem ipsum ...",
  "includedAssets": [
    "Free Youtube Videos",
    "Animative notes used",
    "Recall sheets",
    "Practice questions split in 3 levels",
    "Full Syllabus test",
    "Audio Podcast Of Chapters",
    "Simulations",
    "Lifetime Access"
  ],
  "introVideo": "https://youtu.be/introVideoLink",
  "languages": ["English", "Hindi"],
  "originalPrice": 1999,
  "discountPrice": 999,
  "promocode": "VISION50",
  "subjects": [
    {
      "subjectName": "Physics",
      "chapters": [
         {
           "chapterName": "Units and Measurements",
           "quizLink": "https://example.com/quiz1",
           "audioLink": "https://example.com/audio1",
           "pdfLink": "https://example.com/pdf1",
           "videoLink": "https://example.com/video1"
         }
      ]
    },
    {
      "subjectName": "Chemistry",
      "chapters": [
         {
           "chapterName": "Chemical Bonding",
           "quizLink": "https://example.com/quiz2",
           "audioLink": "https://example.com/audio2",
           "pdfLink": "https://example.com/pdf2",
           "videoLink": "https://example.com/video2"
         }
      ]
    }
  ]
}
*/
router.post("/createCourse", authenticateToken, async (req, res) => {
    try {
        // Only admins can create courses
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: "User not found!" });
        if (user.type !== "admin") {
            return res.status(403).json({ message: "Access denied. Admin privileges required." });
        }
        const newCourse = new Course(req.body);
        const savedCourse = await newCourse.save();
        res.status(201).json({
            success: true,
            message: "Course created successfully",
            course: savedCourse
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error creating course",
            error: error.message
        });
    }
});

// Update a course (admin only)
router.put("/updateCourse/:courseId", authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: "User not found!" });
        if (user.type !== "admin") {
            return res.status(403).json({ message: "Access denied. Admin privileges required." });
        }
        const updatedCourse = await Course.findByIdAndUpdate(req.params.courseId, req.body, { new: true });
        if (!updatedCourse) return res.status(404).json({ message: "Course not found" });
        res.status(200).json({
            success: true,
            message: "Course updated successfully",
            course: updatedCourse
        });
    } catch (error) {
        res.status(500).json({ message: "Error updating course", error: error.message });
    }
});

// Delete a course (admin only)
router.delete("/deleteCourse/:courseId", authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: "User not found!" });
        if (user.type !== "admin") {
            return res.status(403).json({ message: "Access denied. Admin privileges required." });
        }
        const deletedCourse = await Course.findByIdAndDelete(req.params.courseId);
        if (!deletedCourse) return res.status(404).json({ message: "Course not found" });
        res.status(200).json({
            success: true,
            message: "Course deleted successfully",
            deletedCourse
        });
    } catch (error) {
        res.status(500).json({ message: "Error deleting course", error: error.message });
    }
});


router.get("/course/:courseId", async (req, res) => {
    try {
        // Use .select("-subjects") to omit the nested course material
        const course = await Course.findById(req.params.courseId).select("-subjects");
        if (!course) {
            return res.status(404).json({ message: "Course not found" });
        }
        res.status(200).json({ course });
    } catch (error) {
        res.status(500).json({ message: "Error fetching course", error: error.message });
    }
});


// Get all courses (public access)
router.get("/getAllCourses", async (req, res) => {
    try {
        const courses = await Course.find();
        if (!courses.length) {
            return res.status(404).json({ success: false, message: "No courses found" });
        }
        res.status(200).json({
            success: true,
            count: courses.length,
            courses
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Server error occurred while fetching courses",
            error: error.message
        });
    }
});

/* =========================
   VIEW COURSE CONTENT
   ========================= */

// This endpoint returns the detailed content (subjects and chapters)
// Only the admin or a student who has purchased the course can view it.
router.get("/course/:courseId/content", authenticateToken, async (req, res) => {
    try {
        const course = await Course.findById(req.params.courseId);
        if (!course) return res.status(404).json({ message: "Course not found" });

        const user = await User.findById(req.user.id);
        // Admin can view; students must have purchased the course.
        if (user.type === "student" && !user.purchasedCourses.includes(course._id)) {
            return res.status(403).json({ message: "Access denied. You have not purchased this course." });
        }

        res.status(200).json({ courseContent: course.subjects });
    } catch (error) {
        res.status(500).json({ message: "Error fetching course content", error: error.message });
    }
});

module.exports = router;
