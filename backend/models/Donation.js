const mongoose = require('mongoose');

const donationSchema = new mongoose.Schema({
  donorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  bloodGroup: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
    required: true
  },
  units: {
    type: Number,
    required: true,
    default: 1,
    min: 1,
    max: 3
  },
  donationDate: {
    type: Date,
    default: Date.now
  },
  location: {
    type: String,
    trim: true,
    default: 'BDMS Center'
  },
  campId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Camp',
    default: null
  },
  status: {
    type: String,
    enum: ['Completed', 'Cancelled'],
    default: 'Completed'
  },
  notes: {
    type: String,
    trim: true,
    default: ''
  },
  recordedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Donation', donationSchema);
