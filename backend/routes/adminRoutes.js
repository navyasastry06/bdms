const router = require('express').Router();
const { authMiddleware } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const {
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
} = require('../controllers/adminController');

/* All admin routes require authentication + admin role */
router.use(authMiddleware, authorize('admin'));

router.get('/dashboard', getDashboard);

/* Donor management */
router.get('/donors', getAllDonors);
router.delete('/donors/:id', deleteDonor);

/* Request management */
router.get('/requests', getAllRequests);
router.put('/requests/:id', updateRequestStatus);

/* Blood inventory */
router.get('/inventory', getInventory);
router.put('/inventory', updateInventory);

/* Camp management */
router.get('/camps', getAllCamps);
router.post('/camps', createCamp);
router.put('/camps/:id', updateCamp);
router.delete('/camps/:id', deleteCamp);

/* Reports */
router.get('/reports', getReports);

/* Record donation */
router.post('/donations', recordDonation);

module.exports = router;
