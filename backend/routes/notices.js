import express from 'express';
import { protect, adminOnly } from '../middleware/auth.js';
import { isMockDb, getMockDb, writeMockDb } from '../config/db.js';
import GovernmentNotice from '../models/GovernmentNotice.js';

const router = express.Router();

// @desc    Get all government notices (visible to all logged-in users)
// @route   GET /api/notices
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    if (isMockDb) {
      const db = getMockDb();
      const notices = (db.governmentNotices || []).sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
      return res.json(notices);
    } else {
      const notices = await GovernmentNotice.find({}).sort({ createdAt: -1 });
      return res.json(notices);
    }
  } catch (error) {
    console.error('Fetch Notices Error:', error);
    res.status(500).json({ message: 'Server error fetching notices', error: error.message });
  }
});

// @desc    Create a government notice (admin only)
// @route   POST /api/notices
// @access  Private/Admin
router.post('/', protect, adminOnly, async (req, res) => {
  const { title, content, category, source, isImportant } = req.body;

  if (!title || !content) {
    return res.status(400).json({ message: 'Title and content are required' });
  }

  try {
    if (isMockDb) {
      const db = getMockDb();
      const newNotice = {
        id: `notice-${Date.now()}`,
        title,
        content,
        category: category || 'other',
        source: source || 'Government of India',
        isImportant: isImportant || false,
        postedBy: req.user.name || 'Admin',
        createdAt: new Date().toISOString()
      };
      if (!db.governmentNotices) db.governmentNotices = [];
      db.governmentNotices.unshift(newNotice);
      writeMockDb(db);
      return res.status(201).json(newNotice);
    } else {
      const notice = await GovernmentNotice.create({
        title,
        content,
        category: category || 'other',
        source: source || 'Government of India',
        isImportant: isImportant || false,
        postedBy: req.user.name || 'Admin'
      });
      return res.status(201).json(notice);
    }
  } catch (error) {
    console.error('Create Notice Error:', error);
    res.status(500).json({ message: 'Server error creating notice', error: error.message });
  }
});

// @desc    Delete a government notice (admin only)
// @route   DELETE /api/notices/:id
// @access  Private/Admin
router.delete('/:id', protect, adminOnly, async (req, res) => {
  const noticeId = req.params.id;

  try {
    if (isMockDb) {
      const db = getMockDb();
      const idx = (db.governmentNotices || []).findIndex(n => n.id === noticeId);
      if (idx === -1) return res.status(404).json({ message: 'Notice not found' });
      db.governmentNotices.splice(idx, 1);
      writeMockDb(db);
      return res.json({ message: 'Notice deleted successfully' });
    } else {
      const notice = await GovernmentNotice.findById(noticeId);
      if (!notice) return res.status(404).json({ message: 'Notice not found' });
      await GovernmentNotice.findByIdAndDelete(noticeId);
      return res.json({ message: 'Notice deleted successfully' });
    }
  } catch (error) {
    console.error('Delete Notice Error:', error);
    res.status(500).json({ message: 'Server error deleting notice', error: error.message });
  }
});

export default router;
