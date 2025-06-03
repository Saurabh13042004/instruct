// routes/payment.js
const express = require('express');
const router = express.Router();
const Razorpay = require("razorpay");
const crypto = require("crypto");
const Course = require('../models/Course');
const User = require('../models/User');
const Transaction = require("../models/Transaction");
const jwt = require("jsonwebtoken");
const { sendMail } = require("../utils/mailer"); // Ensure you have a mailer utility
const UserActivity = require("../models/UserActivity");
const PromoCode = require("../models/PromoCode");

// JWT authentication middleware
const authenticateToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "No token provided!" });
  }
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid token!" });
  }
};

// Create a Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// Create Razorpay order
router.post("/create-order", authenticateToken, async (req, res) => {
    try {
        const { courseId, promocode } = req.body;

        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({
                success: false,
                message: "Course not found"
            });
        }

        let amount = course.discountPrice;
        let appliedPromocode = null;

        // Apply promocode if provided
        if (promocode) {
            const promoResult = await PromoCode.findOne({
                code: promocode.toUpperCase(),
                courseId,
                isActive: true,
                validFrom: { $lte: new Date() },
                validUntil: { $gte: new Date() }
            });

            if (promoResult && promoResult.usedCount < promoResult.usageLimit) {
                amount = Math.round(course.discountPrice * (1 - promoResult.discountPercentage / 100));
                appliedPromocode = promoResult._id;
            }
        }

        const options = {
            amount: amount * 100, // Razorpay expects amount in paise
            currency: "INR",
            receipt: `receipt_${Date.now()}`,
            notes: {
                courseId: courseId,
                userId: req.user._id,
                promocodeId: appliedPromocode
            }
        };

        const order = await razorpay.orders.create(options);

        res.status(200).json({
            success: true,
            order,
            amount,
            appliedPromocode
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error creating order",
            error: error.message
        });
    }
});

// Verify payment and update course access
router.post("/verify", authenticateToken, async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, courseId, promocodeId } = req.body;

        // Verify payment signature
        const body = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest("hex");

        if (expectedSignature !== razorpay_signature) {
            return res.status(400).json({
                success: false,
                message: "Invalid payment signature"
            });
        }

        // Get the course details
        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({
                success: false,
                message: "Course not found"
            });
        }

        // Update promocode usage if applied
        if (promocodeId) {
            await PromoCode.findByIdAndUpdate(promocodeId, {
                $inc: { usedCount: 1 }
            });
        }

        // Create transaction record
        await Transaction.create({
            user: req.user.id,
            course: courseId,
            amount: course.discountPrice * 100, // Store in paise
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            currency: "INR",
            status: "completed"
        });

        // Update user's course access
        await User.findByIdAndUpdate(req.user.id, {
            $addToSet: { purchasedCourses: courseId }
        });

        res.status(200).json({
            success: true,
            message: "Payment verified successfully"
        });
    } catch (error) {
        console.error("Payment verification error:", error);
        res.status(500).json({
            success: false,
            message: "Error verifying payment",
            error: error.message
        });
    }
});

module.exports = router;
  