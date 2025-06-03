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
  imageUrl: String,
  solution: {
    text: {
      type: String,
      default: ''
    },
    videoUrl: {
      type: String,
      default: ''
    },
    imageUrl: {
      type: String,
      default: ''
    }
  }
});

const sectionSchema = new mongoose.Schema({
  subjectId: {
    type: String,
    required: true
  },
  subjectName: {
    type: String,
    required: true
  },
  questions: [questionSchema],
  duration: {
    type: Number,
    required: true
  }
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
    sections: [sectionSchema],
    questions: [questionSchema],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  }, { timestamps: true });
  
module.exports = mongoose.model('Quiz', quizSchema);
