const { Testimonial, Project } = require('../models/associations');
const { Op } = require('sequelize');

// @desc    Get all public testimonials
// @route   GET /api/testimonials
// @access  Public
const getAllTestimonials = async (req, res) => {
  try {
    const { featured, limit = 10, page = 1 } = req.query;
    
    const where = { isPublic: true };
    if (featured === 'true') where.featured = true;
    
    const offset = (page - 1) * limit;
    
    const { count, rows: testimonials } = await Testimonial.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']],
      include: [{
        model: Project,
        as: 'relatedProject',
        attributes: ['id', 'title', 'category']
      }],
      attributes: { exclude: ['updatedAt'] }
    });
    
    res.json({
      success: true,
      count: testimonials.length,
      total: count,
      pages: Math.ceil(count / limit),
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
    const testimonials = await Testimonial.findAll({
      where: { 
        isPublic: true, 
        featured: true 
      },
      limit: 6,
      order: [['createdAt', 'DESC']],
      include: [{
        model: Project,
        as: 'relatedProject',
        attributes: ['id', 'title', 'category']
      }],
      attributes: { exclude: ['updatedAt'] }
    });
    
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
    const testimonial = await Testimonial.findOne({
      where: { 
        id: req.params.id,
        isPublic: true 
      },
      include: [{
        model: Project,
        as: 'relatedProject',
        attributes: ['id', 'title', 'category', 'description']
      }],
      attributes: { exclude: ['updatedAt'] }
    });
    
    if (!testimonial) {
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
    const testimonial = await Testimonial.create(req.body);
    
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
    const testimonial = await Testimonial.findByPk(req.params.id);
    
    if (!testimonial) {
      return res.status(404).json({
        success: false,
        message: 'Testimonial not found'
      });
    }
    
    await testimonial.update(req.body);
    
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
    const testimonial = await Testimonial.findByPk(req.params.id);
    
    if (!testimonial) {
      return res.status(404).json({
        success: false,
        message: 'Testimonial not found'
      });
    }
    
    await testimonial.destroy();
    
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

// @desc    Toggle testimonial featured status
// @route   PUT /api/testimonials/:id/featured
// @access  Private (Admin)
const toggleFeatured = async (req, res) => {
  try {
    const testimonial = await Testimonial.findByPk(req.params.id);
    
    if (!testimonial) {
      return res.status(404).json({
        success: false,
        message: 'Testimonial not found'
      });
    }
    
    await testimonial.update({ featured: !testimonial.featured });
    
    res.json({
      success: true,
      message: `Testimonial ${testimonial.featured ? 'featured' : 'unfeatured'} successfully`,
      data: testimonial
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error toggling featured status',
      error: error.message
    });
  }
};

// @desc    Verify testimonial
// @route   PUT /api/testimonials/:id/verify
// @access  Private (Admin)
const verifyTestimonial = async (req, res) => {
  try {
    const testimonial = await Testimonial.findByPk(req.params.id);
    
    if (!testimonial) {
      return res.status(404).json({
        success: false,
        message: 'Testimonial not found'
      });
    }
    
    await testimonial.verify();
    
    res.json({
      success: true,
      message: 'Testimonial verified successfully',
      data: testimonial
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error verifying testimonial',
      error: error.message
    });
  }
};

// @desc    Get testimonial statistics
// @route   GET /api/testimonials/stats
// @access  Private (Admin)
const getTestimonialStats = async (req, res) => {
  try {
    const total = await Testimonial.count();
    const public = await Testimonial.count({ where: { isPublic: true } });
    const featured = await Testimonial.count({ where: { featured: true } });
    const verified = await Testimonial.count({ where: { verified: true } });
    
    // Get average rating
    const avgRating = await Testimonial.findOne({
      attributes: [
        [Testimonial.sequelize.fn('AVG', Testimonial.sequelize.col('rating')), 'average']
      ],
      raw: true
    });
    
    // Get rating distribution
    const ratingStats = await Testimonial.findAll({
      attributes: [
        'rating',
        [Testimonial.sequelize.fn('COUNT', Testimonial.sequelize.col('id')), 'count']
      ],
      group: ['rating'],
      order: [['rating', 'ASC']],
      raw: true
    });
    
    res.json({
      success: true,
      data: {
        total,
        public,
        featured,
        verified,
        averageRating: parseFloat(avgRating.average || 0).toFixed(1),
        ratingDistribution: ratingStats
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
  toggleFeatured,
  verifyTestimonial,
  getTestimonialStats
};