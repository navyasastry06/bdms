const User = require('../models/User');
const DonorProfile = require('../models/DonorProfile');
const HospitalProfile = require('../models/HospitalProfile');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require('../utils/tokenUtils');

/* ==================== REGISTER ==================== */
const register = async (req, res) => {
  try {
    const { name, email, password, role, bloodGroup, hospitalName, registrationNumber, phone } = req.body;

    /* Check if user already exists */
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists.'
      });
    }

    /* Validate role-specific fields */
    if (role === 'donor' && !bloodGroup) {
      return res.status(400).json({
        success: false,
        message: 'Blood group is required for donor registration.'
      });
    }

    if (role === 'hospital' && (!hospitalName || !registrationNumber)) {
      return res.status(400).json({
        success: false,
        message: 'Hospital name and registration number are required.'
      });
    }

    /* Prevent self-registration as admin */
    if (role === 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin accounts cannot be created via registration.'
      });
    }

    /* Create user */
    const user = await User.create({ name, email, password, role });

    /* Create role-specific profile */
    if (role === 'donor') {
      await DonorProfile.create({
        userId: user._id,
        bloodGroup,
        phone: phone || ''
      });
    } else if (role === 'hospital') {
      await HospitalProfile.create({
        userId: user._id,
        hospitalName,
        registrationNumber,
        phone: phone || '',
        contactPerson: name
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
      maxAge: 7 * 24 * 60 * 60 * 1000 /* 7 days */
    });

    res.status(201).json({
      success: true,
      message: 'Registration successful!',
      accessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed. Please try again.',
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

    /* Find user with password field */
    const user = await User.findOne({ email }).select('+password');
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

    res.json({
      success: true,
      message: 'Login successful!',
      accessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
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

    res.json({
      success: true,
      accessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
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

    /* Get profile based on role */
    let profile = null;
    if (user.role === 'donor') {
      profile = await DonorProfile.findOne({ userId: user._id });
    } else if (user.role === 'hospital') {
      profile = await HospitalProfile.findOne({ userId: user._id });
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt
      },
      profile
    });
  } catch (error) {
    console.error('GetMe error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user data.'
    });
  }
};

module.exports = { register, login, refreshAccessToken, logout, getMe };
