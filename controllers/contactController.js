const Contact = require('../models/Contact');
const nodemailer = require('nodemailer');

// @desc    Get all contact inquiries
// @route   GET /api/contact
// @access  Private (Admin)
const getAllContacts = async (req, res) => {
  try {
    const { status, projectType, limit = 20, page = 1 } = req.query;
    
    const filter = {};
    if (status) filter.status = status;
    if (projectType) filter.projectType = projectType;
    
    const contacts = await Contact.find(filter)
      .select('-__v')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await Contact.countDocuments(filter);
    
    res.json({
      success: true,
      count: contacts.length,
      total,
      pages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      data: contacts
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching contacts',
      error: error.message
    });
  }
};

// @desc    Get single contact
// @route   GET /api/contact/:id
// @access  Private (Admin)
const getContactById = async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id).select('-__v');
    
    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact not found'
      });
    }
    
    res.json({
      success: true,
      data: contact
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching contact',
      error: error.message
    });
  }
};

// @desc    Create new contact inquiry
// @route   POST /api/contact
// @access  Public
const createContact = async (req, res) => {
  try {
    const contact = new Contact(req.body);
    await contact.save();
    
    // Send email notification (optional)
    await sendContactNotification(contact);
    
    res.status(201).json({
      success: true,
      message: 'Thank you for your inquiry! We will get back to you soon.',
      data: contact
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error submitting inquiry',
      error: error.message
    });
  }
};

// @desc    Update contact status
// @route   PUT /api/contact/:id
// @access  Private (Admin)
const updateContact = async (req, res) => {
  try {
    const contact = await Contact.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).select('-__v');
    
    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Contact updated successfully',
      data: contact
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error updating contact',
      error: error.message
    });
  }
};

// @desc    Delete contact
// @route   DELETE /api/contact/:id
// @access  Private (Admin)
const deleteContact = async (req, res) => {
  try {
    const contact = await Contact.findByIdAndDelete(req.params.id);
    
    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Contact deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting contact',
      error: error.message
    });
  }
};

// @desc    Get contact statistics
// @route   GET /api/contact/stats
// @access  Private (Admin)
const getContactStats = async (req, res) => {
  try {
    const total = await Contact.countDocuments();
    const newInquiries = await Contact.countDocuments({ status: 'new' });
    const inProgress = await Contact.countDocuments({ status: 'in-progress' });
    const completed = await Contact.countDocuments({ status: 'completed' });
    
    // Get inquiries by project type
    const projectTypeStats = await Contact.aggregate([
      {
        $group: {
          _id: '$projectType',
          count: { $sum: 1 }
        }
      }
    ]);
    
    // Get monthly stats for the last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const monthlyStats = await Contact.aggregate([
      {
        $match: {
          createdAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);
    
    res.json({
      success: true,
      data: {
        total,
        newInquiries,
        inProgress,
        completed,
        projectTypeStats,
        monthlyStats
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching contact statistics',
      error: error.message
    });
  }
};

// Helper function to send email notification
const sendContactNotification = async (contact) => {
  try {
    // Only send if email is configured
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER) {
      console.log('Email not configured, skipping notification');
      return;
    }
    
    const transporter = nodemailer.createTransporter({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
    
    const mailOptions = {
      from: process.env.SMTP_USER,
      to: process.env.ADMIN_EMAIL || 'strongmuhoti@gmail.com',
      subject: `New Contact Inquiry from ${contact.name}`,
      html: `
        <h2>New Contact Inquiry</h2>
        <p><strong>Name:</strong> ${contact.name}</p>
        <p><strong>Email:</strong> ${contact.email}</p>
        <p><strong>Phone:</strong> ${contact.phone || 'Not provided'}</p>
        <p><strong>Company:</strong> ${contact.company || 'Not provided'}</p>
        <p><strong>Project Type:</strong> ${contact.projectType}</p>
        <p><strong>Message:</strong></p>
        <p>${contact.message}</p>
        <p><strong>Submitted:</strong> ${contact.createdAt}</p>
      `
    };
    
    await transporter.sendMail(mailOptions);
    console.log('Contact notification email sent');
  } catch (error) {
    console.error('Error sending contact notification:', error.message);
  }
};

module.exports = {
  getAllContacts,
  getContactById,
  createContact,
  updateContact,
  deleteContact,
  getContactStats
};
