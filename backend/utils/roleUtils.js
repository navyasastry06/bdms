const DonorProfile = require('../models/DonorProfile');
const HospitalProfile = require('../models/HospitalProfile');

/**
 * Determines whether a user has profiles for both donor and hospital roles
 * under the same account (dual-role user).
 *
 * Dual role = same userId has both a DonorProfile AND a HospitalProfile.
 */
const checkUserRoles = async (user) => {
  const hasDonorProfile = await DonorProfile.exists({ userId: user._id });
  const hasHospitalProfile = await HospitalProfile.exists({ userId: user._id });

  if (hasDonorProfile && hasHospitalProfile) {
    return {
      isDualRole: true,
      roles: ['donor', 'hospital']
    };
  }

  /* Single-role — use the stored role */
  return {
    isDualRole: false,
    roles: [user.role]
  };
};

module.exports = { checkUserRoles };
