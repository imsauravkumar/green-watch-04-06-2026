import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { isMockDb, getMockDb, writeMockDb } from '../config/db.js';
import User from '../models/User.js';

const router = express.Router();

const generateToken = (id, email, role) => {
  const secret = process.env.JWT_SECRET || 'greenwatch_dev_jwt_secret_key_12345_super_secure';
  return jwt.sign({ id, email, role }, secret, { expiresIn: '30d' });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
router.post('/register', async (req, res) => {
  const { email, password, name, location, role } = req.body;

  if (!email || !password || !name || !role) {
    return res.status(400).json({ message: "Please fill in all required fields" });
  }

  // Normalize role
  let finalRole = role.toLowerCase();
  if (!["farmer", "seller", "both"].includes(finalRole)) {
    finalRole = "farmer";
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    if (isMockDb) {
      const db = getMockDb();
      const userExists = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());

      if (userExists) {
        return res.status(400).json({ message: "User already exists with this email" });
      }

      const newUser = {
        id: `mock-user-${Date.now()}`,
        email: email.toLowerCase(),
        password: hashedPassword,
        name,
        location: location || "Not Specified",
        role: finalRole,
        profilePhoto: "default-plant",
        createdAt: new Date().toISOString()
      };

      db.users.push(newUser);
      writeMockDb(db);

      return res.status(201).json({
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        location: newUser.location,
        profilePhoto: newUser.profilePhoto,
        token: generateToken(newUser.id, newUser.email, newUser.role)
      });
    } else {
      const userExists = await User.findOne({ email: email.toLowerCase() });
      if (userExists) {
        return res.status(400).json({ message: "User already exists with this email" });
      }

      const user = await User.create({
        email: email.toLowerCase(),
        password: hashedPassword,
        name,
        location: location || "Not Specified",
        role: finalRole,
        profilePhoto: "default-plant"
      });

      return res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        location: user.location,
        profilePhoto: user.profilePhoto,
        token: generateToken(user._id, user.email, user.role)
      });
    }
  } catch (error) {
    console.error("Register Error:", error);
    res.status(500).json({ message: "Server error during registration", error: error.message });
  }
});

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Please enter email and password" });
  }

  try {
    if (isMockDb) {
      const db = getMockDb();
      const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());

      if (user && (await bcrypt.compare(password, user.password))) {
        return res.json({
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          location: user.location,
          profilePhoto: user.profilePhoto,
          token: generateToken(user.id, user.email, user.role)
        });
      } else {
        return res.status(401).json({ message: "Invalid email or password" });
      }
    } else {
      const user = await User.findOne({ email: email.toLowerCase() });

      if (user && (await bcrypt.compare(password, user.password))) {
        return res.json({
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          location: user.location,
          profilePhoto: user.profilePhoto,
          token: generateToken(user._id, user.email, user.role)
        });
      } else {
        return res.status(401).json({ message: "Invalid email or password" });
      }
    }
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: "Server error during login", error: error.message });
  }
});

// @desc    Sync Firebase Auth account with backend
// @route   POST /api/auth/sync-firebase
// @access  Public
router.post('/sync-firebase', async (req, res) => {
  const { email, name, role, location, profilePhoto } = req.body;

  if (!email || !name) {
    return res.status(400).json({ message: "Missing email or name for synchronization" });
  }

  // Pre-configured Admin Override Check
  let finalRole = role || "farmer";
  if (email.toLowerCase() === "sauravk1175@gmail.com") {
    finalRole = "admin";
  }

  try {
    if (isMockDb) {
      const db = getMockDb();
      let user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());

      if (!user) {
        user = {
          id: `firebase-${Date.now()}`,
          email: email.toLowerCase(),
          password: "firebase_authenticated", // Firebase manages password, this is just a placeholder
          name,
          location: location || "Not Specified",
          role: finalRole,
          profilePhoto: profilePhoto || "default-plant",
          createdAt: new Date().toISOString()
        };
        db.users.push(user);
        writeMockDb(db);
      } else {
        // Update user properties if provided
        if (role) user.role = role;
        if (email.toLowerCase() === "sauravk1175@gmail.com") user.role = "admin";
        if (location) user.location = location;
        if (profilePhoto) user.profilePhoto = profilePhoto;
        if (name) user.name = name;
        writeMockDb(db);
      }

      return res.status(200).json({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        location: user.location,
        profilePhoto: user.profilePhoto,
        token: generateToken(user.id, user.email, user.role)
      });
    } else {
      let user = await User.findOne({ email: email.toLowerCase() });

      if (!user) {
        user = await User.create({
          email: email.toLowerCase(),
          password: "firebase_authenticated",
          name,
          location: location || "Not Specified",
          role: finalRole,
          profilePhoto: profilePhoto || "default-plant"
        });
      } else {
        // Update existing user model properties
        let needsSave = false;
        if (role && user.role !== role) {
          user.role = role;
          needsSave = true;
        }
        if (email.toLowerCase() === "sauravk1175@gmail.com" && user.role !== "admin") {
          user.role = "admin";
          needsSave = true;
        }
        if (location && user.location !== location) {
          user.location = location;
          needsSave = true;
        }
        if (profilePhoto && user.profilePhoto !== profilePhoto) {
          user.profilePhoto = profilePhoto;
          needsSave = true;
        }
        if (name && user.name !== name) {
          user.name = name;
          needsSave = true;
        }
        if (needsSave) {
          await user.save();
        }
      }

      return res.status(200).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        location: user.location,
        profilePhoto: user.profilePhoto,
        token: generateToken(user._id, user.email, user.role)
      });
    }
  } catch (error) {
    console.error("Firebase Sync Error:", error);
    res.status(500).json({ message: "Server error during sync", error: error.message });
  }
});

export default router;
