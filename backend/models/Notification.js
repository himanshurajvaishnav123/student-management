/**
 * NOTIFICATION MODEL
 * Stores in-app notifications for students and admins.
 */

const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'recipientModel',
  },
  recipientModel: {
    type: String,
    required: true,
    enum: ['Student', 'Admin'],
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: {
    type: String,
    enum: ['attendance', 'marks', 'fees', 'general', 'warning'],
    default: 'general',
  },
  isRead: { type: Boolean, default: false },
  icon: { type: String, default: '📢' },
}, { timestamps: true });

module.exports = mongoose.model('Notification', NotificationSchema);
