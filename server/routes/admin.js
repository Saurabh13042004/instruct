const jwt = require("jsonwebtoken");
const express = require('express');
const Course = require('../models/Course')
const User = require('../models/User')
const bcrypt = require("bcrypt");
const Transaction = require("../models/Transaction");


const router = express.Router();

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



const checkAdminRole = (allowedRoles) => {
    return async (req, res, next) => {
        try {
            const user = await User.findById(req.user.id);
            
            if (!user) {
                return res.status(404).json({ message: "User not found!" });
            }
            
            if (user.type !== 'admin') {
                return res.status(403).json({
                    success: false,
                    message: "Access denied. Admin privileges required."
                });
            }
            
            // If no specific roles are required or user is Super Admin, allow access
            if (!allowedRoles || allowedRoles.length === 0 || user.adminRole === "Super Admin") {
                return next();
            }
            
            // Check if user's role is in the allowed roles
            if (allowedRoles.includes(user.adminRole)) {
                return next();
            }
            
            return res.status(403).json({
                success: false,
                message: "Access denied. You don't have the required role for this action."
            });
        } catch (error) {
            return res.status(500).json({ message: "Server error", error: error.message });
        }
    };
};

router.get('/stats', authenticateToken, checkAdminRole([]), async (req, res) => {
    try {
        const userCount = await User.countDocuments();
        const courseCount = await Course.countDocuments();
        const transactionCount = await Transaction.countDocuments();
        
        // Get active user metrics
        const now = new Date();
        const oneDayAgo = new Date(now - 24 * 60 * 60 * 1000);
        const oneWeekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
        const oneMonthAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);
        
        const dau = await User.countDocuments({ lastActive: { $gte: oneDayAgo } });
        const wau = await User.countDocuments({ lastActive: { $gte: oneWeekAgo } });
        const mau = await User.countDocuments({ lastActive: { $gte: oneMonthAgo } });

        return res.status(200).json({ 
            userCount, 
            courseCount, 
            transactionCount,
            activeUsers: {
                daily: dau,
                weekly: wau,
                monthly: mau
            }
        });
    } catch (error) {
        console.error("Error in /stats endpoint:", error);
        return res.status(500).json({ message: "Server error", error: error.message });
    }
});

router.post("/createAdmin", authenticateToken, checkAdminRole(["Super Admin"]), async (req, res) => {
    try {
        const { firstName, lastName, email, password, phoneNumber, adminRole } = req.body;

        // Validate admin role
        const validRoles = ["Super Admin", "Content Admin", "UMAA Admin", "Financial Admin"];
        if (!validRoles.includes(adminRole)) {
            return res.status(400).json({ 
                success: false,
                message: "Invalid admin role" 
            });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({ 
            firstName, 
            lastName, 
            email, 
            password: hashedPassword, 
            phoneNumber,
            type: "admin",
            adminRole,
            is_verified: true // Auto-verify admin accounts
        });
        
        await newUser.save();

        res.status(201).json({ 
            success: true,
            message: "Admin registered successfully!" 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            error: error.message 
        });
    }
});


router.get("/users", authenticateToken, checkAdminRole(["Super Admin", "UMAA Admin"]), async (req, res) => {
    try {
        const { search, sortBy, sortOrder } = req.query;
        
        let query = {};
        if (search) {
            query = {
                $or: [
                    { firstName: { $regex: search, $options: 'i' } },
                    { lastName: { $regex: search, $options: 'i' } },
                    { email: { $regex: search, $options: 'i' } },
                    { phoneNumber: { $regex: search, $options: 'i' } }
                ]
            };
        }
        
        let sort = {};
        if (sortBy) {
            sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
        } else {
            sort = { createdAt: -1 }; // Default sort by creation date
        }
        
        const users = await User.find(query)
            .select('firstName lastName email phoneNumber dateOfBirth createdAt purchasedCourses isBlocked blockType blockEndDate lastActive')
            .sort(sort);
            
        res.status(200).json({
            success: true,
            users
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching users",
            error: error.message
        });
    }
});
// Get user details with activity metrics
router.get("/users/:userId", authenticateToken, checkAdminRole(["Super Admin", "UMAA Admin"]), async (req, res) => {
    try {
        const user = await User.findById(req.params.userId)
            .select('-password -otp -otpExpiry')
            .populate('purchasedCourses', 'courseName');
            
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }
        
        // Calculate activity metrics
        const now = new Date();
        const oneDayAgo = new Date(now - 24 * 60 * 60 * 1000);
        const oneWeekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
        const oneMonthAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);
        
        // Get daily activities
        const dailyActivities = user.activityLog.filter(
            activity => new Date(activity.timestamp) >= oneDayAgo
        );
        
        // Get weekly activities
        const weeklyActivities = user.activityLog.filter(
            activity => new Date(activity.timestamp) >= oneWeekAgo
        );
        
        // Get monthly activities
        const monthlyActivities = user.activityLog.filter(
            activity => new Date(activity.timestamp) >= oneMonthAgo
        );
        
        res.status(200).json({
            success: true,
            user,
            activityMetrics: {
                daily: dailyActivities.length > 0,
                weekly: weeklyActivities.length > 0,
                monthly: monthlyActivities.length > 0,
                dailyCount: dailyActivities.length,
                weeklyCount: weeklyActivities.length,
                monthlyCount: monthlyActivities.length
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching user details",
            error: error.message
        });
    }
});

// Block/Unblock user
router.put("/users/:userId/block", authenticateToken, checkAdminRole(["Super Admin", "UMAA Admin"]), async (req, res) => {
    try {
        const { blockType, blockDuration } = req.body;
        const userId = req.params.userId;
        
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }
        
        if (blockType === "none") {
            // Unblock user
            user.isBlocked = false;
            user.blockType = null;
            user.blockEndDate = null;
        } else if (blockType === "temporary") {
            // Temporarily block user
            user.isBlocked = true;
            user.blockType = "temporary";
            // Set block end date based on duration (in days)
            const endDate = new Date();
            endDate.setDate(endDate.getDate() + parseInt(blockDuration || 7));
            user.blockEndDate = endDate;
        } else if (blockType === "permanent") {
            // Permanently block user
            user.isBlocked = true;
            user.blockType = "permanent";
            user.blockEndDate = null;
        } else {
            return res.status(400).json({
                success: false,
                message: "Invalid block type"
            });
        }
        
        await user.save();
        
        res.status(200).json({
            success: true,
            message: blockType === "none" ? "User unblocked successfully" : `User ${blockType}ly blocked successfully`,
            user: {
                id: user._id,
                isBlocked: user.isBlocked,
                blockType: user.blockType,
                blockEndDate: user.blockEndDate
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error updating user block status",
            error: error.message
        });
    }
});

// Track user activity
router.post("/track-activity", async (req, res) => {
    try {
        const { userId, activityType, courseId } = req.body;
        
        if (!["video", "audio", "pdf", "quiz"].includes(activityType)) {
            return res.status(400).json({
                success: false,
                message: "Invalid activity type"
            });
        }
        
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }
        
        // Update last active timestamp
        user.lastActive = new Date();
        
        // Add to activity log
        user.activityLog.push({
            activityType,
            courseId,
            timestamp: new Date()
        });
        
        // Limit activity log size to prevent it from growing too large
        if (user.activityLog.length > 100) {
            user.activityLog = user.activityLog.slice(-100);
        }
        
        await user.save();
        
        res.status(200).json({
            success: true,
            message: "Activity tracked successfully"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error tracking activity",
            error: error.message
        });
    }
});
// Get transaction data (for Financial Admin and Super Admin)
router.get("/transactions", authenticateToken, checkAdminRole(["Super Admin", "Financial Admin"]), async (req, res) => {
    try {
        const transactions = await Transaction.find()
            .populate('user', 'firstName lastName email')
            .populate('course', 'courseName')
            .sort({ createdAt: -1 });
            
        res.status(200).json({
            success: true,
            transactions
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching transactions",
            error: error.message
        });
    }
});
module.exports = router;