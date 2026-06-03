const DonorProfile = require('../models/DonorProfile');
const HospitalProfile = require('../models/HospitalProfile');
const Donation = require('../models/Donation');
const Camp = require('../models/Camp');
const { createNotification } = require('../services/notificationService');

/* ==================== GET DONOR DASHBOARD ==================== */
const getDashboard = async (req, res) => {
  try {
    const profile = await DonorProfile.findOne({ userId: req.user.id });
    const totalDonations = await Donation.countDocuments({ donorId: req.user.id });
    const lastDonation = await Donation.findOne({ donorId: req.user.id }).sort({ donationDate: -1 });
    const upcomingCamps = await Camp.countDocuments({ status: 'Upcoming' });

    /* Calculate next eligible donation date (60 days after last donation) and verify eligibility */
    let nextEligibleDate = null;
    let eligibilityStatus = 'Eligible';

    if (profile) {
      if (profile.age && (profile.age < 18 || profile.age > 60)) {
        eligibilityStatus = 'Ineligible';
      }

      if (lastDonation) {
        nextEligibleDate = new Date(lastDonation.donationDate);
        nextEligibleDate.setDate(nextEligibleDate.getDate() + 60);
        
        if (new Date() < nextEligibleDate) {
          eligibilityStatus = 'Ineligible';
        }
      }

      if (profile.eligibilityStatus !== eligibilityStatus) {
        profile.eligibilityStatus = eligibilityStatus;
        await profile.save();
      }
    }

    res.json({
      success: true,
      dashboard: {
        name: req.user.name,
        bloodGroup: profile ? profile.bloodGroup : 'Not set',
        totalDonations,
        lastDonationDate: lastDonation ? lastDonation.donationDate : null,
        nextEligibleDate,
        eligibilityStatus: profile ? profile.eligibilityStatus : eligibilityStatus,
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
    const { phone, age, gender, address, medicalConditions, isAvailable } = req.body;

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

    let eligibilityStatus = 'Eligible';
    if (age && (age < 18 || age > 60)) {
      eligibilityStatus = 'Ineligible';
    } else {
      const lastDonation = await Donation.findOne({ donorId: req.user.id }).sort({ donationDate: -1 });
      if (lastDonation) {
        const nextEligibleDate = new Date(lastDonation.donationDate);
        nextEligibleDate.setDate(nextEligibleDate.getDate() + 60);
        if (new Date() < nextEligibleDate) {
          eligibilityStatus = 'Ineligible';
        }
      }
    }

    const profile = await DonorProfile.findOneAndUpdate(
      { userId: req.user.id },
      { phone, age, gender, eligibilityStatus, address, medicalConditions, isAvailable },
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
    // Include camps scheduled for today (start of day) so same-day camps are visible
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const camps = await Camp.find({ status: 'Upcoming', date: { $gte: todayStart } })
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

    // 1. Check completed donations (must be 60 days apart from this camp)
    const lastDonation = await Donation.findOne({ donorId: req.user.id, status: 'Completed' }).sort({ donationDate: -1 });
    const campDate = new Date(camp.date);
    
    if (lastDonation) {
      const nextEligibleDate = new Date(lastDonation.donationDate);
      nextEligibleDate.setDate(nextEligibleDate.getDate() + 60);
      
      if (campDate < nextEligibleDate) {
        return res.status(400).json({
          success: false,
          message: `You are not eligible to donate on this camp's date. You will be eligible again on ${nextEligibleDate.toLocaleDateString()}.`
        });
      }
    }

    // 2. Check other registered upcoming camps (camps cannot be within 60 days of each other)
    const upcomingRegisteredCamps = await Camp.find({
      status: 'Upcoming',
      registeredDonors: req.user.id,
      _id: { $ne: camp._id } // exclude the current one, though we already checked if they are registered
    });

    for (const registeredCamp of upcomingRegisteredCamps) {
      const registeredCampDate = new Date(registeredCamp.date);
      const timeDiff = Math.abs(campDate.getTime() - registeredCampDate.getTime());
      const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
      
      if (daysDiff < 60) {
        return res.status(400).json({
          success: false,
          message: `You are already registered for the camp "${registeredCamp.name}" on ${registeredCampDate.toLocaleDateString()}. You cannot register for another camp within 60 days of it.`
        });
      }
    }

    camp.registeredDonors.push(req.user.id);
    await camp.save();

    // Notify donor about registration
    await createNotification(
      req.user.id,
      'Camp Registration Confirmed',
      `You have successfully registered for the donation camp "${camp.name}" scheduled on ${new Date(camp.date).toLocaleDateString()} at ${camp.venue}.`,
      'success',
      'donor'
    );

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

    // Notify donor about cancellation
    await createNotification(
      req.user.id,
      'Camp Registration Cancelled',
      `Your registration for the donation camp "${camp.name}" has been cancelled.`,
      'info',
      'donor'
    );

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
