const Quiz = require('../models/Quiz');
const Course = require('../models/Course');
const { uploadToS3, getSignedUrl } = require('../utils/s3Utils');

// Create a new quiz
exports.createQuiz = async (req, res) => {
  try {
    const { title, courseId, subjectId, chapterId, duration, questions } = JSON.parse(req.body.questions);
    const questionImages = req.files ? req.files.questionImages : [];

    // Upload question images to S3 if any
    const uploadedImages = [];
    if (questionImages.length > 0) {
      for (const image of questionImages) {
        const imageUrl = await uploadToS3(image, 'quiz-images');
        uploadedImages.push(imageUrl);
      }
    }

    // Create quiz with solutions
    const quiz = new Quiz({
      title,
      courseId,
      subjectId,
      chapterId,
      duration,
      questions: questions.map((q, index) => ({
        question: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer,
        hasImage: q.hasImage,
        imageUrl: q.hasImage ? uploadedImages[index] : '',
        solution: {
          text: q.solution.text || '',
          videoUrl: q.solution.videoUrl || '',
          imageUrl: q.solution.imageUrl || ''
        }
      }))
    });

    await quiz.save();

    // Update course with quiz reference
    await Course.findByIdAndUpdate(courseId, {
      $push: { quizzes: quiz._id }
    });

    res.status(201).json({
      success: true,
      message: 'Quiz created successfully',
      quiz
    });
  } catch (error) {
    console.error('Error creating quiz:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create quiz',
      error: error.message
    });
  }
};

// Get quiz by ID
exports.getQuizById = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.quizId);
    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }

    res.status(200).json({
      success: true,
      quiz
    });
  } catch (error) {
    console.error('Error fetching quiz:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch quiz',
      error: error.message
    });
  }
};

// Get quizzes by course ID
exports.getQuizzesByCourse = async (req, res) => {
  try {
    const quizzes = await Quiz.find({ courseId: req.params.courseId });
    res.status(200).json({
      success: true,
      quizzes
    });
  } catch (error) {
    console.error('Error fetching quizzes:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch quizzes',
      error: error.message
    });
  }
};

// Submit quiz answers
exports.submitQuiz = async (req, res) => {
  try {
    const { quizId } = req.params;
    const { answers } = req.body;
    const userId = req.user.id;

    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }

    // Calculate score
    const score = quiz.questions.reduce((acc, question, index) => {
      return acc + (question.correctAnswer === answers[index] ? 1 : 0);
    }, 0);

    const percentage = (score / quiz.questions.length) * 100;

    // Save quiz attempt
    const attempt = {
      userId,
      answers,
      score,
      percentage,
      completedAt: new Date()
    };

    quiz.attempts.push(attempt);
    await quiz.save();

    res.status(200).json({
      success: true,
      message: 'Quiz submitted successfully',
      result: {
        score,
        total: quiz.questions.length,
        percentage,
        answers,
        questions: quiz.questions
      }
    });
  } catch (error) {
    console.error('Error submitting quiz:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit quiz',
      error: error.message
    });
  }
};

// Get quiz attempts for a user
exports.getUserQuizAttempts = async (req, res) => {
  try {
    const userId = req.user.id;
    const quizzes = await Quiz.find({
      'attempts.userId': userId
    }).select('title attempts');

    const attempts = quizzes.map(quiz => ({
      quizId: quiz._id,
      title: quiz.title,
      attempts: quiz.attempts.filter(attempt => attempt.userId.toString() === userId)
    }));

    res.status(200).json({
      success: true,
      attempts
    });
  } catch (error) {
    console.error('Error fetching quiz attempts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch quiz attempts',
      error: error.message
    });
  }
}; 