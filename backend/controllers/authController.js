


const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// RESIDENT SIGNUP
exports.signup = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: 'Name, email and password are required'
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        message: 'Password must be at least 8 characters'
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await User.findOne({
      email: normalizedEmail
    });

    if (existingUser) {
      return res.status(409).json({
        message: 'Account already exists. Please login.'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      phone: phone || '',
      role: 'resident'
    });

    return res.status(201).json({
      message: 'Resident account created successfully'
    });

  } catch (error) {
    console.error('SIGNUP ERROR:', error);

    return res.status(500).json({
      message: 'Signup failed',
      error: error.message
    });
  }
};


// LOGIN
// exports.login = async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     if (!email || !password) {
//       return res.status(400).json({
//         message: 'Email and password are required'
//       });
//     }

//     const normalizedEmail = email.trim().toLowerCase();

//     const user = await User.findOne({
//       email: normalizedEmail
//     });

//     if (!user) {
//       return res.status(401).json({
//         message: 'Account not found. Please signup first.'
//       });
//     }

//     const isMatch = await bcrypt.compare(password, user.password);

//     if (!isMatch) {
//       return res.status(401).json({
//         message: 'Incorrect email or password'
//       });
//     }

//     // Mobile app sirf residents ke liye hai
//     if (user.role !== 'resident') {
//       return res.status(403).json({
//         message: 'Admin account cannot login in resident mobile app'
//       });
//     }

//     if (!process.env.JWT_SECRET) {
//       return res.status(500).json({
//         message: 'JWT_SECRET is missing in backend .env'
//       });
//     }

//     const token = jwt.sign(
//       {
//         id: user._id,
//         role: user.role
//       },
//       process.env.JWT_SECRET,
//       {
//         expiresIn: '7d'
//       }
//     );

//     return res.status(200).json({
//       message: 'Login successful',
//       token,
//       user: {
//         id: user._id,
//         name: user.name,
//         email: user.email,
//         role: user.role
//       }
//     });

//   } catch (error) {
//     console.error('LOGIN ERROR:', error);

//     return res.status(500).json({
//       message: 'Login failed',
//       error: error.message
//     });
//   }
// };



exports.login = async (req, res) => {
  try {
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = String(req.body.password || '');

    if (!email || !password) {
      return res.status(400).json({
        message: 'Email and password are required.'
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        message: 'Invalid email or password.'
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        message: 'Invalid email or password.'
      });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(200).json({
      message: 'Login successful!',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (err) {
    console.error('LOGIN ERROR:', err);

    return res.status(500).json({
      message: 'Server login error.'
    });
  }
};
