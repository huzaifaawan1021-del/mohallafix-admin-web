
// const Complaint = require('../models/Complaint');

// const allowedStatuses = [
//   'Pending',
//   'In Progress',
//   'Resolved'
// ];

// // CREATE COMPLAINT
// exports.createComplaint = async (req, res) => {
//   try {



//     const {
//       title,
//       category,
//       description,
//       location,
//       priority,
//       latitude,
//       longitude,
//       lat,
//       lng
//     } = req.body;

//     if (!title || !category || !description || !location) {
//       return res.status(400).json({
//         message: 'Please fill all required fields.'
//       });
//     }

//     if (!req.user || !req.user._id) {
//       return res.status(401).json({
//         message: 'Please login first.'
//       });
//     }

//     const complaintData = {
//       title: title.trim(),
//       category,
//       description: description.trim(),
//       location: location.trim(),
//       priority: priority || 'Medium',
//       image: req.file ? req.file.filename : '',
//       user: req.user._id
//     };

//     const finalLat = latitude ?? lat;
//     const finalLng = longitude ?? lng;

//     if (finalLat !== undefined && finalLng !== undefined) {
//       const parsedLat = Number(finalLat);
//       const parsedLng = Number(finalLng);

//       if (
//         !Number.isFinite(parsedLat) ||
//         !Number.isFinite(parsedLng)
//       ) {
//         return res.status(400).json({
//           message: 'Invalid location coordinates.'
//         });
//       }

//       complaintData.latitude = parsedLat;
//       complaintData.longitude = parsedLng;
//     }

//     const complaint = await Complaint.create(complaintData);

//     return res.status(201).json({
//       success: true,
//       message: 'Complaint registered successfully!',
//       complaint
//     });

//   } catch (error) {
//     console.error('CREATE COMPLAINT ERROR:', error);

//     return res.status(500).json({
//       message: 'Could not create complaint.',
//       error: error.message
//     });
//   }
// };


// // GET COMPLAINTS
// // exports.getComplaints = async (req, res) => {
// //   try {
// //     const complaints = await Complaint.find({
// //       user: req.user._id
// //     })
// //       .sort({ createdAt: -1 })
// //       .lean();

// //     return res.status(200).json({
// //       success: true,
// //       complaints
// //     });

// //   } catch (error) {
// //     console.error('GET COMPLAINTS ERROR:', error);

// //     return res.status(500).json({
// //       message: 'Could not fetch complaints.'
// //     });
// //   }
// // };


// // // UPDATE COMPLAINT STATUS
// // exports.updateStatus = async (req, res) => {
// //   try {
// //     if (req.user.role !== 'admin') {
// //       return res.status(403).json({
// //         message: 'Only admin can update complaint status.'
// //       });
// //     }

// //     const { status } = req.body;

// //     if (!allowedStatuses.includes(status)) {
// //       return res.status(400).json({
// //         message: 'Invalid complaint status.'
// //       });
// //     }

// //     const complaint = await Complaint.findByIdAndUpdate(
// //       req.params.id,
// //       { status },
// //       {
// //         new: true,
// //         runValidators: true
// //       }
// //     );

// //     if (!complaint) {
// //       return res.status(404).json({
// //         message: 'Complaint not found.'
// //       });
// //     }

// //     return res.status(200).json({
// //       success: true,
// //       message: 'Complaint status updated!',
// //       complaint
// //     });

// //   } catch (error) {
// //     console.error('UPDATE STATUS ERROR:', error);

//     // return res.status(500).json({/
// //       message: 'Could not update complaint status.'
// //     });
// //   }
// // };


// // GET COMPLAINTS
// exports.getComplaints = async (req, res) => {

//   const complaints = await Complaint.find(filter)
//   .populate('user', 'name email')
//   .sort({ createdAt: -1 })
//   .lean();

//   try {

//     console.log("API USER ID:", req.user?._id);
// console.log("API USER ROLE:", req.user?.role);
// console.log("API FILTER:", req.user?.role === 'admin' ? {} : { user: req.user?._id });

//     if (!req.user || !req.user._id) {
//       return res.status(401).json({
//         success: false,
//         message: 'Please login first.'
//       });
//     }

//     // Admin gets all complaints.
//     // Resident gets only their own complaints.
//     const filter = req.user.role === 'admin'
//       ? {}
//       : { user: req.user._id };

//     const complaints = await Complaint.find(filter)
//       .sort({ createdAt: -1 })
//       .lean();

//     return res.status(200).json({
//       success: true,
//       count: complaints.length,
//       complaints
//     });

//   } catch (error) {
//     console.error('GET COMPLAINTS ERROR:', error);

//     return res.status(500).json({
//       success: false,
//       message: 'Could not fetch complaints.'
//     });
//   }
// };


// // UPDATE COMPLAINT STATUS
// exports.updateStatus = async (req, res) => {
//   try {
//     if (!req.user || req.user.role !== 'admin') {
//       return res.status(403).json({
//         success: false,
//         message: 'Only admin can update complaint status.'
//       });
//     }

//     const { status } = req.body;

//     if (!allowedStatuses.includes(status)) {
//       return res.status(400).json({
//         success: false,
//         message: 'Invalid complaint status.'
//       });
//     }

//     const complaint = await Complaint.findByIdAndUpdate(
//       req.params.id,
//       { status },
//       {
//         new: true,
//         runValidators: true
//       }
//     );

//     if (!complaint) {
//       return res.status(404).json({
//         success: false,
//         message: 'Complaint not found.'
//       });
//     }

//     return res.status(200).json({
//       success: true,
//       message: 'Complaint status updated!',
//       complaint
//     });

//   } catch (error) {
//     console.error('UPDATE STATUS ERROR:', error);

//     return res.status(500).json({
//       success: false,
//       message: 'Could not update complaint status.'
//     });
//   }
// };



const Complaint = require('../models/Complaint');

const allowedStatuses = [
  'Pending',
  'In Progress',
  'Resolved'
];

// CREATE COMPLAINT
exports.createComplaint = async (req, res) => {
  try {
    const {
      title,
      category,
      description,
      location,
      priority,
      latitude,
      longitude,
      lat,
      lng
    } = req.body;

    if (
      !title?.trim() ||
      !category?.trim() ||
      !description?.trim() ||
      !location?.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: 'Please fill all required fields.'
      });
    }

    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: 'Please login first.'
      });
    }

    const complaintData = {
      title: title.trim(),
      category: category.trim(),
      description: description.trim(),
      location: location.trim(),
      priority: priority || 'Medium',
      image: req.file ? req.file.filename : '',
      user: req.user._id
    };

    const finalLat = latitude ?? lat;
    const finalLng = longitude ?? lng;

    if (finalLat !== undefined && finalLng !== undefined) {
      const parsedLat = Number(finalLat);
      const parsedLng = Number(finalLng);

      if (
        !Number.isFinite(parsedLat) ||
        !Number.isFinite(parsedLng) ||
        parsedLat < -90 ||
        parsedLat > 90 ||
        parsedLng < -180 ||
        parsedLng > 180
      ) {
        return res.status(400).json({
          success: false,
          message: 'Invalid location coordinates.'
        });
      }

      complaintData.latitude = parsedLat;
      complaintData.longitude = parsedLng;
    }

    const complaint = await Complaint.create(complaintData);

    return res.status(201).json({
      success: true,
      message: 'Complaint registered successfully!',
      complaint
    });

  } catch (error) {
    console.error('CREATE COMPLAINT ERROR:', error);

    return res.status(500).json({
      success: false,
      message: 'Could not create complaint.'
    });
  }
};


// GET COMPLAINTS
// exports.getComplaints = async (req, res) => {
//   try {
//     if (!req.user || !req.user._id) {
//       return res.status(401).json({
//         success: false,
//         message: 'Please login first.'
//       });
//     }

//     // Admin gets all complaints.
//     // Resident gets only their own complaints.
//     const filter = req.user.role === 'admin'
//       ? {}
//       : { user: req.user._id };

//     console.log('API USER ID:', req.user._id);
//     console.log('API USER ROLE:', req.user.role);
//     console.log('API FILTER:', filter);

//     const complaints = await Complaint.find(filter)
//       .populate('user', 'name email')
//       .sort({ createdAt: -1 })
//       .lean();

//     return res.status(200).json({
//       success: true,
//       count: complaints.length,
//       complaints
//     });

//   } catch (error) {
//     console.error('GET COMPLAINTS ERROR:', error);

//     return res.status(500).json({
//       success: false,
//       message: 'Could not fetch complaints.'
//     });
//   }
// };


// // UPDATE COMPLAINT STATUS
// exports.updateStatus = async (req, res) => {
//   try {
//     if (!req.user || req.user.role !== 'admin') {
//       return res.status(403).json({
//         success: false,
//         message: 'Only admin can update complaint status.'
//       });
//     }

//     const { status } = req.body;

//     if (!allowedStatuses.includes(status)) {
//       return res.status(400).json({
//         success: false,
//         message: 'Invalid complaint status.'
//       });
//     }

//     const complaint = await Complaint.findByIdAndUpdate(
//       req.params.id,
//       { status },
//       {
//         new: true,
//         runValidators: true
//       }
//     ).populate('user', 'name email');

//     if (!complaint) {
//       return res.status(404).json({
//         success: false,
//         message: 'Complaint not found.'
//       });
//     }

//     return res.status(200).json({
//       success: true,
//       message: 'Complaint status updated!',
//       complaint
//     });

//   } catch (error) {
//     console.error('UPDATE STATUS ERROR:', error);

//     return res.status(500).json({
//       success: false,
//       message: 'Could not update complaint status.'
//     });
//   }
// };


// GET COMPLAINTS
exports.getComplaints = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: 'Please login first.'
      });
    }

    // Check total complaints in the connected database
    const totalInDatabase = await Complaint.countDocuments({});

    const filter = req.user.role === 'admin'
      ? {}
      : { user: req.user._id };

    const complaints = await Complaint.find(filter)
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .lean();

    console.log('========== COMPLAINT DEBUG ==========');
    console.log('Logged-in role:', req.user.role);
    console.log('Logged-in user ID:', req.user._id);
    console.log('Total complaints in DB:', totalInDatabase);
    console.log('Filter:', filter);
    console.log('Complaints returned:', complaints.length);
    console.log('=====================================');

    return res.status(200).json({
      success: true,
      totalInDatabase,
      count: complaints.length,
      complaints
    });

  } catch (error) {
    console.error('GET COMPLAINTS ERROR:', error);

    return res.status(500).json({
      success: false,
      message: 'Could not fetch complaints.'
    });
  }
};



// UPDATE COMPLAINT STATUS
exports.updateStatus = async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only admin can update complaint status.'
      });
    }

    const { status } = req.body;

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid complaint status.'
      });
    }

    const complaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      { status },
      {
        new: true,
        runValidators: true
      }
    ).populate('user', 'name email');

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found.'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Complaint status updated!',
      complaint
    });

  } catch (error) {
    console.error('UPDATE STATUS ERROR:', error);

    return res.status(500).json({
      success: false,
      message: 'Could not update complaint status.'
    });
  }
};
