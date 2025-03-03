const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true
  },
  options: [{
    type: String,
    required: true
  }],
  correctAnswer: {
    type: Number,
    required: true
  },
  hasImage: {
    type: Boolean,
    default: false
  },
  imageUrl: String
});

const quizSchema = new mongoose.Schema({
    title: {
      type: String,
      required: true
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true
    },
    subjectId: {
      type: String,
      required: true
    },
    chapterId: {
      type: String,
      required: true
    },
    duration: {
      type: Number,
      default: 1800
    },
    questions: [questionSchema],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  }, { timestamps: true });
  
module.exports = mongoose.model('Quiz', quizSchema);
