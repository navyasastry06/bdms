const User = require('../models/User');
const DonorProfile = require('../models/DonorProfile');
const HospitalProfile = require('../models/HospitalProfile');
const BloodRequest = require('../models/BloodRequest');
const BloodInventory = require('../models/BloodInventory');
const Camp = require('../models/Camp');
const Donation = require('../models/Donation');
const { createNotification, notifyAdmins } = require('../services/notificationService');

/* ==================== GET ADMIN DASHBOARD ==================== */
const getDashboard = async (req, res) => {
  try {
    const totalDonors = await User.countDocuments({ role: 'donor' });
    const totalHospitals = await User.countDocuments({ role: 'hospital' });
    const totalRequests = await BloodRequest.countDocuments();
    const pendingRequests = await BloodRequest.countDocuments({ status: 'Pending' });
    const totalDonations = await Donation.countDocuments();
    const totalCamps = await Camp.countDocuments();
    const upcomingCamps = await Camp.countDocuments({ status: 'Upcoming' });

    /* Blood inventory summary */
    const inventory = await BloodInventory.find().sort({ bloodGroup: 1 });

    res.json({
      success: true,
      dashboard: {
        totalDonors,
        totalHospitals,
        totalRequests,
        pendingRequests,
        totalDonations,
        totalCamps,
        upcomingCamps,
        inventory
      }
    });
  } catch (error) {
    console.error('Admin dashboard error:', error);
    res.status(500).json({ success: false, message: 'Failed to load dashboard.' });
  }
};

/* ==================== MANAGE DONORS ==================== */
const getAllDonors = async (req, res) => {
  try {
    const donors = await User.find({ role: 'donor' }).sort({ createdAt: -1 });
    const donorProfiles = await DonorProfile.find();

    /* Merge user and profile data */
    const donorData = donors.map(donor => {
      const profile = donorProfiles.find(
        p => p.userId.toString() === donor._id.toString()
      );
      return {
        id: donor._id,
        name: donor.name,
        email: donor.email,
        createdAt: donor.createdAt,
        bloodGroup: profile ? profile.bloodGroup : 'N/A',
        phone: profile ? profile.phone : 'N/A',
        totalDonations: profile ? profile.totalDonations : 0,
        isAvailable: profile ? profile.isAvailable : false
      };
    });

    res.json({ success: true, donors: donorData });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to load donors.' });
  }
};

const deleteDonor = async (req, res) => {
  try {
    const { id } = req.params;
    await DonorProfile.findOneAndDelete({ userId: id });
    await Donation.deleteMany({ donorId: id });
    await User.findByIdAndDelete(id);

    res.json({ success: true, message: 'Donor deleted successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete donor.' });
  }
};

/* ==================== MANAGE REQUESTS ==================== */
const getAllRequests = async (req, res) => {
  try {
    const requests = await BloodRequest.find()
      .sort({ createdAt: -1 })
      .populate('requestedBy', 'name email role');

    res.json({ success: true, requests });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to load requests.' });
  }
};

const updateRequestStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    const request = await BloodRequest.findByIdAndUpdate(
      id,
      {
        status,
        notes: notes || '',
        approvedBy: (status === 'Approved' || status === 'Fulfilled') ? req.user.id : null,
        approvedAt: (status === 'Approved' || status === 'Fulfilled') ? new Date() : null
      },
      { new: true, runValidators: true }
    ).populate('requestedBy', 'role');

    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found.' });
    }

    /* If fulfilled, deduct from inventory */
    if (status === 'Fulfilled') {
      const inventoryItem = await BloodInventory.findOneAndUpdate(
        { bloodGroup: request.bloodGroup },
        { $inc: { unitsAvailable: -request.unitsRequired }, lastUpdated: new Date(), updatedBy: req.user.id },
        { new: true, runValidators: true }
      );
      
      /* Low stock threshold alert */
      if (inventoryItem && inventoryItem.unitsAvailable <= inventoryItem.thresholdLevel) {
        await notifyAdmins(
          'Low Blood Stock Alert',
          `Blood group ${request.bloodGroup} has fallen below threshold. Current: ${inventoryItem.unitsAvailable} units (Threshold: ${inventoryItem.thresholdLevel}).`,
          'alert'
        );
      }
    }

    // Notify requesting user (hospital or patient) about status update
    const title = `Blood Request ${status}`;
    const message = `Your emergency blood request for ${request.patientName} (${request.bloodGroup}, ${request.unitsRequired} units) has been ${status.toLowerCase()}.${notes ? ' Admin note: ' + notes : ''}`;
    const type = status === 'Rejected' ? 'warning' : status === 'Fulfilled' ? 'success' : 'info';
    
    // Blood requests are exclusively managed via the Hospital portal.
    // Even if the user originally registered as a Donor (Dual Role), this notification belongs in their Hospital dashboard.
    const recipientRole = 'hospital';
    const recipientId = request.requestedBy?._id || request.requestedBy;
    
    await createNotification(recipientId, title, message, type, recipientRole);

    res.json({ success: true, message: `Request ${status.toLowerCase()} successfully.`, request });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update request.' });
  }
};

/* ==================== BLOOD INVENTORY ==================== */
const getInventory = async (req, res) => {
  try {
    const inventory = await BloodInventory.find().sort({ bloodGroup: 1 });

    /* If inventory is empty, create default entries */
    if (inventory.length === 0) {
      const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
      const defaults = bloodGroups.map(bg => ({
        bloodGroup: bg,
        unitsAvailable: 0,
        updatedBy: req.user.id
      }));
      await BloodInventory.insertMany(defaults);
      const newInventory = await BloodInventory.find().sort({ bloodGroup: 1 });
      return res.json({ success: true, inventory: newInventory });
    }

    res.json({ success: true, inventory });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to load inventory.' });
  }
};

const updateInventory = async (req, res) => {
  try {
    const { bloodGroup, unitsAvailable } = req.body;

    const item = await BloodInventory.findOneAndUpdate(
      { bloodGroup },
      { unitsAvailable, lastUpdated: new Date(), updatedBy: req.user.id },
      { new: true, runValidators: true, upsert: true }
    );

    res.json({ success: true, message: 'Inventory updated successfully.', item });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update inventory.' });
  }
};

/* ==================== CAMP MANAGEMENT ==================== */
const getAllCamps = async (req, res) => {
  try {
    const camps = await Camp.find()
      .sort({ date: -1 })
      .populate('createdBy', 'name');

    // Aggregate completed donation units grouped by campId
    const donationsGrouped = await Donation.aggregate([
      { $match: { campId: { $ne: null }, status: 'Completed' } },
      { $group: { _id: '$campId', totalUnits: { $sum: '$units' } } }
    ]);

    const donationsMap = {};
    donationsGrouped.forEach(item => {
      donationsMap[item._id.toString()] = item.totalUnits;
    });

    const campsData = camps.map(camp => ({
      ...camp.toObject(),
      registeredCount: camp.registeredDonors.length,
      totalUnitsCollected: donationsMap[camp._id.toString()] || 0
    }));

    res.json({ success: true, camps: campsData });
  } catch (error) {
    console.error('Failed to load camps:', error);
    res.status(500).json({ success: false, message: 'Failed to load camps.' });
  }
};

const createCamp = async (req, res) => {
  try {
    const { name, organizer, date, time, venue, city, state, description, maxParticipants, status } = req.body;

    if (date && status) {
      const campDate = new Date(date);
      if (isNaN(campDate.getTime())) {
        return res.status(400).json({
          success: false,
          message: 'Please provide a valid camp date.'
        });
      }

      const today = new Date();
      today.setHours(0,0,0,0);
      campDate.setHours(0,0,0,0);

      if (campDate < today) {
        if (status === 'Upcoming' || status === 'Ongoing') {
          return res.status(400).json({
            success: false,
            message: 'For past dates, camp status cannot be set to Upcoming or Ongoing.'
          });
        }
      } else if (campDate > today) {
        if (status === 'Completed' || status === 'Ongoing') {
          return res.status(400).json({
            success: false,
            message: 'For future dates, camp status cannot be set to Completed or Ongoing.'
          });
        }
      }
    }

    const camp = await Camp.create({
      name,
      organizer,
      date,
      time,
      venue,
      city,
      state,
      description,
      maxParticipants: maxParticipants || 100,
      status: status || 'Upcoming',
      createdBy: req.user.id
    });

    res.status(201).json({ success: true, message: 'Camp created successfully.', camp });
  } catch (error) {
    console.error('Create camp error:', error);
    res.status(500).json({ success: false, message: 'Failed to create camp.' });
  }
};

const updateCamp = async (req, res) => {
  try {
    const { id } = req.params;
    const existingCamp = await Camp.findById(id);
    if (!existingCamp) {
      return res.status(404).json({ success: false, message: 'Camp not found.' });
    }

    const date = req.body.date !== undefined ? req.body.date : existingCamp.date;
    const status = req.body.status !== undefined ? req.body.status : existingCamp.status;

    if (date && status) {
      const campDate = new Date(date);
      if (isNaN(campDate.getTime())) {
        return res.status(400).json({
          success: false,
          message: 'Please provide a valid camp date.'
        });
      }

      const today = new Date();
      today.setHours(0,0,0,0);
      campDate.setHours(0,0,0,0);

      if (campDate < today) {
        if (status === 'Upcoming' || status === 'Ongoing') {
          return res.status(400).json({
            success: false,
            message: 'For past dates, camp status cannot be set to Upcoming or Ongoing.'
          });
        }
      } else if (campDate > today) {
        if (status === 'Completed' || status === 'Ongoing') {
          return res.status(400).json({
            success: false,
            message: 'For future dates, camp status cannot be set to Completed or Ongoing.'
          });
        }
      }
    }

    const camp = await Camp.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
    res.json({ success: true, message: 'Camp updated successfully.', camp });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update camp.' });
  }
};

const deleteCamp = async (req, res) => {
  try {
    const { id } = req.params;
    const camp = await Camp.findByIdAndDelete(id);

    if (!camp) {
      return res.status(404).json({ success: false, message: 'Camp not found.' });
    }

    res.json({ success: true, message: 'Camp deleted successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete camp.' });
  }
};

/* ==================== REPORTS & ANALYTICS ==================== */
const getReports = async (req, res) => {
  try {
    /* Donations per blood group */
    const donationsByGroup = await Donation.aggregate([
      { $group: { _id: '$bloodGroup', total: { $sum: '$units' } } },
      { $sort: { _id: 1 } }
    ]);

    /* Requests by status */
    const requestsByStatus = await BloodRequest.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    /* Monthly donation trend (last 6 months) */
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyDonations = await Donation.aggregate([
      { $match: { donationDate: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$donationDate' } },
          count: { $sum: 1 },
          units: { $sum: '$units' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    /* Top donors */
    const topDonors = await Donation.aggregate([
      { $group: { _id: '$donorId', totalDonations: { $sum: 1 }, totalUnits: { $sum: '$units' } } },
      { $sort: { totalDonations: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'donor'
        }
      },
      { $unwind: '$donor' },
      {
        $project: {
          name: '$donor.name',
          email: '$donor.email',
          totalDonations: 1,
          totalUnits: 1
        }
      }
    ]);

    res.json({
      success: true,
      reports: {
        donationsByGroup,
        requestsByStatus,
        monthlyDonations,
        topDonors
      }
    });
  } catch (error) {
    console.error('Reports error:', error);
    res.status(500).json({ success: false, message: 'Failed to generate reports.' });
  }
};

/* ==================== RECORD DONATION (by Admin) ==================== */
const recordDonation = async (req, res) => {
  try {
    const { donorId, bloodGroup, units, location, campId, notes } = req.body;

    // Verify donor eligibility (60 days / 2 months cooldown)
    const lastDonation = await Donation.findOne({ donorId, status: 'Completed' }).sort({ donationDate: -1 });
    if (lastDonation) {
      const nextEligibleDate = new Date(lastDonation.donationDate);
      nextEligibleDate.setDate(nextEligibleDate.getDate() + 60); // 60 days
      
      const today = new Date();
      if (today < nextEligibleDate) {
        return res.status(400).json({
          success: false,
          message: `Donor is not eligible to donate yet. The 2-month cooldown expires on ${nextEligibleDate.toLocaleDateString()}.`
        });
      }
    }

    const donation = await Donation.create({
      donorId,
      bloodGroup,
      units: units || 1,
      location,
      campId: campId || null,
      notes,
      recordedBy: req.user.id
    });

    /* Update donor profile */
    await DonorProfile.findOneAndUpdate(
      { userId: donorId },
      {
        lastDonationDate: donation.donationDate,
        $inc: { totalDonations: 1 }
      }
    );

    /* Update blood inventory */
    await BloodInventory.findOneAndUpdate(
      { bloodGroup },
      {
        $inc: { unitsAvailable: units || 1 },
        lastUpdated: new Date(),
        updatedBy: req.user.id
      },
      { upsert: true }
    );

    // Notify donor
    await createNotification(
      donorId,
      'Blood Donation Recorded',
      `Thank you! Your donation of ${units || 1} unit(s) of ${bloodGroup} blood at ${location} has been successfully recorded.`,
      'success',
      'donor'
    );

    res.status(201).json({ success: true, message: 'Donation recorded successfully.', donation });
  } catch (error) {
    console.error('Record donation error:', error);
    const validationMessage = error.name === 'ValidationError'
      ? Object.values(error.errors).map(err => err.message).join(', ')
      : 'Failed to record donation.';
    res.status(error.name === 'ValidationError' ? 400 : 500).json({ success: false, message: validationMessage });
  }
};

module.exports = {
  getDashboard,
  getAllDonors,
  deleteDonor,
  getAllRequests,
  updateRequestStatus,
  getInventory,
  updateInventory,
  getAllCamps,
  createCamp,
  updateCamp,
  deleteCamp,
  getReports,
  recordDonation
};


