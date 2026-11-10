const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
    title: { type: String, required: true },
    category: { type: String, required: true }, // e.g., Garbage, Broken Streetlight, Manhole
    description: { type: String, required: true },
    location: { type: String, required: true }, // Area name / Address in Karachi
    // image: { type: String, required: true }, // Image URL or path
    image: {
  type: String,
  default: ''
},
    status: { type: String, enum: ['Pending', 'In Progress', 'Resolved'], default: 'Pending' },
    priority: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    resolutionImage: { type: String }, // After repair photo by admin
}, { timestamps: true });

module.exports = mongoose.model('Complaint', complaintSchema);