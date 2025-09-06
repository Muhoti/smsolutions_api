const express = require('express');
const router = express.Router();
const {
  getDashboard,
  getContacts,
  updateContact,
  getProjects,
  getTestimonials,
  getSystemStats
} = require('../controllers/adminController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// Apply authentication and admin middleware to all admin routes
router.use(authenticateToken, requireAdmin);

// @route   GET /api/admin/dashboard
// @desc    Get admin dashboard data
// @access  Private (Admin)
router.get('/dashboard', getDashboard);

// @route   GET /api/admin/contacts
// @desc    Get all contacts with filtering
// @access  Private (Admin)
router.get('/contacts', getContacts);

// @route   PUT /api/admin/contacts/:id
// @desc    Update contact status/notes
// @access  Private (Admin)
router.put('/contacts/:id', updateContact);

// @route   GET /api/admin/projects
// @desc    Get all projects for admin
// @access  Private (Admin)
router.get('/projects', getProjects);

// @route   GET /api/admin/testimonials
// @desc    Get all testimonials for admin
// @access  Private (Admin)
router.get('/testimonials', getTestimonials);

// @route   GET /api/admin/stats
// @desc    Get system statistics
// @access  Private (Admin)
router.get('/stats', getSystemStats);

module.exports = router;