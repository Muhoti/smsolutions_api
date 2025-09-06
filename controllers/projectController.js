const Project = require('../models/Project');

// @desc    Get all public projects
// @route   GET /api/projects
// @access  Public
const getAllProjects = async (req, res) => {
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
};

// @desc    Get featured projects
// @route   GET /api/projects/featured
// @access  Public
const getFeaturedProjects = async (req, res) => {
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
};

// @desc    Search projects
// @route   GET /api/projects/search
// @access  Public
const searchProjects = async (req, res) => {
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
};

// @desc    Get single project
// @route   GET /api/projects/:id
// @access  Public
const getProjectById = async (req, res) => {
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
};

// @desc    Get project categories and types
// @route   GET /api/projects/categories/list
// @access  Public
const getProjectCategories = async (req, res) => {
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
};

// @desc    Create new project
// @route   POST /api/projects
// @access  Private (Admin)
const createProject = async (req, res) => {
  try {
    const project = new Project(req.body);
    await project.save();
    
    res.status(201).json({
      success: true,
      message: 'Project created successfully',
      data: project
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error creating project',
      error: error.message
    });
  }
};

// @desc    Update project
// @route   PUT /api/projects/:id
// @access  Private (Admin)
const updateProject = async (req, res) => {
  try {
    const project = await Project.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).select('-__v');
    
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Project updated successfully',
      data: project
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error updating project',
      error: error.message
    });
  }
};

// @desc    Delete project
// @route   DELETE /api/projects/:id
// @access  Private (Admin)
const deleteProject = async (req, res) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);
    
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Project deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting project',
      error: error.message
    });
  }
};

module.exports = {
  getAllProjects,
  getFeaturedProjects,
  searchProjects,
  getProjectById,
  getProjectCategories,
  createProject,
  updateProject,
  deleteProject
};
