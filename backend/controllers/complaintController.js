// const adminMiddleware = require('../middleware/adminMiddleware');
// const Complaint = require('../models/Complaint');


// // Create a new complaint
// exports.createComplaint = async (req, res) => {
//     try {
//         const { title, category, description, location, priority } = req.body;
        
//         const image = req.file ? req.file.filename : '';

//         const complaint = new Complaint({
//             title,
//             category,
//             description,
//             location,
//             priority: priority || 'Medium',
//             image,
//             user: req.user.id
//         });

//         await complaint.save();
//         res.status(201).json({ message: 'Complaint registered successfully!', complaint });
//     } catch (err) {
//         res.status(500).json({ error: err.message });
//     }
// };

// // Get all complaints (For Admin / Public feed)
// exports.getComplaints = async (req, res) => {
//     try {
//         const complaints = await Complaint.find().populate('user', 'name email phone').sort({ createdAt: -1 });
//         res.json(complaints);
//     } catch (err) {
//         res.status(500).json({ error: err.message });
//     }
// };

// // Update complaint status (Admin only)
// // exports.updateStatus = async (req, res) => {
// //     try {
// //         const { status } = req.body;
// //         const complaint = await Complaint.findByIdAndUpdate(
// //             req.params.id,
// //             { status },
// //             { new: true }
// //         );
// //         if (!complaint) return res.status(404).json({ message: 'Complaint not found' });
// //         res.json({ message: 'Complaint status updated!', complaint });
// //     } catch (err) {
// //         res.status(500).json({ error: err.message });
// //     }
// // };


// exports.updateStatus = async (req, res) => {
//     try {
//         const { status } = req.body;

//         const allowedStatuses = [
//             'Pending',
//             'In Progress',
//             'Resolved'
//         ];

//         if (!allowedStatuses.includes(status)) {
//             return res.status(400).json({
//                 message: 'Invalid complaint status'
//             });
//         }

//         const complaint = await Complaint.findByIdAndUpdate(
//             req.params.id,
//             { status },
//             {
//                 new: true,
//                 runValidators: true
//             }
//         ).populate('user', 'name email phone');

//         if (!complaint) {
//             return res.status(404).json({
//                 message: 'Complaint not found'
//             });
//         }

//         res.json({
//             message: 'Complaint status updated!',
//             complaint
//         });

//     } catch (err) {
//         res.status(500).json({
//             error: err.message
//         });
//     }
// };


const Complaint = require('../models/Complaint');

const allowedStatuses = ['Pending', 'In Progress', 'Resolved'];

exports.createComplaint = async (req, res) => {
  try {
    const { title, category, description, location, priority, latitude, longitude, lat, lng } = req.body;
    if (!title || !category || !description || !location) {
      return res.status(400).json({ message: 'Title, category, description and location are required.' });
    }
    const image = req.file ? req.file.filename : '';
    const complaint = await Complaint.create({
      title, category, description, location,
      priority: priority || 'Medium',
      image,
      user: req.user.id,
      ...(latitude != null && longitude != null ? { latitude: Number(latitude), longitude: Number(longitude) } :
        lat != null && lng != null ? { latitude: Number(lat), longitude: Number(lng) } : {})
    });
    return res.status(201).json({ message: 'Complaint registered successfully!', complaint });
  } catch (err) {
    return res.status(500).json({ message: 'Could not create complaint.', error: err.message });
  }
};

exports.getComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find()
      .populate('user', 'name email phone')
      .sort({ createdAt: -1 })
      .lean();
    return res.status(200).json(complaints);
  } catch (err) {
    return res.status(500).json({ message: 'Could not fetch complaints.', error: err.message });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid complaint status.' });
    }
    const complaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      { $set: { status } },
      { new: true, runValidators: true }
    ).populate('user', 'name email phone');

    if (!complaint) return res.status(404).json({ message: 'Complaint not found.' });
    return res.status(200).json({ message: 'Complaint status updated!', complaint });
  } catch (err) {
    return res.status(500).json({ message: 'Could not update complaint status.', error: err.message });
  }
};
