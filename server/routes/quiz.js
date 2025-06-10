const express = require("express");
const router = express.Router();
const Quiz = require("../models/Quiz");
const upload = require("../utils/upload");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Course = require("../models/Course"); // Added Course import

// Enhanced authenticateToken middleware
const authenticateToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "No token provided!" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) return res.status(401).json({ message: "User not found" });

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid token!" });
  }
};

router.post(
  "/create",
  authenticateToken,
  upload.any(), // Changed to upload.any() to handle all files
  async (req, res) => {
    try {
      const { title, courseId, subjectId, chapterId, questions, duration } = JSON.parse(req.body.questions);
      const parsedQuestions = questions; 

      const uploadedFiles = req.files || [];

      // Map uploaded files to questions and their solutions based on fieldname
      const updatedQuestions = parsedQuestions.map((q, index) => {
        const questionImageFile = uploadedFiles.find(file => file.fieldname === `questionImage_${index}`);
        if (questionImageFile) {
          q.hasImage = true;
          q.imageUrl = questionImageFile.location;
        }

        const solutionImageFile = uploadedFiles.find(file => file.fieldname === `solutionImage_${index}`);
        if (solutionImageFile) {
          if (!q.solution) q.solution = {};
          q.solution.imageUrl = solutionImageFile.location;
        }

        return q;
      });

      const quiz = new Quiz({
        title,
        courseId,
        subjectId,
        chapterId,
        duration,
        questions: updatedQuestions,
        createdBy: req.user.id,
      });

      await quiz.save();
      res.status(201).json({ success: true, quiz });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
);

// Get quiz by ID
router.get("/:quizId", authenticateToken, async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.quizId);
    if (!quiz) {
      return res
        .status(404)
        .json({ success: false, message: "Quiz not found" });
    }
    res.status(200).json({ success: true, quiz });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get all quizzes for a course/subject
router.get(
  "/course/:courseId/subject/:subjectId",
  authenticateToken,
  async (req, res) => {
    try {
      const quizzes = await Quiz.find({
        courseId: req.params.courseId,
        subjectId: req.params.subjectId,
      });
      res.status(200).json({ success: true, quizzes }); 
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
);


router.delete("/:quizId", authenticateToken, async (req, res) => {
  try {
    const quiz = await Quiz.findByIdAndDelete(req.params.quizId);
    if (!quiz) {
      return res.status(404).json({ success: false, message: "Quiz not found" });
    }
    res.status(200).json({ success: true, message: "Quiz deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get("/chapter/:chapterId", authenticateToken, async (req, res) => {
  try {
    const quizzes = await Quiz.find({
      chapterId: req.params.chapterId,
    });
    res.status(200).json({ success: true, quizzes });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
