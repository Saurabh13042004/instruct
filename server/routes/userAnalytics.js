const express = require('express');
const router = express.Router();
const User = require('../models/User');
const UserActivity = require('../models/UserActivity');
const jwt = require('jsonwebtoken');

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

// Helper function to check admin role
const checkAdminRole = (req, res, next) => {
  if (!req.user) return res.status(401).json({ message: "Not authenticated!" });
  
  User.findById(req.user.id)
    .then(user => {
      if (!user || user.type !== 'admin') {
        return res.status(403).json({ message: "Not authorized!" });
      }
      next();
    })
    .catch(err => res.status(500).json({ message: "Error checking user role" }));
};

// Helper function to get date ranges
const getDateRange = (period) => {
  const now = new Date();
  switch (period) {
    case 'daily':
      return {
        start: new Date(now.setHours(0, 0, 0, 0)),
        end: new Date(now.setHours(23, 59, 59, 999))
      };
    case 'weekly':
      return {
        start: new Date(now.setDate(now.getDate() - 7)),
        end: new Date()
      };
    case 'monthly':
      return {
        start: new Date(now.setMonth(now.getMonth() - 1)),
        end: new Date()
      };
    default:
      return {
        start: new Date(now.setHours(0, 0, 0, 0)),
        end: new Date(now.setHours(23, 59, 59, 999))
      };
  }
};

// Get DAU, WAU, MAU counts with detailed user information
router.get('/active-users', authenticateToken, checkAdminRole, async (req, res) => {
  try {
    const { period } = req.query;
    const { start, end } = getDateRange(period);

    const activeUsers = await UserActivity.aggregate([
      {
        $match: {
          timestamp: { $gte: start, $lte: end }
        }
      },
      {
        $group: {
          _id: '$userId',
          lastActivity: { $max: '$timestamp' },
          activityCount: { $sum: 1 },
          activities: { $push: { action: '$action', timestamp: '$timestamp', details: '$details' } }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'userDetails'
        }
      },
      {
        $unwind: '$userDetails'
      },
      {
        $project: {
          userId: '$_id',
          email: '$userDetails.email',
          firstName: '$userDetails.firstName',
          lastName: '$userDetails.lastName',
          phoneNumber: '$userDetails.phoneNumber',
          type: '$userDetails.type',
          lastActive: '$userDetails.lastActive',
          isBlocked: '$userDetails.isBlocked',
          blockType: '$userDetails.blockType',
          blockEndDate: '$userDetails.blockEndDate',
          lastActivity: 1,
          activityCount: 1,
          activities: 1
        }
      },
      {
        $sort: { lastActivity: -1 }
      }
    ]);

    // Calculate activity metrics
    const metrics = {
      total: activeUsers.length,
      byType: activeUsers.reduce((acc, user) => {
        acc[user.type] = (acc[user.type] || 0) + 1;
        return acc;
      }, {}),
      byActivity: activeUsers.reduce((acc, user) => {
        user.activities.forEach(activity => {
          acc[activity.action] = (acc[activity.action] || 0) + 1;
        });
        return acc;
      }, {})
    };

    res.json({
      success: true,
      period,
      metrics,
      count: activeUsers.length,
      users: activeUsers
    });
  } catch (error) {
    console.error('Error fetching active users:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching active users'
    });
  }
});

// Get detailed user activity
router.get('/user-activity/:userId', authenticateToken, checkAdminRole, async (req, res) => {
  try {
    const { userId } = req.params;
    const { startDate, endDate } = req.query;

    const query = { userId };
    if (startDate && endDate) {
      query.timestamp = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const activities = await UserActivity.find(query)
      .sort({ timestamp: -1 })
      .limit(100);

    const user = await User.findById(userId).select('firstName lastName email role');

    res.json({
      success: true,
      user,
      activities
    });
  } catch (error) {
    console.error('Error fetching user activity:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user activity'
    });
  }
});

// Get user activity trends
router.get('/activity-trends', authenticateToken, checkAdminRole, async (req, res) => {
  try {
    const { period } = req.query;
    const { start, end } = getDateRange(period);

    const trends = await UserActivity.aggregate([
      {
        $match: {
          timestamp: { $gte: start, $lte: end }
        }
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.date': 1 }
      }
    ]);

    res.json({
      success: true,
      trends
    });
  } catch (error) {
    console.error('Error fetching activity trends:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching activity trends'
    });
  }
});

module.exports = router; 