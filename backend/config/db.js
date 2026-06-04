import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';

export let isMockDb = false;

const MOCK_DB_PATH = path.resolve('db.json');

export const initializeMockDb = () => {
  if (!fs.existsSync(MOCK_DB_PATH)) {
    const initialData = {
      users: [
        {
          id: "admin-id",
          email: "sauravk1175@gmail.com",
          password: "$2b$10$tckrQMpf6bBdZuHuyGvXSOPiddNw3KvBfHoBSRNhFG36VuKTXyiLy", // bcrypt for admin@123
          name: "Saurav Kumar (Admin)",
          location: "Headquarters",
          role: "admin",
          profilePhoto: "default-plant",
          createdAt: new Date().toISOString()
        }
      ],
      products: [],
      contactMessages: [],
      communityPosts: [],
      notifications: []
    };
    fs.writeFileSync(MOCK_DB_PATH, JSON.stringify(initialData, null, 2));
    console.log("📁 Mock database initialized at db.json");
  } else {
    // Check if admin exists, if not, add
    const data = JSON.parse(fs.readFileSync(MOCK_DB_PATH, 'utf8'));
    const adminExists = data.users.find(u => u.email === "sauravk1175@gmail.com");
    if (!adminExists) {
      data.users.push({
        id: "admin-id",
        email: "sauravk1175@gmail.com",
        password: "$2b$10$tckrQMpf6bBdZuHuyGvXSOPiddNw3KvBfHoBSRNhFG36VuKTXyiLy", // admin@123
        name: "Saurav Kumar (Admin)",
        location: "Headquarters",
        role: "admin",
        profilePhoto: "default-plant",
        createdAt: new Date().toISOString()
      });
      fs.writeFileSync(MOCK_DB_PATH, JSON.stringify(data, null, 2));
    }
  }
};

export const connectDB = async () => {
  if (!process.env.MONGO_URI || process.env.MONGO_URI.trim() === "") {
    console.warn("⚠️ MONGO_URI not found in env. Falling back to local file-based database (db.json).");
    isMockDb = true;
    initializeMockDb();
    return;
  }

  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`📡 MongoDB Connected: ${conn.connection.host}`);

    // Programmatically drop the stale unique index on firebaseUid if it exists
    try {
      const db = conn.connection.db;
      const collections = await db.listCollections({ name: 'users' }).toArray();
      if (collections.length > 0) {
        const indexes = await db.collection('users').indexes();
        const hasFirebaseUidIndex = indexes.some(idx => idx.name === 'firebaseUid_1' || (idx.key && idx.key.firebaseUid));
        if (hasFirebaseUidIndex) {
          const indexName = indexes.find(idx => idx.name === 'firebaseUid_1' || (idx.key && idx.key.firebaseUid)).name;
          await db.collection('users').dropIndex(indexName);
          console.log(`🧹 Successfully dropped stale unique index '${indexName}' from users collection.`);
        }
      }
    } catch (indexErr) {
      console.warn("⚠️ Could not check/drop index 'firebaseUid_1':", indexErr.message);
    }
    
    // Ensure admin exists with correct role and password in MongoDB
    const adminEmail = "sauravk1175@gmail.com";
    const adminExists = await User.findOne({ email: adminEmail });
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash("admin@123", 10);
      await User.create({
        email: adminEmail,
        password: hashedPassword,
        name: "Saurav Kumar (Admin)",
        location: "Headquarters",
        role: "admin",
        profilePhoto: "default-plant"
      });
      console.log("👤 Default admin user seeded in MongoDB.");
    } else {
      let needsSave = false;
      // Always enforce admin role
      if (adminExists.role !== "admin") {
        adminExists.role = "admin";
        needsSave = true;
        console.log("🔧 Admin role corrected in MongoDB.");
      }
      // Sync password if wrong
      const isCorrect = await bcrypt.compare("admin@123", adminExists.password);
      if (!isCorrect) {
        adminExists.password = await bcrypt.hash("admin@123", 10);
        needsSave = true;
        console.log("👤 Default admin user password synchronized in MongoDB.");
      }
      if (needsSave) await adminExists.save();
    }
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    console.warn("⚠️ Falling back to local file-based database (db.json).");
    isMockDb = true;
    initializeMockDb();
  }
};

export const getMockDb = () => {
  if (!fs.existsSync(MOCK_DB_PATH)) initializeMockDb();
  return JSON.parse(fs.readFileSync(MOCK_DB_PATH, 'utf8'));
};

export const writeMockDb = (data) => {
  fs.writeFileSync(MOCK_DB_PATH, JSON.stringify(data, null, 2));
};
