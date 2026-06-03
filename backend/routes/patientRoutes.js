const router = require('express').Router();
const { authMiddleware } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const {
  addPatient,
  getPatients,
  updatePatientStatus,
  deletePatient
} = require('../controllers/patientController');

/* All patient management routes require hospital authentication */
router.use(authMiddleware, authorize('hospital'));

/* Hospital patient management */
router.post('/add', addPatient);
router.get('/all', getPatients);
router.patch('/:id/status', updatePatientStatus);
router.delete('/:id', deletePatient);

module.exports = router;
