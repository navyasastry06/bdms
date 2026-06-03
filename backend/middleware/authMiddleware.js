const { verifyAccessToken } = require('../utils/tokenUtils');
const User = require('../models/User');

/* Verify JWT token from Authorization header */
const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Session expired. Please login again.'
      });
    }

    const token = authHeader.split(' ')[1];

    const decoded = verifyAccessToken(token);

    /* Verify user still exists in database */
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User no longer exists. Please register again.'
      });
    }

    const { checkUserRoles } = require('../utils/roleUtils');
    const { isDualRole, roles } = await checkUserRoles(user);

    req.user = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified,
      isDualRole,
      roles
    };

    /* If user is not verified, restrict access to everything except /me and /logout */
    const isAllowedForUnverified = (req.baseUrl === '/api/auth' && (req.path === '/me' || req.path === '/logout'));
    if (!user.isVerified && !isAllowedForUnverified) {
      return res.status(403).json({
        success: false,
        isVerified: false,
        message: 'Account verification required. Please verify your OTP.'
      });
    }

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Session expired. Please login again.'
      });
    }
    return res.status(401).json({
      success: false,
      message: 'Invalid token. Please login again.'
    });
  }
};

module.exports = { authMiddleware };
