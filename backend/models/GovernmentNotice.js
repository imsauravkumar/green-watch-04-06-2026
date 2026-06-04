import mongoose from 'mongoose';

const governmentNoticeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['scheme', 'advisory', 'alert', 'subsidy', 'policy', 'other'],
    default: 'other'
  },
  source: {
    type: String,
    default: 'Government of India'
  },
  postedBy: {
    type: String,
    required: true
  },
  isImportant: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const GovernmentNotice = mongoose.models.GovernmentNotice || mongoose.model('GovernmentNotice', governmentNoticeSchema);
export default GovernmentNotice;
