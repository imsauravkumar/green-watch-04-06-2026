import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  location: {
    type: String,
    default: "Not Specified"
  },
  role: {
    type: String,
    enum: ["farmer", "seller", "both", "admin"],
    default: "farmer"
  },
  profilePhoto: {
    type: String,
    default: "default-plant" // default profile picture indicator
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  ip: {
    type: String,
    default: "Unknown"
  }
});

const User = mongoose.models.User || mongoose.model('User', userSchema);
export default User;
