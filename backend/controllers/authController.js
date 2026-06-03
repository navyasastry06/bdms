const User = require('../models/User');
const DonorProfile = require('../models/DonorProfile');
const HospitalProfile = require('../models/HospitalProfile');
const OTPVerification = require('../models/OTPVerification');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require('../utils/tokenUtils');
const { sendOTPEmail, sendPasswordResetEmail } = require('../services/emailService');
const crypto = require('crypto');
const dns = require('dns').promises;
const net = require('net');
const { checkUserRoles } = require('../utils/roleUtils');

/* Helper to perform an SMTP handshake and verify if a mailbox exists */
const verifyMailbox = async (email) => {
  const domain = email.split('@')[1];
  if (!domain) return false;

  try {
    const mxRecords = await dns.resolveMx(domain);
    if (!mxRecords || mxRecords.length === 0) return false;

    mxRecords.sort((a, b) => a.priority - b.priority);
    const mxHost = mxRecords[0].exchange;

    return new Promise((resolve) => {
      const socket = net.createConnection(25, mxHost);
      socket.setTimeout(4000); // 4 seconds timeout

      let step = 0;
      let resolved = false;

      const finish = (result) => {
        if (resolved) return;
        resolved = true;
        socket.destroy();
        resolve(result);
      };

      socket.on('connect', () => {
        // Connected
      });

      socket.on('data', (data) => {
        const response = data.toString();
        const code = parseInt(response.substring(0, 3));

        if (step === 0) {
          socket.write(`HELO bdms.com\r\n`);
          step = 1;
        } else if (step === 1) {
          socket.write(`MAIL FROM:<noreply@bdms.com>\r\n`);
          step = 2;
        } else if (step === 2) {
          if (code >= 400) {
            finish(true); // Fallback to true if we are blocked as a sender
            return;
          }
          socket.write(`RCPT TO:<${email}>\r\n`);
          step = 3;
        } else if (step === 3) {
          if (code === 550 || code === 551 || code === 553 || code === 554) {
            finish(false); // Mailbox definitely does not exist
          } else {
            finish(true);
          }
        }
      });

      socket.on('error', (err) => {
        finish(true); // Fallback on connection errors (e.g. port 25 blocked by ISP)
      });

      socket.on('timeout', () => {
        finish(true); // Fallback on timeouts
      });
    });
  } catch (err) {
    return false;
  }
};

/* ==================== REGISTER ==================== */
const register = async (req, res) => {
  try {
    const {
      name, email, password, role,
      /* Donor-specific */
      bloodGroup, age, gender,
      address, /* shared: { street, city, state, pincode } */
      /* Hospital-specific */
      hospitalName, licenseNumber,
      /* Common */
      phone
    } = req.body;

    /* Block patient self-registration — patients are managed by hospitals */
    if (role === 'patient') {
      return res.status(403).json({
        success: false,
        message: 'Patient accounts are managed by hospitals and cannot be self-registered.'
      });
    }

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email address is required.'
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    /* Validate email format */
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(normalizedEmail)) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid email address.'
      });
    }

    /* Verify email domain has active mail servers (MX records) */
    const domain = normalizedEmail.split('@')[1];
    let isDomainValid = false;
    try {
      const mxRecords = await dns.resolveMx(domain);
      isDomainValid = mxRecords && mxRecords.length > 0;
    } catch (dnsErr) {
      isDomainValid = false;
    }

    if (!isDomainValid) {
      return res.status(400).json({
        success: false,
        message: 'The email domain does not exist or cannot receive emails.'
      });
    }

    /* We have removed the strict SMTP mailbox verification (port 25) because 
       many cloud hosts (like Render, AWS) block outgoing port 25 by default,
       which causes a 4-second timeout delay on every registration attempt.
       We now rely solely on MX record validation and the actual OTP email delivery. */

    /* Check if user already exists */
    const existingUser = await User.findOne({ email: normalizedEmail });

    /* ── DUAL REGISTRATION: same email, different role ── */
    if (existingUser) {
      /* Only allow adding a second profile if the user is verified and role differs */
      if (!existingUser.isVerified) {
        return res.status(400).json({
          success: false,
          message: 'An unverified account with this email exists. Please verify it first or check your email.'
        });
      }

      /* Check if they already have a profile for this role */
      const alreadyDonor = role === 'donor' && await DonorProfile.exists({ userId: existingUser._id });
      const alreadyHospital = role === 'hospital' && await HospitalProfile.exists({ userId: existingUser._id });

      if (alreadyDonor || alreadyHospital) {
        return res.status(400).json({
          success: false,
          message: `This email is already registered as a ${role}. Please log in instead.`
        });
      }

      /* Validate role-specific fields for the second profile */
      if (role === 'donor' && !bloodGroup) {
        return res.status(400).json({ success: false, message: 'Blood group is required for donor registration.' });
      }
      if (role === 'hospital') {
        if (!hospitalName || !licenseNumber) {
          return res.status(400).json({ success: false, message: 'Hospital name and license number are required.' });
        }
        const existingHospital = await HospitalProfile.findOne({ registrationNumber: licenseNumber.trim() });
        if (existingHospital) {
          return res.status(400).json({ success: false, message: 'A hospital with this license number is already registered.' });
        }
      }

      /* Sanitize phone */
      const sanitizedPhone2 = phone ? phone.toString().replace(/\D/g, '') : '';
      if (phone && sanitizedPhone2.length !== 10) {
        return res.status(400).json({ success: false, message: 'Phone number must contain exactly 10 digits.' });
      }

      /* Create the second profile */
      const normalizedBloodGroup2 = bloodGroup ? bloodGroup.trim().toUpperCase() : undefined;
      if (role === 'donor') {
        await DonorProfile.create({
          userId: existingUser._id,
          bloodGroup: normalizedBloodGroup2,
          age: age ? Number(age) : undefined,
          gender: gender || undefined,
          address: address || {},
          phone: sanitizedPhone2 || ''
        });
      } else if (role === 'hospital') {
        await HospitalProfile.create({
          userId: existingUser._id,
          hospitalName,
          registrationNumber: licenseNumber.trim(),
          phone: sanitizedPhone2 || '',
          contactPerson: existingUser.name,
          address: address || {}
        });
      }

      /* Update user role to reflect they now have multiple profiles */
      /* We keep the primary role as-is; isDualRole is derived at login time */

      return res.status(201).json({
        success: true,
        isVerified: true, /* Account already verified — no OTP needed */
        message: `${role.charAt(0).toUpperCase() + role.slice(1)} profile added to your existing account. You can now log in and choose your portal.`
      });
    }

    /* ── BRAND NEW REGISTRATION ── */

    /* Check if phone number is already registered */
    if (phone) {
      const sanitizedPhone = phone.toString().replace(/\D/g, '');
      if (sanitizedPhone) {
        const [existingDonorPhone, existingHospitalPhone] = await Promise.all([
          DonorProfile.findOne({ phone: sanitizedPhone }),
          HospitalProfile.findOne({ phone: sanitizedPhone })
        ]);

        if (existingDonorPhone || existingHospitalPhone) {
          return res.status(400).json({
            success: false,
            message: 'An account with this phone number already exists. Please check again.'
          });
        }
      }
    }

    /* Validate role-specific fields */
    if (role === 'donor' && !bloodGroup) {
      return res.status(400).json({
        success: false,
        message: 'Blood group is required for donor registration.'
      });
    }

    if (role === 'hospital') {
      if (!hospitalName || !licenseNumber) {
        return res.status(400).json({
          success: false,
          message: 'Hospital name and license number are required.'
        });
      }

      const existingHospital = await HospitalProfile.findOne({ registrationNumber: licenseNumber.trim() });
      if (existingHospital) {
        return res.status(400).json({
          success: false,
          message: 'A hospital with this license number is already registered. Please check again.'
        });
      }
    }

    /* Prevent self-registration as admin */
    if (role === 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin accounts cannot be created via registration.'
      });
    }

    const normalizedName = name.trim();
    const normalizedBloodGroup = bloodGroup ? bloodGroup.trim().toUpperCase() : undefined;

    /* Create user */
    const user = await User.create({ name: normalizedName, email: normalizedEmail, password, role });

    /* Sanitize incoming phone number to digits only */
    const sanitizedPhone = phone ? phone.toString().replace(/\D/g, '') : '';

    if (phone && sanitizedPhone.length !== 10) {
      await User.findByIdAndDelete(user._id);
      return res.status(400).json({
        success: false,
        message: 'Phone number must contain exactly 10 digits.'
      });
    }

    try {
      /* Create role-specific profile */
      if (role === 'donor') {
        await DonorProfile.create({
          userId: user._id,
          bloodGroup: normalizedBloodGroup,
          age: age ? Number(age) : undefined,
          gender: gender || undefined,
          address: address || {},
          phone: sanitizedPhone || ''
        });
      } else if (role === 'hospital') {
        await HospitalProfile.create({
          userId: user._id,
          hospitalName,
          registrationNumber: licenseNumber.trim(),
          phone: sanitizedPhone || '',
          contactPerson: normalizedName,
          address: address || {}
        });
      }
      /* Note: patient role is no longer self-registerable */
    } catch (profileError) {
      await User.findByIdAndDelete(user._id);
      throw profileError;
    }

    /* Generate OTP Verification code */
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiryTime = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await OTPVerification.create({
      userId: user._id,
      otpCode,
      expiryTime,
      verificationStatus: 'pending'
    });

    /* Send OTP via Email */
    await sendOTPEmail(user.email, user.name, otpCode);

    res.status(201).json({
      success: true,
      isVerified: false,
      email: user.email,
      message: 'Registration successful! An OTP verification code has been sent to your email.'
    });
  } catch (error) {
    console.error('Register error:', error);
    const validationMessage = error.name === 'ValidationError'
      ? Object.values(error.errors).map(err => err.message).join(', ')
      : null;
    res.status(500).json({
      success: false,
      message: validationMessage || 'Registration failed. Please try again.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/* ==================== LOGIN ==================== */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required.'
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    /* Find user with password field */
    const user = await User.findOne({ email: normalizedEmail }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    /* Compare passwords */
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    /* Check if user account is verified */
    if (!user.isVerified) {
      // Auto-generate and send a new OTP
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      const expiryTime = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      await OTPVerification.deleteMany({ userId: user._id });

      await OTPVerification.create({
        userId: user._id,
        otpCode,
        expiryTime,
        verificationStatus: 'pending'
      });

      await sendOTPEmail(user.email, user.name, otpCode);

      return res.status(403).json({
        success: false,
        isVerified: false,
        email: user.email,
        message: 'Your account is not verified. A new OTP has been sent to your email.'
      });
    }

    /* Generate tokens */
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    /* Save refresh token to database */
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    /* Set refresh token in HttpOnly cookie */
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    const { isDualRole, roles } = await checkUserRoles(user);

    res.json({
      success: true,
      message: 'Login successful!',
      accessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        isDualRole,
        roles
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed. Please try again.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/* ==================== REFRESH TOKEN ==================== */
const refreshAccessToken = async (req, res) => {
  try {
    const token = req.cookies.refreshToken;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Session expired. Please login again.'
      });
    }

    /* Verify refresh token */
    const decoded = verifyRefreshToken(token);

    /* Find user and validate stored refresh token matches */
    const user = await User.findById(decoded.id);
    if (!user || user.refreshToken !== token) {
      return res.status(401).json({
        success: false,
        message: 'Invalid session. Please login again.'
      });
    }

    /* Generate new access token */
    const accessToken = generateAccessToken(user);

    /* Rotate refresh token for extra security */
    const newRefreshToken = generateRefreshToken(user);
    user.refreshToken = newRefreshToken;
    await user.save({ validateBeforeSave: false });

    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    const { isDualRole, roles } = await checkUserRoles(user);

    res.json({
      success: true,
      accessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        isDualRole,
        roles
      }
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(401).json({
      success: false,
      message: 'Session expired. Please login again.'
    });
  }
};

/* ==================== LOGOUT ==================== */
const logout = async (req, res) => {
  try {
    const token = req.cookies.refreshToken;

    if (token) {
      /* Clear refresh token from database */
      const decoded = verifyRefreshToken(token);
      await User.findByIdAndUpdate(decoded.id, { refreshToken: null });
    }

    /* Clear cookie */
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });

    res.json({
      success: true,
      message: 'Logged out successfully.'
    });
  } catch (error) {
    /* Even if token verification fails, clear the cookie */
    res.clearCookie('refreshToken');
    res.json({
      success: true,
      message: 'Logged out successfully.'
    });
  }
};

/* ==================== GET CURRENT USER ==================== */
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.'
      });
    }

    const { isDualRole, roles } = await checkUserRoles(user);

    /* Always fetch both donor and hospital profiles — dual-role users may have both */
    const [donorProfile, hospitalProfile] = await Promise.all([
      DonorProfile.findOne({ userId: user._id }),
      HospitalProfile.findOne({ userId: user._id })
    ]);

    /* Primary profile depends on base role */
    let profile = null;
    if (user.role === 'donor') {
      profile = donorProfile;
    } else if (user.role === 'hospital') {
      profile = hospitalProfile;
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        createdAt: user.createdAt,
        isDualRole,
        roles
      },
      profile,
      donorProfile,
      hospitalProfile
    });
  } catch (error) {
    console.error('GetMe error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user data.'
    });
  }
};

/* ==================== VERIFY OTP ==================== */
const verifyOtp = async (req, res) => {
  try {
    const { email, otpCode } = req.body;
    if (!email || !otpCode) {
      return res.status(400).json({
        success: false,
        message: 'Email and OTP code are required.'
      });
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.'
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: 'Account is already verified.'
      });
    }

    const otpRecord = await OTPVerification.findOne({
      userId: user._id,
      verificationStatus: 'pending'
    }).sort({ createdAt: -1 });

    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        message: 'No OTP requested for this user. Please request a new one.'
      });
    }

    if (new Date() > otpRecord.expiryTime) {
      return res.status(400).json({
        success: false,
        message: 'OTP has expired. Please request a new one.'
      });
    }

    if (otpRecord.otpCode !== otpCode.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP code. Please try again.'
      });
    }

    otpRecord.verificationStatus = 'verified';
    await otpRecord.save();

    user.isVerified = true;

    /* Generate tokens */
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    const { isDualRole, roles } = await checkUserRoles(user);

    res.json({
      success: true,
      message: 'Account verified successfully!',
      accessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        isDualRole,
        roles
      }
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'OTP verification failed. Please try again.'
    });
  }
};

/* ==================== RESEND OTP ==================== */
const resendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required.'
      });
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.'
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: 'Account is already verified.'
      });
    }

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiryTime = new Date(Date.now() + 10 * 60 * 1000);

    await OTPVerification.deleteMany({ userId: user._id });

    await OTPVerification.create({
      userId: user._id,
      otpCode,
      expiryTime,
      verificationStatus: 'pending'
    });

    await sendOTPEmail(user.email, user.name, otpCode);

    res.json({
      success: true,
      message: 'A new OTP has been sent to your email.'
    });
  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to resend OTP. Please try again.'
    });
  }
};

/* ==================== FORGOT PASSWORD ==================== */
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required.'
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    /* Validate email format */
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(normalizedEmail)) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid email address.'
      });
    }

    /* Verify email domain has active mail servers (MX records) */
    const domain = normalizedEmail.split('@')[1];
    let isDomainValid = false;
    try {
      const mxRecords = await dns.resolveMx(domain);
      isDomainValid = mxRecords && mxRecords.length > 0;
    } catch (dnsErr) {
      isDomainValid = false;
    }

    if (!isDomainValid) {
      return res.status(400).json({
        success: false,
        message: 'The email domain does not exist or cannot receive emails.'
      });
    }

    /* We rely solely on MX record validation and the actual password reset email delivery. */

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.json({
        success: true,
        message: 'If that email address exists, a password reset link has been sent.'
      });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpire = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save({ validateBeforeSave: false });

    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const resetUrl = `${clientUrl}/reset-password/${resetToken}`;

    await sendPasswordResetEmail(user.email, user.name, resetUrl);

    res.json({
      success: true,
      message: 'If that email address exists, a password reset link has been sent.'
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send password reset email. Please try again.'
    });
  }
};

/* ==================== RESET PASSWORD ==================== */
const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password || password.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters long.'
      });
    }

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpire: { $gt: new Date() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired password reset token.'
      });
    }

    user.password = password;
    user.resetPasswordToken = null;
    user.resetPasswordExpire = null;
    await user.save();

    res.json({
      success: true,
      message: 'Password reset successful! You can now login with your new password.'
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Password reset failed. Please try again.'
    });
  }
};

/* ==================== PUBLIC STATS ==================== */
const getPublicStats = async (req, res) => {
  try {
    const Camp = require('../models/Camp');
    const BloodRequest = require('../models/BloodRequest');
    const Donation = require('../models/Donation');

    const donorCount = await User.countDocuments({ role: 'donor' });
    const campCount = await Camp.countDocuments({});
    const requestCount = await BloodRequest.countDocuments({});
    const livesSaved = await Donation.countDocuments({});

    res.json({
      success: true,
      stats: {
        donorCount,
        campCount,
        requestCount,
        livesSaved
      }
    });
  } catch (error) {
    console.error('Get public stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch public stats.'
    });
  }
};

/* ==================== GET PUBLIC CAMPS ==================== */
const getPublicCamps = async (req, res) => {
  try {
    const Camp = require('../models/Camp');
    // Only fetch upcoming camps scheduled for today or later, limit to 3 for landing page
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    
    const camps = await Camp.find({ status: 'Upcoming', date: { $gte: todayStart } })
      .sort({ date: 1 })
      .limit(3);

    res.json({
      success: true,
      camps
    });
  } catch (error) {
    console.error('Get public camps error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch public camps.'
    });
  }
};

module.exports = {
  register,
  login,
  refreshAccessToken,
  logout,
  getMe,
  verifyOtp,
  resendOtp,
  forgotPassword,
  resetPassword,
  getPublicStats,
  getPublicCamps
};
