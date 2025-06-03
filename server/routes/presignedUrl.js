// presignedUrl.js
// import express from "express";
// import jwt from "jsonwebtoken";
// import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
// import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
const express = require("express");
const jwt = require("jsonwebtoken");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const { S3Client, GetObjectCommand } = require("@aws-sdk/client-s3");

const router = express.Router();

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

router.get("/presigned-url", authenticateToken, async (req, res) => {
  const { key } = req.query; // Expect raw key, e.g. "1739417259966-62 Sociology.pdf"
  if (!key) {
    return res.status(400).json({ message: "Key is required" });
  }

  // Create an S3 client using your AWS configuration.
  const client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  });

  // Create a GetObject command using the raw key.
  const command = new GetObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: key,
  });

  try {
    // Generate a presigned URL valid for 3600 seconds (1 hour)
    const url = await getSignedUrl(client, command, { expiresIn: 3600 });
    res.json({ url });
  } catch (err) {
    console.error("Error generating presigned URL:", err);
    res.status(500).json({ message: "Error generating presigned URL", error: err.message });
  }
});

module.exports = router;