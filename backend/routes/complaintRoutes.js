
const express = require('express');
const router = express.Router();

const {
  createComplaint,
  getComplaints,
  updateStatus
} = require('../controllers/complaintController');

const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Resident must be authenticated to create a report.
router.post('/', authMiddleware, upload.single('image'), createComplaint);

// Existing admin dashboard fetches the complaint feed from this endpoint.
router.get('/', getComplaints);

// Keep this PATCH route aligned with the admin dashboard request.
router.patch('/:id/status', authMiddleware, adminMiddleware, updateStatus);

module.exports = router;




// const express = require('express');
// const router = express.Router();

// const {
//     createComplaint,
//     getComplaints,
//     updateStatus
// } = require('../controllers/complaintController');

// const authMiddleware = require('../middleware/authMiddleware');
// const adminMiddleware = require('../middleware/adminMiddleware');
// const upload = require('../middleware/uploadMiddleware');

// router.post(
//     '/',
//     authMiddleware,
//     upload.single('image'),
//     createComplaint
// );

// router.get('/', getComplaints);

// router.patch(
//     '/:id/status',
//     authMiddleware,
//     adminMiddleware,
//     updateStatus
// );

// module.exports = router;




// const adminMiddleware = require('../middleware/adminMiddleware');
// const express = require('express');
// const router = express.Router();
// const { createComplaint, getComplaints, updateStatus } = require('../controllers/complaintController');
// const authMiddleware = require('../middleware/authMiddleware');
// const upload = require('../middleware/uploadMiddleware');

// router.post('/', authMiddleware, upload.single('image'), createComplaint);

// router.get('/', getComplaints);

// router.patch(
//     '/:id/status',
//     authMiddleware,
//     adminMiddleware,
//     updateStatus
// );

// router.post('/', authMiddleware, upload.single('image'), createComplaint);
// router.get('/', getComplaints);
// router.patch('/:id/status', authMiddleware, updateStatus);

// module.exports = router;