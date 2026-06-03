const mongoose = require('mongoose');

const donorProfileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  bloodGroup: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
    required: [true, 'Blood group is required']
  },
  age: {
    type: Number,
    min: [18, 'Must be at least 18 years old'],
    max: [60, 'Must be 60 or younger']
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other']
  },
  eligibilityStatus: {
    type: String,
    enum: ['Eligible', 'Ineligible'],
    default: 'Eligible'
  },
  phone: {
    type: String,
    trim: true,
    match: [/^[0-9]{10}$/, 'Phone number must be 10 digits']
  },
  address: {
    street: { type: String, trim: true },
    city: { type: String, trim: true },
    state: { type: String, trim: true },
    pincode: { type: String, trim: true }
  },
  lastDonationDate: {
    type: Date,
    default: null
  },
  totalDonations: {
    type: Number,
    default: 0
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  medicalConditions: {
    type: String,
    default: 'None'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('DonorProfile', donorProfileSchema);
