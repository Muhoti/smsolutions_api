const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Simple admin user (in production, use proper user management)
const ADMIN_USER = {
  email: process.env.ADMIN_EMAIL || 'strongmuhoti@gmail.com',
  password: process.env.ADMIN_PASSWORD || 'admin123'
};

// @route   POST /api/auth/login
// @desc    Admin login
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Check if user exists and password is correct
    if (email !== ADMIN_USER.email) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const isPasswordValid = await bcrypt.compare(password, await bcrypt.hash(ADMIN_USER.password, 10));
    
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Create JWT token
    const token = jwt.sign(
      { 
        email: ADMIN_USER.email,
        role: 'admin'
      },
      process.env.JWT_SECRET || 'fallback_secret_key',
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          email: ADMIN_USER.email,
          role: 'admin'
        }
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error.message
    });
  }
});

// @route   POST /api/auth/verify
// @desc    Verify JWT token
// @access  Public
router.post('/verify', async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Token is required'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_key');
    
    res.json({
      success: true,
      data: {
        valid: true,
        user: decoded
      }
    });

  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Invalid token',
      data: {
        valid: false
      }
    });
  }
});

module.exports = router;
