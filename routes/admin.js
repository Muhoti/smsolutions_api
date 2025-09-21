const express = require('express');
const router = express.Router();
const {
  getDashboard,
  getContacts,
  createContact,
  updateContact,
  getProjects,
  createProject,
  getTestimonials,
  createTestimonial,
  getSystemStats
} = require('../controllers/adminController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// Apply authentication and admin middleware to all admin routes
// Temporarily disabled for development - uncomment for production
// router.use(authenticateToken, requireAdmin);

// @route   GET /api/admin/dashboard
// @desc    Get admin dashboard data
// @access  Private (Admin)
router.get('/dashboard', getDashboard);
// new contact route
// @route   GET /api/admin/contacts
// @desc    Get all contacts with filtering
// @access  Private (Admin)
router.get('/contacts', getContacts);


router.post('/contacts', createContact);

// @route   PUT /api/admin/contacts/:id
// @desc    Update contact status/notes
// @access  Private (Admin)
router.put('/contacts/:id', updateContact);

// @route   GET /api/admin/projects
// @desc    Get all projects for admin
// @access  Private (Admin)
router.get('/projects', getProjects);

// @route   POST /api/admin/projects
// @desc    Create new project
// @access  Private (Admin)
router.post('/projects', createProject);

// @route   GET /api/admin/testimonials
// @desc    Get all testimonials for admin
// @access  Private (Admin)
router.get('/testimonials', getTestimonials);

// @route   POST /api/admin/testimonials
// @desc    Create new testimonial
// @access  Private (Admin)
router.post('/testimonials', createTestimonial);

// @route   GET /api/admin/stats
// @desc    Get system statistics
// @access  Private (Admin)
router.get('/stats', getSystemStats);

module.exports = router;