const router = require('express').Router();
const {
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
} = require('../controllers/authController');
const { authMiddleware } = require('../middleware/authMiddleware');
const rateLimit = require('express-rate-limit');

/* Rate limiting for auth endpoints — max 10 requests per minute */
const authLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 10,
  message: {
    success: false,
    message: 'Too many attempts. Please try again after 1 minute.'
  }
});

/* Public routes */
router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.post('/refresh', refreshAccessToken);
router.post('/logout', logout);
router.post('/verify-otp', authLimiter, verifyOtp);
router.post('/resend-otp', authLimiter, resendOtp);
router.post('/forgot-password', authLimiter, forgotPassword);
router.post('/reset-password/:token', authLimiter, resetPassword);
router.get('/stats', getPublicStats);
router.get('/camps', getPublicCamps);

/* Protected route */
router.get('/me', authMiddleware, getMe);

module.exports = router;
