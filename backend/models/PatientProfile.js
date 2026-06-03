const mongoose = require('mongoose');

/**
 * PatientProfile – represents a patient managed by a hospital.
 * Patients are NOT independent system users; they are records under a hospital account.
 * The optional `userId` field is kept for legacy data compatibility only.
 */
const patientProfileSchema = new mongoose.Schema({
  /* Hospital that manages this patient */
  hospitalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'HospitalProfile',
    required: [true, 'Hospital ID is required']
  },
  /* Legacy: previously patients could have their own user account */
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  patientName: {
    type: String,
    required: [true, 'Patient name is required'],
    trim: true
  },
  age: {
    type: Number,
    min: [0, 'Age must be a positive number']
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other']
  },
  bloodGroup: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
    required: [true, 'Blood group is required']
  },
  phone: {
    type: String,
    trim: true,
    match: [/^[0-9]{10}$/, 'Phone number must be 10 digits']
  },
  medicalCondition: {
    type: String,
    trim: true,
    default: 'None'
  },
  unitsRequired: {
    type: Number,
    default: 1,
    min: [1, 'At least 1 unit required']
  },
  status: {
    type: String,
    enum: ['Active', 'Discharged', 'Critical'],
    default: 'Active'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('PatientProfile', patientProfileSchema);
