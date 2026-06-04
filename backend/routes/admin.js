import express from 'express';
import { protect, adminOnly } from '../middleware/auth.js';
import { isMockDb, getMockDb, writeMockDb } from '../config/db.js';
import User from '../models/User.js';
import Product from '../models/Product.js';
import ContactMessage from '../models/ContactMessage.js';
import AdminNotification from '../models/AdminNotification.js';

const router = express.Router();

// @desc    Broadcast an admin notification
// @route   POST /api/admin/notifications
// @access  Private/Admin
router.post('/notifications', protect, adminOnly, async (req, res) => {
  const { title, message, targetGroup } = req.body;

  if (!title || !message || !targetGroup) {
    return res.status(400).json({ message: "Please fill in all fields" });
  }

  if (!["farmer", "seller", "both"].includes(targetGroup)) {
    return res.status(400).json({ message: "Invalid target group. Choose: farmer, seller, or both" });
  }

  try {
    if (isMockDb) {
      const db = getMockDb();
      const newNotification = {
        id: `notif-${Date.now()}`,
        title,
        message,
        targetGroup,
        senderName: req.user.name || "System Admin",
        createdAt: new Date().toISOString()
      };

      if (!db.notifications) db.notifications = [];
      db.notifications.push(newNotification);
      writeMockDb(db);

      return res.status(201).json(newNotification);
    } else {
      const notification = await AdminNotification.create({
        title,
        message,
        targetGroup,
        senderName: req.user.name || "System Admin"
      });

      return res.status(201).json(notification);
    }
  } catch (error) {
    console.error("Broadcast Notification Error:", error);
    res.status(500).json({ message: "Server error broadcasting notification", error: error.message });
  }
});

// @desc    Get all notifications (Private to logged-in users, filtered by role)
// @route   GET /api/admin/notifications
// @access  Private
router.get('/notifications', protect, async (req, res) => {
  const userRole = req.user.role;

  try {
    if (isMockDb) {
      const db = getMockDb();
      const list = db.notifications || [];
      
      // Admin sees all, users see "both" or matching targetGroup
      if (userRole === 'admin') {
        return res.json(list);
      } else {
        const filtered = list.filter(n => n.targetGroup === 'both' || n.targetGroup === userRole || (userRole === 'both' && ['farmer', 'seller'].includes(n.targetGroup)));
        return res.json(filtered);
      }
    } else {
      let query = {};
      if (userRole !== 'admin') {
        if (userRole === 'both') {
          query = { targetGroup: { $in: ["farmer", "seller", "both"] } };
        } else {
          query = { targetGroup: { $in: [userRole, "both"] } };
        }
      }
      const notifications = await AdminNotification.find(query).sort({ createdAt: -1 });
      return res.json(notifications);
    }
  } catch (error) {
    console.error("Fetch Notifications Error:", error);
    res.status(500).json({ message: "Server error fetching notifications", error: error.message });
  }
});

// @desc    Get system-wide stats
// @route   GET /api/admin/stats
// @access  Private/Admin
router.get('/stats', protect, adminOnly, async (req, res) => {
  try {
    if (isMockDb) {
      const db = getMockDb();
      const users = db.users || [];
      const products = db.products || [];
      const messages = db.contactMessages || [];

      const stats = {
        totalUsers: users.length,
        totalFarmers: users.filter(u => u.role === 'farmer' || u.role === 'both').length,
        totalSellers: users.filter(u => u.role === 'seller' || u.role === 'both').length,
        totalProducts: products.length,
        totalMessages: messages.length
      };

      return res.json(stats);
    } else {
      const totalUsers = await User.countDocuments({});
      const totalFarmers = await User.countDocuments({ role: { $in: ['farmer', 'both'] } });
      const totalSellers = await User.countDocuments({ role: { $in: ['seller', 'both'] } });
      const totalProducts = await Product.countDocuments({});
      const totalMessages = await ContactMessage.countDocuments({});

      const stats = {
        totalUsers,
        totalFarmers,
        totalSellers,
        totalProducts,
        totalMessages
      };

      return res.json(stats);
    }
  } catch (error) {
    console.error("Fetch Stats Error:", error);
    res.status(500).json({ message: "Server error fetching system stats", error: error.message });
  }
});

export default router;
