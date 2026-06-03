const BloodRequest = require('../models/BloodRequest');
const BloodInventory = require('../models/BloodInventory');
const HospitalProfile = require('../models/HospitalProfile');
const DonorProfile = require('../models/DonorProfile');
const { createNotification, notifyAdmins } = require('../services/notificationService');

/* ==================== GET HOSPITAL DASHBOARD ==================== */
const getDashboard = async (req, res) => {
  try {
    const profile = await HospitalProfile.findOne({ userId: req.user.id });
    const totalRequests = await BloodRequest.countDocuments({ requestedBy: req.user.id });
    const pendingRequests = await BloodRequest.countDocuments({ requestedBy: req.user.id, status: 'Pending' });
    const approvedRequests = await BloodRequest.countDocuments({ requestedBy: req.user.id, status: 'Approved' });
    const fulfilledRequests = await BloodRequest.countDocuments({ requestedBy: req.user.id, status: 'Fulfilled' });

    res.json({
      success: true,
      dashboard: {
        name: req.user.name,
        hospitalName: profile ? profile.hospitalName : 'Not set',
        isVerified: profile ? profile.isVerified : false,
        totalRequests,
        pendingRequests,
        approvedRequests,
        fulfilledRequests
      }
    });
  } catch (error) {
    console.error('Hospital dashboard error:', error);
    res.status(500).json({ success: false, message: 'Failed to load dashboard.' });
  }
};

/* ==================== GET HOSPITAL PROFILE ==================== */
const getProfile = async (req, res) => {
  try {
    const profile = await HospitalProfile.findOne({ userId: req.user.id });
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Profile not found.' });
    }
    res.json({ success: true, profile });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to load profile.' });
  }
};

/* ==================== UPDATE HOSPITAL PROFILE ==================== */
const updateProfile = async (req, res) => {
  try {
    const { hospitalName, phone, address, contactPerson, hospitalType } = req.body;

    if (phone) {
      const sanitizedPhone = phone.toString().replace(/\D/g, '');
      const [existingDonor, existingHospital] = await Promise.all([
        DonorProfile.findOne({ phone: sanitizedPhone }),
        HospitalProfile.findOne({ phone: sanitizedPhone })
      ]);
      const duplicateProfile = existingDonor || existingHospital;
      if (duplicateProfile && duplicateProfile.userId.toString() !== req.user.id.toString()) {
        return res.status(400).json({
          success: false,
          message: 'This phone number is already in use by another account.'
        });
      }
    }

    const profile = await HospitalProfile.findOneAndUpdate(
      { userId: req.user.id },
      { hospitalName, phone, address, contactPerson, hospitalType },
      { new: true, runValidators: true }
    );

    if (!profile) {
      return res.status(404).json({ success: false, message: 'Profile not found.' });
    }

    res.json({ success: true, message: 'Profile updated successfully.', profile });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update profile.' });
  }
};

/* ==================== SEARCH BLOOD AVAILABILITY ==================== */
const searchBlood = async (req, res) => {
  try {
    const { bloodGroup } = req.query;

    let query = {};
    if (bloodGroup) {
      query.bloodGroup = bloodGroup;
    }

    const inventory = await BloodInventory.find(query).sort({ bloodGroup: 1 });

    res.json({ success: true, inventory });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to search blood inventory.' });
  }
};

/* ==================== CREATE BLOOD REQUEST ==================== */
const createRequest = async (req, res) => {
  try {
    const { patientName, bloodGroup, unitsRequired, urgency, hospitalName, contactNumber, reason } = req.body;

    const sanitizedPhone = contactNumber ? contactNumber.toString().replace(/\D/g, '') : '';
    if (sanitizedPhone.length !== 10) {
      return res.status(400).json({ success: false, message: 'Contact number must be exactly 10 digits.' });
    }

    const profile = await HospitalProfile.findOne({ userId: req.user.id });
    const actualHospitalName = profile && profile.hospitalName ? profile.hospitalName : hospitalName;

    const request = await BloodRequest.create({
      requestedBy: req.user.id,
      patientName,
      bloodGroup,
      unitsRequired,
      urgency: urgency || 'Normal',
      hospitalName: actualHospitalName,
      contactNumber: sanitizedPhone,
      reason
    });

    // Auto-register patient profile if contact number matches an existing donor
    if (contactNumber) {
      const sanitizedPhone = contactNumber.toString().replace(/\D/g, '');
      if (sanitizedPhone) {
        const DonorProfile = require('../models/DonorProfile');
        const PatientProfile = require('../models/PatientProfile');
        const donor = await DonorProfile.findOne({ phone: sanitizedPhone });
        if (donor) {
          const existingPatient = await PatientProfile.findOne({ userId: donor.userId });
          if (!existingPatient) {
            await PatientProfile.create({
              userId: donor.userId,
              phone: sanitizedPhone,
              bloodGroup: bloodGroup || donor.bloodGroup
            });
          }
        }
      }
    }

    // Notify hospital
    await createNotification(
      req.user.id,
      'Blood Request Submitted',
      `Your request for ${unitsRequired} units of ${bloodGroup} for patient ${patientName} has been submitted and is pending approval.`,
      'info',
      'hospital'
    );

    // Notify admins
    await notifyAdmins(
      'New Blood Request Pending',
      `Hospital ${hospitalName} has submitted a ${urgency.toLowerCase()} request for ${unitsRequired} units of ${bloodGroup}.`,
      urgency === 'Critical' ? 'alert' : 'info'
    );

    res.status(201).json({
      success: true,
      message: 'Blood request created successfully.',
      request
    });
  } catch (error) {
    console.error('Create request error:', error);
    const validationMessage = error.name === 'ValidationError'
      ? Object.values(error.errors).map(err => err.message).join(', ')
      : 'Failed to create request.';
    res.status(error.name === 'ValidationError' ? 400 : 500).json({ success: false, message: validationMessage });
  }
};

/* ==================== GET MY REQUESTS ==================== */
const getMyRequests = async (req, res) => {
  try {
    const requests = await BloodRequest.find({ requestedBy: req.user.id })
      .sort({ createdAt: -1 });

    res.json({ success: true, requests });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to load requests.' });
  }
};

/* ==================== GET SINGLE REQUEST ==================== */
const getRequestById = async (req, res) => {
  try {
    const request = await BloodRequest.findOne({
      _id: req.params.id,
      requestedBy: req.user.id
    });

    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found.' });
    }

    res.json({ success: true, request });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to load request.' });
  }
};

module.exports = {
  getDashboard,
  getProfile,
  updateProfile,
  searchBlood,
  createRequest,
  getMyRequests,
  getRequestById
};
