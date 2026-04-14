const router = require('express').Router();
const { authMiddleware } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const {
  getDashboard,
  getProfile,
  updateProfile,
  getDonationHistory,
  getUpcomingCamps,
  registerForCamp,
  unregisterFromCamp
} = require('../controllers/donorController');

/* All donor routes require authentication + donor role */
router.use(authMiddleware, authorize('donor'));

router.get('/dashboard', getDashboard);
router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.get('/history', getDonationHistory);
router.get('/camps', getUpcomingCamps);
router.post('/camps/:campId/register', registerForCamp);
router.delete('/camps/:campId/register', unregisterFromCamp);

module.exports = router;
