import express from 'express';
import { protect, adminOnly } from '../middleware/auth.js';
import { isMockDb, getMockDb, writeMockDb } from '../config/db.js';
import User from '../models/User.js';

const router = express.Router();

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
router.put('/profile', protect, async (req, res) => {
  const { name, location, profilePhoto } = req.body;
  const userId = req.user.id || req.user._id;

  try {
    if (isMockDb) {
      const db = getMockDb();
      const userIndex = db.users.findIndex(u => u.id === userId);

      if (userIndex === -1) {
        return res.status(404).json({ message: "User not found" });
      }

      if (name) db.users[userIndex].name = name;
      if (location) db.users[userIndex].location = location;
      if (profilePhoto) db.users[userIndex].profilePhoto = profilePhoto;

      writeMockDb(db);

      const updatedUser = db.users[userIndex];
      return res.json({
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        location: updatedUser.location,
        profilePhoto: updatedUser.profilePhoto
      });
    } else {
      const user = await User.findById(userId);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      if (name) user.name = name;
      if (location) user.location = location;
      if (profilePhoto) user.profilePhoto = profilePhoto;

      const updatedUser = await user.save();

      return res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        location: updatedUser.location,
        profilePhoto: updatedUser.profilePhoto
      });
    }
  } catch (error) {
    console.error("Profile Update Error:", error);
    res.status(500).json({ message: "Server error updating profile", error: error.message });
  }
});

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
router.get('/', protect, adminOnly, async (req, res) => {
  try {
    if (isMockDb) {
      const db = getMockDb();
      const usersWithoutPasswords = db.users.map(({ password, ...user }) => user);
      return res.json(usersWithoutPasswords);
    } else {
      const users = await User.find({}).select('-password');
      return res.json(users);
    }
  } catch (error) {
    console.error("Fetch Users Error:", error);
    res.status(500).json({ message: "Server error fetching users", error: error.message });
  }
});

// @desc    Delete a user
// @route   DELETE /api/users/:id
// @access  Private/Admin
router.delete('/:id', protect, adminOnly, async (req, res) => {
  const targetId = req.params.id;

  if (targetId === 'admin-id' || targetId === req.user.id || targetId === req.user._id?.toString()) {
    return res.status(400).json({ message: "Cannot delete yourself or the primary administrator" });
  }

  try {
    if (isMockDb) {
      const db = getMockDb();
      const userIndex = db.users.findIndex(u => u.id === targetId);

      if (userIndex === -1) {
        return res.status(404).json({ message: "User not found in mock DB" });
      }

      db.users.splice(userIndex, 1);
      writeMockDb(db);

      return res.json({ message: "User deleted successfully" });
    } else {
      const user = await User.findById(targetId);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      await User.findByIdAndDelete(targetId);
      return res.json({ message: "User deleted successfully" });
    }
  } catch (error) {
    console.error("Delete User Error:", error);
    res.status(500).json({ message: "Server error deleting user", error: error.message });
  }
});

export default router;
