const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const Complaint = require('./models/Complaint');

const app = express();

// Middleware - CORS configuration to allow Web and Mobile clients without issues
app.use(cors({
  origin: '*', // Allows connections from any frontend (React Vite, Expo Mobile App)
  credentials: true
}));

app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Routes
const authRoutes = require('./routes/authRoutes');
const complaintRoutes = require('./routes/complaintRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/complaints', complaintRoutes);

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
.then(() => {
    console.log('MongoDB Connected Successfully to MohallaFix DB!');
})
.catch((err) => {
    console.error('MongoDB Connection Failed:', err);
});

// Test Route / Direct Complaints Route
app.get('/api/complaints-test', async (req, res) => {
  try {
    const complaints = await Complaint.find();
    res.status(200).json(complaints);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update Complaint Status Route
app.put('/api/complaints/:id', async (req, res) => {
  try {
    const { status } = req.body;
    const updatedComplaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!updatedComplaint) {
      return res.status(404).json({ error: 'Complaint not found' });
    }
    res.status(200).json(updatedComplaint);
  } catch (err) {
    console.error("Backend Error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// Port Listen
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});