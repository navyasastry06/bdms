const mongoose = require('mongoose');

const otpVerificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  otpCode: {
    type: String,
    required: true
  },
  expiryTime: {
    type: Date,
    required: true
  },
  verificationStatus: {
    type: String,
    enum: ['pending', 'verified'],
    default: 'pending'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('OTPVerification', otpVerificationSchema);
