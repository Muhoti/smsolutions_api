const express = require('express');
const router = express.Router();
const Contact = require('../models/Contact');
const nodemailer = require('nodemailer');

// Create email transporter
const createTransporter = () => {
  return nodemailer.createTransporter({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: process.env.EMAIL_PORT || 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

// @route   POST /api/contact
// @desc    Submit contact form
// @access  Public
router.post('/', async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      company,
      projectType,
      budget,
      timeline,
      message
    } = req.body;

    // Validate required fields
    if (!name || !email || !projectType || !message) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, project type, and message are required'
      });
    }

    // Create contact record
    const contact = new Contact({
      name,
      email,
      phone,
      company,
      projectType,
      budget,
      timeline,
      message,
      source: 'website'
    });

    await contact.save();

    // Send email notification
    try {
      const transporter = createTransporter();
      
      const mailOptions = {
        from: process.env.EMAIL_FROM || 'Strong Muhoti <strongmuhoti@gmail.com>',
        to: process.env.ADMIN_EMAIL || 'strongmuhoti@gmail.com',
        subject: `New Project Inquiry from ${name}`,
        html: `
          <h2>New Project Inquiry</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
          <p><strong>Company:</strong> ${company || 'Not provided'}</p>
          <p><strong>Project Type:</strong> ${projectType}</p>
          <p><strong>Budget:</strong> ${budget || 'Not specified'}</p>
          <p><strong>Timeline:</strong> ${timeline || 'Not specified'}</p>
          <p><strong>Message:</strong></p>
          <p>${message}</p>
          <hr>
          <p><em>This inquiry was submitted through your website contact form.</em></p>
        `
      };

      await transporter.sendMail(mailOptions);

      // Send confirmation email to client
      const confirmationMailOptions = {
        from: process.env.EMAIL_FROM || 'Strong Muhoti <strongmuhoti@gmail.com>',
        to: email,
        subject: 'Thank you for your inquiry - Strong Muhoti',
        html: `
          <h2>Thank you for your inquiry!</h2>
          <p>Hi ${name},</p>
          <p>Thank you for reaching out about your ${projectType} project. I've received your message and will get back to you within 24 hours.</p>
          <p>In the meantime, feel free to check out my portfolio at <a href="${process.env.FRONTEND_URL}">${process.env.FRONTEND_URL}</a></p>
          <p>Best regards,<br>Strong Muhoti<br>App Development Expert</p>
        `
      };

      await transporter.sendMail(confirmationMailOptions);

    } catch (emailError) {
      console.error('Email sending error:', emailError);
      // Don't fail the request if email fails
    }

    res.status(201).json({
      success: true,
      message: 'Thank you for your inquiry! I will get back to you within 24 hours.',
      data: {
        id: contact._id,
        status: contact.status
      }
    });

  } catch (error) {
    console.error('Contact form error:', error);
    res.status(500).json({
      success: false,
      message: 'Error submitting contact form',
      error: error.message
    });
  }
});

// @route   GET /api/contact/stats
// @desc    Get contact statistics (for admin)
// @access  Private (should be protected in production)
router.get('/stats', async (req, res) => {
  try {
    const total = await Contact.countDocuments();
    const newInquiries = await Contact.countDocuments({ status: 'new' });
    const inProgress = await Contact.countDocuments({ status: 'in-progress' });
    const thisMonth = await Contact.countDocuments({
      createdAt: { $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) }
    });

    const projectTypeStats = await Contact.aggregate([
      { $group: { _id: '$projectType', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    const budgetStats = await Contact.aggregate([
      { $group: { _id: '$budget', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    res.json({
      success: true,
      data: {
        total,
        newInquiries,
        inProgress,
        thisMonth,
        projectTypeStats,
        budgetStats
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching contact statistics',
      error: error.message
    });
  }
});

module.exports = router;
