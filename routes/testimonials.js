const express = require('express');
const router = express.Router();
const {
  getAllTestimonials,
  getFeaturedTestimonials,
  getTestimonialById,
  submitTestimonial,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
  getTestimonialStats
} = require('../controllers/testimonialController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { testimonialImageUpload } = require('../middleware/upload');

// Public routes
router.get('/', getAllTestimonials);
router.get('/featured', getFeaturedTestimonials);

// Public client submission (with required photo) — must precede '/:id'
router.post(
  '/submit',
  (req, res, next) => {
    testimonialImageUpload.single('image')(req, res, (err) => {
      if (err) {
        const isTooLarge = err.code === 'LIMIT_FILE_SIZE';
        return res.status(isTooLarge ? 413 : 400).json({
          success: false,
          message: isTooLarge
            ? 'Photo is too large. Maximum size is 10 MB.'
            : err.message || 'Photo upload failed',
        });
      }
      next();
    });
  },
  submitTestimonial
);

router.get('/:id', getTestimonialById);

// Protected routes (Admin only)
router.post('/', authenticateToken, requireAdmin, createTestimonial);
router.put('/:id', authenticateToken, requireAdmin, updateTestimonial);
router.delete('/:id', authenticateToken, requireAdmin, deleteTestimonial);
router.get('/stats/overview', authenticateToken, requireAdmin, getTestimonialStats);

module.exports = router;
