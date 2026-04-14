const DonorProfile = require('../models/DonorProfile');
const Donation = require('../models/Donation');
const Camp = require('../models/Camp');

/* ==================== GET DONOR DASHBOARD ==================== */
const getDashboard = async (req, res) => {
  try {
    const profile = await DonorProfile.findOne({ userId: req.user.id });
    const totalDonations = await Donation.countDocuments({ donorId: req.user.id });
    const lastDonation = await Donation.findOne({ donorId: req.user.id }).sort({ donationDate: -1 });
    const upcomingCamps = await Camp.countDocuments({ status: 'Upcoming' });

    /* Calculate next eligible donation date (56 days after last donation) */
    let nextEligibleDate = null;
    if (lastDonation) {
      nextEligibleDate = new Date(lastDonation.donationDate);
      nextEligibleDate.setDate(nextEligibleDate.getDate() + 56);
    }

    res.json({
      success: true,
      dashboard: {
        name: req.user.name,
        bloodGroup: profile ? profile.bloodGroup : 'Not set',
        totalDonations,
        lastDonationDate: lastDonation ? lastDonation.donationDate : null,
        nextEligibleDate,
        isAvailable: profile ? profile.isAvailable : false,
        upcomingCamps
      }
    });
  } catch (error) {
    console.error('Donor dashboard error:', error);
    res.status(500).json({ success: false, message: 'Failed to load dashboard.' });
  }
};

/* ==================== GET PROFILE ==================== */
const getProfile = async (req, res) => {
  try {
    const profile = await DonorProfile.findOne({ userId: req.user.id });
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Profile not found.' });
    }
    res.json({ success: true, profile });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to load profile.' });
  }
};

/* ==================== UPDATE PROFILE ==================== */
const updateProfile = async (req, res) => {
  try {
    const { phone, age, address, medicalConditions, isAvailable } = req.body;

    const profile = await DonorProfile.findOneAndUpdate(
      { userId: req.user.id },
      { phone, age, address, medicalConditions, isAvailable },
      { new: true, runValidators: true }
    );

    if (!profile) {
      return res.status(404).json({ success: false, message: 'Profile not found.' });
    }

    res.json({ success: true, message: 'Profile updated successfully.', profile });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ success: false, message: 'Failed to update profile.' });
  }
};

/* ==================== DONATION HISTORY ==================== */
const getDonationHistory = async (req, res) => {
  try {
    const donations = await Donation.find({ donorId: req.user.id })
      .sort({ donationDate: -1 })
      .populate('campId', 'name venue');

    res.json({ success: true, donations });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to load donation history.' });
  }
};

/* ==================== GET UPCOMING CAMPS ==================== */
const getUpcomingCamps = async (req, res) => {
  try {
    const camps = await Camp.find({ status: 'Upcoming', date: { $gte: new Date() } })
      .sort({ date: 1 });

    /* Add registration status for this donor */
    const campsWithStatus = camps.map(camp => ({
      ...camp.toObject(),
      isRegistered: camp.registeredDonors.some(
        donorId => donorId.toString() === req.user.id.toString()
      )
    }));

    res.json({ success: true, camps: campsWithStatus });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to load camps.' });
  }
};

/* ==================== REGISTER FOR CAMP ==================== */
const registerForCamp = async (req, res) => {
  try {
    const { campId } = req.params;
    const camp = await Camp.findById(campId);

    if (!camp) {
      return res.status(404).json({ success: false, message: 'Camp not found.' });
    }

    if (camp.status !== 'Upcoming') {
      return res.status(400).json({ success: false, message: 'Registration is closed for this camp.' });
    }

    if (camp.registeredDonors.includes(req.user.id)) {
      return res.status(400).json({ success: false, message: 'You are already registered for this camp.' });
    }

    if (camp.registeredDonors.length >= camp.maxParticipants) {
      return res.status(400).json({ success: false, message: 'This camp is full.' });
    }

    camp.registeredDonors.push(req.user.id);
    await camp.save();

    res.json({ success: true, message: 'Successfully registered for the camp!' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to register for camp.' });
  }
};

/* ==================== UNREGISTER FROM CAMP ==================== */
const unregisterFromCamp = async (req, res) => {
  try {
    const { campId } = req.params;
    const camp = await Camp.findById(campId);

    if (!camp) {
      return res.status(404).json({ success: false, message: 'Camp not found.' });
    }

    camp.registeredDonors = camp.registeredDonors.filter(
      donorId => donorId.toString() !== req.user.id.toString()
    );
    await camp.save();

    res.json({ success: true, message: 'Successfully unregistered from the camp.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to unregister from camp.' });
  }
};

module.exports = {
  getDashboard,
  getProfile,
  updateProfile,
  getDonationHistory,
  getUpcomingCamps,
  registerForCamp,
  unregisterFromCamp
};
