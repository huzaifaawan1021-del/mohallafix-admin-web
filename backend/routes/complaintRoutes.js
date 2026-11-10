
// const express = require('express');
// const router = express.Router();

// const protect = require('../middleware/authMiddleware');
// const upload = require('../middleware/upload');

// const {
//   createComplaint,
//   getComplaints,
//   updateStatus
// } = require('../controllers/complaintController');

// // Create complaint
// router.post(
//   '/',
//   protect,
//   upload.single('image'),
//   createComplaint
// );

// // Get resident complaints
// router.get(
//   '/',
//   protect,
//   getComplaints
// );

// // Update status (admin only)
// router.patch(
//   '/:id/status',
//   protect,
//   updateStatus
// );

// module.exports = router;



const express = require('express');
const router = express.Router();

const protect = require('../middleware/authMiddleware');
// const upload = require('../middleware/upload');
const upload = require('../middleware/uploadMiddleware');

const {
  createComplaint,
  getComplaints,
  updateStatus
} = require('../controllers/complaintController');

// Create complaint
router.post(
  '/',
  protect,
  upload.single('image'),
  createComplaint
);

// Get complaints
router.get(
  '/',
  protect,
  getComplaints
);

// Update complaint status
router.patch(
  '/:id/status',
  protect,
  updateStatus
);

module.exports = router;
