const BloodRequest = require('../models/BloodRequest');
const BloodInventory = require('../models/BloodInventory');
const HospitalProfile = require('../models/HospitalProfile');

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

    const request = await BloodRequest.create({
      requestedBy: req.user.id,
      patientName,
      bloodGroup,
      unitsRequired,
      urgency: urgency || 'Normal',
      hospitalName,
      contactNumber,
      reason
    });

    res.status(201).json({
      success: true,
      message: 'Blood request created successfully.',
      request
    });
  } catch (error) {
    console.error('Create request error:', error);
    res.status(500).json({ success: false, message: 'Failed to create request.' });
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
