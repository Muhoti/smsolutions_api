const { Project } = require('../models/associations');
const { Op } = require('sequelize');

// @desc    Get all public projects
// @route   GET /api/projects
// @access  Public
const getAllProjects = async (req, res) => {
  try {
    const { category, type, featured, limit = 12, page = 1 } = req.query;
    
    const where = { isPublic: true };
    
    if (category) where.category = category;
    if (type) where.type = type;
    if (featured === 'true') where.featured = true;
    
    const offset = (page - 1) * limit;
    
    const { count, rows: projects } = await Project.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']],
      attributes: { exclude: ['updatedAt'] }
    });
    
    res.json({
      success: true,
      count: projects.length,
      total: count,
      pages: Math.ceil(count / limit),
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
    const projects = await Project.findAll({
      where: { 
        isPublic: true, 
        featured: true 
      },
      limit: 6,
      order: [['createdAt', 'DESC']],
      attributes: { exclude: ['updatedAt'] }
    });
    
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
    
    const where = { 
      isPublic: true,
      [Op.or]: [
        { title: { [Op.iLike]: `%${q}%` } },
        { description: { [Op.iLike]: `%${q}%` } },
        { clientName: { [Op.iLike]: `%${q}%` } },
        { clientCompany: { [Op.iLike]: `%${q}%` } }
      ]
    };
    
    if (category) where.category = category;
    if (type) where.type = type;
    
    const projects = await Project.findAll({
      where,
      limit: 20,
      order: [['createdAt', 'DESC']],
      attributes: { exclude: ['updatedAt'] }
    });
    
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
    const project = await Project.findOne({
      where: { 
        id: req.params.id,
        isPublic: true 
      },
      attributes: { exclude: ['updatedAt'] }
    });
    
    if (!project) {
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
    const categories = await Project.findAll({
      where: { isPublic: true },
      attributes: ['category'],
      group: ['category'],
      raw: true
    });
    
    const types = await Project.findAll({
      where: { isPublic: true },
      attributes: ['type'],
      group: ['type'],
      raw: true
    });
    
    const tags = await Project.findAll({
      where: { 
        isPublic: true,
        tags: { [Op.ne]: null }
      },
      attributes: ['tags'],
      raw: true
    });
    
    // Flatten and get unique tags
    const allTags = [...new Set(tags.flatMap(t => t.tags || []))].slice(0, 20);
    
    res.json({
      success: true,
      data: {
        categories: categories.map(c => c.category),
        types: types.map(t => t.type),
        tags: allTags
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
    const project = await Project.create(req.body);
    
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
    const project = await Project.findByPk(req.params.id);
    
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }
    
    await project.update(req.body);
    
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
    const project = await Project.findByPk(req.params.id);
    
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }
    
    await project.destroy();
    
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