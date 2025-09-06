const express = require('express');
const router = express.Router();
const Testimonial = require('../models/Testimonial');

// @route   GET /api/testimonials
// @desc    Get all public testimonials
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { featured, limit = 10, page = 1 } = req.query;
    
    const filter = { isPublic: true };
    if (featured === 'true') filter.featured = true;
    
    const testimonials = await Testimonial.find(filter)
      .select('-__v')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await Testimonial.countDocuments(filter);
    
    res.json({
      success: true,
      count: testimonials.length,
      total,
      pages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      data: testimonials
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching testimonials',
      error: error.message 
    });
  }
});

// @route   GET /api/testimonials/featured
// @desc    Get featured testimonials
// @access  Public
router.get('/featured', async (req, res) => {
  try {
    const testimonials = await Testimonial.find({ 
      isPublic: true, 
      featured: true,
      verified: true
    })
    .select('-__v')
    .sort({ createdAt: -1 })
    .limit(6);
    
    res.json({
      success: true,
      count: testimonials.length,
      data: testimonials
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching featured testimonials',
      error: error.message 
    });
  }
});

// @route   GET /api/testimonials/:id
// @desc    Get single testimonial
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const testimonial = await Testimonial.findById(req.params.id).select('-__v');
    
    if (!testimonial || !testimonial.isPublic) {
      return res.status(404).json({
        success: false,
        message: 'Testimonial not found'
      });
    }
    
    res.json({
      success: true,
      data: testimonial
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching testimonial',
      error: error.message 
    });
  }
});

// @route   GET /api/testimonials/stats/ratings
// @desc    Get rating statistics
// @access  Public
router.get('/stats/ratings', async (req, res) => {
  try {
    const stats = await Testimonial.aggregate([
      { $match: { isPublic: true, verified: true } },
      {
        $group: {
          _id: '$rating',
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const total = await Testimonial.countDocuments({ isPublic: true, verified: true });
    const average = await Testimonial.aggregate([
      { $match: { isPublic: true, verified: true } },
      { $group: { _id: null, average: { $avg: '$rating' } } }
    ]);

    res.json({
      success: true,
      data: {
        total,
        average: average[0]?.average || 0,
        distribution: stats
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching rating statistics',
      error: error.message 
    });
  }
});

module.exports = router;
