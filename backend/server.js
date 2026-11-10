

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// CORS
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Uploaded images
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
const authRoutes = require('./routes/authRoutes');
const complaintRoutes = require('./routes/complaintRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/complaints', complaintRoutes);

// Test route
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Mohalla Fix Backend is running!'
  });
});

// 404 route
app.use((req, res) => {
  res.status(404).json({
    message: 'Route not found.'
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('SERVER ERROR:', err);

  res.status(err.status || 500).json({
    message: err.message || 'Internal server error.'
  });
});

// Start server only after MongoDB connects
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI is missing in .env file.');
    }

    await mongoose.connect(process.env.MONGO_URI);

    console.log('MongoDB Connected Successfully to MohallaFix DB!');

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

  } catch (error) {
    console.error('Server startup failed:', error.message);
    process.exit(1);
  }
};

startServer();