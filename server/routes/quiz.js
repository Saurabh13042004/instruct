const express = require("express");
const router = express.Router();
const Quiz = require("../models/Quiz");
const upload = require("../utils/upload");
const jwt = require("jsonwebtoken");
const User = require("../models/User"); // Add this import

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
  upload.array("questionImages", 50),
  async (req, res) => {
    try {
      const { title, courseId, subjectId, chapterId, questions, duration } =
        req.body;
      const parsedQuestions = JSON.parse(questions);

      // Map uploaded files to questions
      if (req.files) {
        req.files.forEach((file, index) => {
          if (parsedQuestions[index]) {
            parsedQuestions[index].hasImage = true;
            parsedQuestions[index].imageUrl = file.location;
          }
        });
      }

      const quiz = new Quiz({
        title,
        courseId,
        subjectId,
        chapterId,
        duration,
        questions: parsedQuestions,
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
      const courseName = await Course.findById(req.params.courseId);
      const subjectName = await Subject.findById(req.params.subjectId);
      res.status(200).json({ success: true, quizzes , courseName, subjectName });
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
