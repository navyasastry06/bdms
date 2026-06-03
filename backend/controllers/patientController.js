const PatientProfile = require('../models/PatientProfile');
const HospitalProfile = require('../models/HospitalProfile');

/* ==================== ADD PATIENT ==================== */
const addPatient = async (req, res) => {
  try {
    /* Find the hospital profile for the logged-in user */
    const hospitalProfile = await HospitalProfile.findOne({ userId: req.user.id });
    if (!hospitalProfile) {
      return res.status(403).json({
        success: false,
        message: 'Only hospital accounts can add patients.'
      });
    }

    const { patientName, age, gender, bloodGroup, phone, medicalCondition, unitsRequired } = req.body;

    if (!patientName || !bloodGroup) {
      return res.status(400).json({
        success: false,
        message: 'Patient name and blood group are required.'
      });
    }

    if (phone) {
      const sanitizedPhone = phone.toString().replace(/\D/g, '');
      if (sanitizedPhone.length !== 10) {
        return res.status(400).json({
          success: false,
          message: 'Phone number must contain exactly 10 digits.'
        });
      }
    }

    const patient = await PatientProfile.create({
      hospitalId: hospitalProfile._id,
      patientName: patientName.trim(),
      age: age ? Number(age) : undefined,
      gender: gender || undefined,
      bloodGroup: bloodGroup.trim().toUpperCase(),
      phone: phone ? phone.toString().replace(/\D/g, '') : undefined,
      medicalCondition: medicalCondition || 'None',
      unitsRequired: unitsRequired ? Number(unitsRequired) : 1
    });

    res.status(201).json({
      success: true,
      message: 'Patient added successfully.',
      patient
    });
  } catch (error) {
    console.error('addPatient error:', error);
    const validationMessage = error.name === 'ValidationError'
      ? Object.values(error.errors).map(err => err.message).join(', ')
      : null;
    res.status(500).json({
      success: false,
      message: validationMessage || 'Failed to add patient. Please try again.'
    });
  }
};

/* ==================== GET ALL PATIENTS (for hospital) ==================== */
const getPatients = async (req, res) => {
  try {
    const hospitalProfile = await HospitalProfile.findOne({ userId: req.user.id });
    if (!hospitalProfile) {
      return res.status(403).json({
        success: false,
        message: 'Only hospital accounts can view patients.'
      });
    }

    const patients = await PatientProfile.find({ hospitalId: hospitalProfile._id }).sort({ createdAt: -1 });

    res.json({
      success: true,
      patients
    });
  } catch (error) {
    console.error('getPatients error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve patients.'
    });
  }
};

/* ==================== UPDATE PATIENT STATUS ==================== */
const updatePatientStatus = async (req, res) => {
  try {
    const hospitalProfile = await HospitalProfile.findOne({ userId: req.user.id });
    if (!hospitalProfile) {
      return res.status(403).json({ success: false, message: 'Unauthorized.' });
    }

    const patient = await PatientProfile.findOne({
      _id: req.params.id,
      hospitalId: hospitalProfile._id
    });

    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient not found.' });
    }

    const { status } = req.body;
    if (!['Active', 'Discharged', 'Critical'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status value.' });
    }

    patient.status = status;
    await patient.save();

    res.json({ success: true, message: 'Patient status updated.', patient });
  } catch (error) {
    console.error('updatePatientStatus error:', error);
    res.status(500).json({ success: false, message: 'Failed to update patient status.' });
  }
};

/* ==================== DELETE PATIENT ==================== */
const deletePatient = async (req, res) => {
  try {
    const hospitalProfile = await HospitalProfile.findOne({ userId: req.user.id });
    if (!hospitalProfile) {
      return res.status(403).json({ success: false, message: 'Unauthorized.' });
    }

    const patient = await PatientProfile.findOneAndDelete({
      _id: req.params.id,
      hospitalId: hospitalProfile._id
    });

    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient not found.' });
    }

    res.json({ success: true, message: 'Patient record removed successfully.' });
  } catch (error) {
    console.error('deletePatient error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete patient.' });
  }
};

module.exports = {
  addPatient,
  getPatients,
  updatePatientStatus,
  deletePatient
};
