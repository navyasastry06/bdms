const router = require('express').Router();
const { authMiddleware } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const {
  getDashboard,
  getProfile,
  updateProfile,
  searchBlood,
  createRequest,
  getMyRequests,
  getRequestById
} = require('../controllers/hospitalController');

/* All hospital routes require authentication + hospital role */
router.use(authMiddleware, authorize('hospital'));

router.get('/dashboard', getDashboard);
router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.get('/search', searchBlood);
router.post('/request', createRequest);
router.get('/requests', getMyRequests);
router.get('/requests/:id', getRequestById);

module.exports = router;
