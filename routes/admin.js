const express = require('express');
const router = express.Router();
const Contact = require('../models/Contact');
const Project = require('../models/Project');
const Testimonial = require('../models/Testimonial');

// Simple auth middleware (in production, use proper JWT middleware)
const authMiddleware = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. No token provided.'
    });
  }

  try {
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_key');
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Invalid token.'
    });
  }
};

// Apply auth middleware to all admin routes
router.use(authMiddleware);

// @route   GET /api/admin/dashboard
// @desc    Get admin dashboard data
// @access  Private
router.get('/dashboard', async (req, res) => {
  try {
    // Get contact statistics
    const contactStats = await Contact.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const totalContacts = await Contact.countDocuments();
    const newContacts = await Contact.countDocuments({ status: 'new' });
    const thisMonthContacts = await Contact.countDocuments({
      createdAt: { $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) }
    });

    // Get project statistics
    const totalProjects = await Project.countDocuments();
    const featuredProjects = await Project.countDocuments({ featured: true });
    const publicProjects = await Project.countDocuments({ isPublic: true });

    // Get testimonial statistics
    const totalTestimonials = await Testimonial.countDocuments();
    const verifiedTestimonials = await Testimonial.countDocuments({ verified: true });
    const featuredTestimonials = await Testimonial.countDocuments({ featured: true });

    // Recent contacts
    const recentContacts = await Contact.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name email projectType status createdAt');

    // Recent projects
    const recentProjects = await Project.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('title category status createdAt');

    res.json({
      success: true,
      data: {
        contacts: {
          total: totalContacts,
          new: newContacts,
          thisMonth: thisMonthContacts,
          byStatus: contactStats
        },
        projects: {
          total: totalProjects,
          featured: featuredProjects,
          public: publicProjects
        },
        testimonials: {
          total: totalTestimonials,
          verified: verifiedTestimonials,
          featured: featuredTestimonials
        },
        recent: {
          contacts: recentContacts,
          projects: recentProjects
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard data',
      error: error.message
    });
  }
});

// @route   GET /api/admin/contacts
// @desc    Get all contacts with filtering
// @access  Private
router.get('/contacts', async (req, res) => {
  try {
    const { 
      status, 
      priority, 
      projectType, 
      page = 1, 
      limit = 20,
      search 
    } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (projectType) filter.projectType = projectType;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } }
      ];
    }

    const contacts = await Contact.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('-__v');

    const total = await Contact.countDocuments(filter);

    res.json({
      success: true,
      count: contacts.length,
      total,
      pages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      data: contacts
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching contacts',
      error: error.message
    });
  }
});

// @route   PUT /api/admin/contacts/:id
// @desc    Update contact status/notes
// @access  Private
router.put('/contacts/:id', async (req, res) => {
  try {
    const { status, priority, notes, followUpDate, assignedTo } = req.body;

    const updateData = {};
    if (status) updateData.status = status;
    if (priority) updateData.priority = priority;
    if (followUpDate) updateData.followUpDate = followUpDate;
    if (assignedTo) updateData.assignedTo = assignedTo;
    if (notes) {
      updateData.$push = {
        notes: {
          text: notes,
          addedBy: req.user.email,
          addedAt: new Date()
        }
      };
    }

    const contact = await Contact.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact not found'
      });
    }

    res.json({
      success: true,
      message: 'Contact updated successfully',
      data: contact
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating contact',
      error: error.message
    });
  }
});

// @route   GET /api/admin/projects
// @desc    Get all projects for admin
// @access  Private
router.get('/projects', async (req, res) => {
  try {
    const { 
      status, 
      featured, 
      category, 
      page = 1, 
      limit = 20 
    } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (featured !== undefined) filter.featured = featured === 'true';
    if (category) filter.category = category;

    const projects = await Project.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('-__v');

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

// @route   POST /api/admin/projects
// @desc    Create new project
// @access  Private
router.post('/projects', async (req, res) => {
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
});

// @route   PUT /api/admin/projects/:id
// @desc    Update project
// @access  Private
router.put('/projects/:id', async (req, res) => {
  try {
    const project = await Project.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

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
});

// @route   DELETE /api/admin/projects/:id
// @desc    Delete project
// @access  Private
router.delete('/projects/:id', async (req, res) => {
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
});

module.exports = router;
