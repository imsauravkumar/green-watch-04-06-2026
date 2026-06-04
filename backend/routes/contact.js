import express from 'express';
import { protect, adminOnly } from '../middleware/auth.js';
import { isMockDb, getMockDb, writeMockDb } from '../config/db.js';
import ContactMessage from '../models/ContactMessage.js';

const router = express.Router();

// @desc    Submit a contact message
// @route   POST /api/contact
// @access  Public
router.post('/', async (req, res) => {
  const { name, email, subject, message } = req.body;

  if (!name || !email || !subject || !message) {
    return res.status(400).json({ message: "Please fill in all fields" });
  }

  try {
    if (isMockDb) {
      const db = getMockDb();
      const newMessage = {
        id: `msg-${Date.now()}`,
        name,
        email: email.toLowerCase(),
        subject,
        message,
        createdAt: new Date().toISOString()
      };

      if (!db.contactMessages) db.contactMessages = [];
      db.contactMessages.push(newMessage);
      writeMockDb(db);

      return res.status(201).json({ message: "Message submitted successfully!" });
    } else {
      await ContactMessage.create({
        name,
        email: email.toLowerCase(),
        subject,
        message
      });

      return res.status(201).json({ message: "Message submitted successfully!" });
    }
  } catch (error) {
    console.error("Submit Message Error:", error);
    res.status(500).json({ message: "Server error submitting message", error: error.message });
  }
});

// @desc    Get all contact messages (Admin only)
// @route   GET /api/contact
// @access  Private/Admin
router.get('/', protect, adminOnly, async (req, res) => {
  try {
    if (isMockDb) {
      const db = getMockDb();
      return res.json(db.contactMessages || []);
    } else {
      const messages = await ContactMessage.find({}).sort({ createdAt: -1 });
      return res.json(messages);
    }
  } catch (error) {
    console.error("Fetch Messages Error:", error);
    res.status(500).json({ message: "Server error fetching messages", error: error.message });
  }
});

export default router;
