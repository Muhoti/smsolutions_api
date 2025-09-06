const express = require('express');
const router = express.Router();
const {
  getAllTestimonials,
  getFeaturedTestimonials,
  getTestimonialById,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
  getTestimonialStats
} = require('../controllers/testimonialController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// Public routes
router.get('/', getAllTestimonials);
router.get('/featured', getFeaturedTestimonials);
router.get('/:id', getTestimonialById);

// Protected routes (Admin only)
router.post('/', authenticateToken, requireAdmin, createTestimonial);
router.put('/:id', authenticateToken, requireAdmin, updateTestimonial);
router.delete('/:id', authenticateToken, requireAdmin, deleteTestimonial);
router.get('/stats/overview', authenticateToken, requireAdmin, getTestimonialStats);

module.exports = router;