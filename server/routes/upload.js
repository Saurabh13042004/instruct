// routes/upload.js
const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const upload = require("../utils/upload");

// JWT authentication middleware
const authenticateToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token provided" });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

// Upload endpoint that accepts a single file with key "file"
router.post("/", authenticateToken, upload.single("file"), (req, res) => {
  if (req.file) {
    // For AWS S3 uploads, multerS3 sets the URL in req.file.location;
    // for local storage, you can use req.file.path.
    const fileUrl = req.file.location || req.file.path;
    return res.status(200).json({
      success: true,
      url: fileUrl,
    });
  }
  return res.status(400).json({
    success: false,
    message: "File upload failed",
  });
});

module.exports = router;
