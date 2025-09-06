const express = require('express');
const router = express.Router();
const Project = require('../models/Project');

// @route   GET /api/projects
// @desc    Get all public projects
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { category, type, featured, limit = 12, page = 1 } = req.query;
    
    const filter = { isPublic: true };
    
    if (category) filter.category = category;
    if (type) filter.type = type;
    if (featured === 'true') filter.featured = true;
    
    const projects = await Project.find(filter)
      .select('-__v')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await Project.countDocuments(filter);
    
    res.json({
      success: true,
      count: projects.length,
      total,
      pages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      data: projects
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching projects',
      error: error.message 
    });
  }
});

// @route   GET /api/projects/featured
// @desc    Get featured projects
// @access  Public
router.get('/featured', async (req, res) => {
  try {
    const projects = await Project.find({ 
      isPublic: true, 
      featured: true 
    })
    .select('-__v')
    .sort({ createdAt: -1 })
    .limit(6);
    
    res.json({
      success: true,
      count: projects.length,
      data: projects
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching featured projects',
      error: error.message 
    });
  }
});

// @route   GET /api/projects/search
// @desc    Search projects
// @access  Public
router.get('/search', async (req, res) => {
  try {
    const { q, category, type } = req.query;
    
    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }
    
    const filter = { 
      isPublic: true,
      $text: { $search: q }
    };
    
    if (category) filter.category = category;
    if (type) filter.type = type;
    
    const projects = await Project.find(filter, { score: { $meta: 'textScore' } })
      .select('-__v')
      .sort({ score: { $meta: 'textScore' } })
      .limit(20);
    
    res.json({
      success: true,
      count: projects.length,
      data: projects
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error searching projects',
      error: error.message 
    });
  }
});

// @route   GET /api/projects/:id
// @desc    Get single project
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id).select('-__v');
    
    if (!project || !project.isPublic) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }
    
    res.json({
      success: true,
      data: project
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching project',
      error: error.message 
    });
  }
});

// @route   GET /api/projects/categories/list
// @desc    Get project categories and types
// @access  Public
router.get('/categories/list', async (req, res) => {
  try {
    const categories = await Project.distinct('category', { isPublic: true });
    const types = await Project.distinct('type', { isPublic: true });
    const tags = await Project.distinct('tags', { isPublic: true });
    
    res.json({
      success: true,
      data: {
        categories,
        types,
        tags: tags.filter(tag => tag).slice(0, 20) // Limit to 20 most common tags
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching categories',
      error: error.message 
    });
  }
});

module.exports = router;
