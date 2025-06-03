// models/Course.js
const mongoose = require("mongoose");

const chapterSchema = new mongoose.Schema({
  chapterName: { type: String, required: true },
  quizLink: { type: String },     // URL to the quiz for the chapter
  audioLink: { type: String },    // URL to the audio for the chapter
  pdfLink: { type: String },      // URL to the PDF for the chapter
  videoLink: { type: String }     // URL to the video for the chapter
});

const subjectSchema = new mongoose.Schema({
  subjectName: { type: String, required: true },
  chapters: [chapterSchema]
});

const courseSchema = new mongoose.Schema(
  {
    courseName: { type: String, required: true },
    description: { type: String, required: true },
    includedAssets: { type: [String], required: true }, // e.g. ["Free Youtube Videos", "Animative notes used", ...]
    introVideo: { type: String, required: true },         // URL of the intro video
    languages: { type: [String], required: true },          // e.g. ["English", "Hindi"]
    originalPrice: { type: Number, required: true },
    discountPrice: { type: Number, required: true },
    promocode: { type: String },
    subjects: [subjectSchema]  // nested subjects with chapters
  },
  { timestamps: true }
);

module.exports = mongoose.model("Course", courseSchema);
