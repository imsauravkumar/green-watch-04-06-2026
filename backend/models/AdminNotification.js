import mongoose from 'mongoose';

const adminNotificationSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  targetGroup: {
    type: String,
    enum: ["farmer", "seller", "both"],
    default: "both"
  },
  senderName: {
    type: String,
    default: "System Admin"
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const AdminNotification = mongoose.models.AdminNotification || mongoose.model('AdminNotification', adminNotificationSchema);
export default AdminNotification;
