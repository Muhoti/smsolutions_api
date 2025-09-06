const Testimonial = require('../models/Testimonial');

// @desc    Get all testimonials
// @route   GET /api/testimonials
// @access  Public
const getAllTestimonials = async (req, res) => {
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
};

// @desc    Get featured testimonials
// @route   GET /api/testimonials/featured
// @access  Public
const getFeaturedTestimonials = async (req, res) => {
  try {
    const testimonials = await Testimonial.find({ 
      isPublic: true, 
      featured: true 
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
};

// @desc    Get single testimonial
// @route   GET /api/testimonials/:id
// @access  Public
const getTestimonialById = async (req, res) => {
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
};

// @desc    Create new testimonial
// @route   POST /api/testimonials
// @access  Private (Admin)
const createTestimonial = async (req, res) => {
  try {
    const testimonial = new Testimonial(req.body);
    await testimonial.save();
    
    res.status(201).json({
      success: true,
      message: 'Testimonial created successfully',
      data: testimonial
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error creating testimonial',
      error: error.message
    });
  }
};

// @desc    Update testimonial
// @route   PUT /api/testimonials/:id
// @access  Private (Admin)
const updateTestimonial = async (req, res) => {
  try {
    const testimonial = await Testimonial.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).select('-__v');
    
    if (!testimonial) {
      return res.status(404).json({
        success: false,
        message: 'Testimonial not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Testimonial updated successfully',
      data: testimonial
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error updating testimonial',
      error: error.message
    });
  }
};

// @desc    Delete testimonial
// @route   DELETE /api/testimonials/:id
// @access  Private (Admin)
const deleteTestimonial = async (req, res) => {
  try {
    const testimonial = await Testimonial.findByIdAndDelete(req.params.id);
    
    if (!testimonial) {
      return res.status(404).json({
        success: false,
        message: 'Testimonial not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Testimonial deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting testimonial',
      error: error.message
    });
  }
};

// @desc    Get testimonial statistics
// @route   GET /api/testimonials/stats
// @access  Private (Admin)
const getTestimonialStats = async (req, res) => {
  try {
    const total = await Testimonial.countDocuments();
    const public = await Testimonial.countDocuments({ isPublic: true });
    const featured = await Testimonial.countDocuments({ featured: true });
    const recent = await Testimonial.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
    });
    
    // Get average rating
    const ratingStats = await Testimonial.aggregate([
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$rating' },
          totalRatings: { $sum: 1 }
        }
      }
    ]);
    
    res.json({
      success: true,
      data: {
        total,
        public,
        featured,
        recent,
        averageRating: ratingStats[0]?.averageRating || 0,
        totalRatings: ratingStats[0]?.totalRatings || 0
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching testimonial statistics',
      error: error.message
    });
  }
};

module.exports = {
  getAllTestimonials,
  getFeaturedTestimonials,
  getTestimonialById,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
  getTestimonialStats
};
