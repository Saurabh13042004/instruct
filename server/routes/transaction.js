// routes/transaction.js
const express = require("express");
const router = express.Router();
const Transaction = require("../models/Transaction");
const User = require("../models/User");
const jwt = require("jsonwebtoken");

// JWT authentication middleware
const authenticateToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token provided!" });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid token!" });
  }
};

// GET /api/transactions - Return all transactions (admin only)
router.get("/", authenticateToken, async (req, res) => {
  try {
    // Look up the user in the database to check the type
    const adminUser = await User.findById(req.user.id);
    console.log("Transaction route: Found user:", adminUser);
    if (!adminUser || adminUser.type !== "admin") {
      return res.status(403).json({ message: "Access denied." });
    }
    const transactions = await Transaction.find().sort({ createdAt: -1 });
    return res.status(200).json({
      success: true,
      count: transactions.length,
      transactions
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error fetching transactions",
      error: error.message
    });
  }
});

module.exports = router;
