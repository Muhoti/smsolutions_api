const { Contact } = require('../models/associations');
const { Op } = require('sequelize');
const nodemailer = require('nodemailer');

// @desc    Get all contact inquiries
// @route   GET /api/contact
// @access  Private (Admin)
const getAllContacts = async (req, res) => {
  try {
    const { status, projectType, limit = 20, page = 1 } = req.query;
    
    const where = {};
    if (status) where.status = status;
    if (projectType) where.projectType = projectType;
    
    const offset = (page - 1) * limit;
    
    const { count, rows: contacts } = await Contact.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']],
      attributes: { exclude: ['updatedAt'] }
    });
    
    res.json({
      success: true,
      count: contacts.length,
      total: count,
      pages: Math.ceil(count / limit),
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
    const contact = await Contact.findByPk(req.params.id);
    
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
    const contact = await Contact.create(req.body);
    
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
    const contact = await Contact.findByPk(req.params.id);
    
    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact not found'
      });
    }
    
    await contact.update(req.body);
    
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
    const contact = await Contact.findByPk(req.params.id);
    
    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact not found'
      });
    }
    
    await contact.destroy();
    
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
    const total = await Contact.count();
    const newInquiries = await Contact.count({ where: { status: 'new' } });
    const inProgress = await Contact.count({ where: { status: 'in-progress' } });
    const completed = await Contact.count({ where: { status: 'completed' } });
    
    // Get inquiries by project type
    const projectTypeStats = await Contact.findAll({
      attributes: [
        'projectType',
        [Contact.sequelize.fn('COUNT', Contact.sequelize.col('id')), 'count']
      ],
      group: ['projectType'],
      raw: true
    });
    
    // Get monthly stats for the last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const monthlyStats = await Contact.findAll({
      attributes: [
        [Contact.sequelize.fn('EXTRACT', Contact.sequelize.literal('YEAR FROM "createdAt"')), 'year'],
        [Contact.sequelize.fn('EXTRACT', Contact.sequelize.literal('MONTH FROM "createdAt"')), 'month'],
        [Contact.sequelize.fn('COUNT', Contact.sequelize.col('id')), 'count']
      ],
      where: {
        createdAt: {
          [Op.gte]: sixMonthsAgo
        }
      },
      group: ['year', 'month'],
      order: [['year', 'ASC'], ['month', 'ASC']],
      raw: true
    });
    
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
    if (!process.env.MAIL_HOST || !process.env.MAIL_USERNAME) {
      console.log('Email not configured, skipping notification');
      return;
    }
    
    const transporter = nodemailer.createTransporter({
      host: process.env.MAIL_HOST,
      port: process.env.MAIL_PORT || 587,
      secure: process.env.MAIL_ENCRYPTION === 'ssl',
      auth: {
        user: process.env.MAIL_USERNAME,
        pass: process.env.MAIL_PASSWORD
      }
    });
    
    const mailOptions = {
      from: `"${process.env.MAIL_FROM_NAME}" <${process.env.MAIL_FROM_ADDRESS}>`,
      to: process.env.MAIL_FROM_ADDRESS,
      subject: `New Contact Inquiry from ${contact.name}`,
      html: `
        <h2>New Contact Inquiry</h2>
        <p><strong>Name:</strong> ${contact.name}</p>
        <p><strong>Email:</strong> ${contact.email}</p>
        <p><strong>Phone:</strong> ${contact.phone || 'Not provided'}</p>
        <p><strong>Company:</strong> ${contact.company || 'Not provided'}</p>
        <p><strong>Project Type:</strong> ${contact.projectType}</p>
        <p><strong>Budget:</strong> ${contact.budget || 'Not specified'}</p>
        <p><strong>Timeline:</strong> ${contact.timeline || 'Not specified'}</p>
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