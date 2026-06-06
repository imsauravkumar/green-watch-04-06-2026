import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import User from './models/User.js';

async function test() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB!");

    // Mock req.body and req.headers
    const email = "sauravk1175@gmail.com";
    const name = "Saurav Kumar";
    const role = undefined;
    const location = undefined;
    const profilePhoto = undefined;
    const clientIp = "127.0.0.1";

    let finalRole = role || "farmer";
    if (email.toLowerCase() === "sauravk1175@gmail.com") {
      finalRole = "admin";
    }

    let user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      console.log("Creating user...");
      user = await User.create({
        email: email.toLowerCase(),
        password: "firebase_authenticated",
        name,
        location: location || "Not Specified",
        role: finalRole,
        profilePhoto: profilePhoto || "default-plant",
        ip: clientIp
      });
      console.log("Created successfully!");
    } else {
      console.log("Updating existing user...");
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
      if (user.ip !== clientIp) {
        user.ip = clientIp;
        needsSave = true;
      }
      if (needsSave) {
        await user.save();
        console.log("Updated and saved successfully!");
      } else {
        console.log("No updates needed!");
      }
    }
  } catch (error) {
    console.error("FAIL ERROR:", error);
  } finally {
    mongoose.connection.close();
  }
}

test();
