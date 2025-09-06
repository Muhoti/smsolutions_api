const { Contact, Project, Testimonial, User } = require('../models/associations');
const { Op } = require('sequelize');

// @desc    Get admin dashboard data
// @route   GET /api/admin/dashboard
// @access  Private (Admin)
const getDashboard = async (req, res) => {
  try {
    // Get contact statistics
    const totalContacts = await Contact.count();
    const newContacts = await Contact.count({ where: { status: 'new' } });
    const thisMonthContacts = await Contact.count({
      where: {
        createdAt: {
          [Op.gte]: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
        }
      }
    });

    // Get contact status breakdown
    const contactStatusStats = await Contact.findAll({
      attributes: [
        'status',
        [Contact.sequelize.fn('COUNT', Contact.sequelize.col('id')), 'count']
      ],
      group: ['status'],
      raw: true
    });

    // Get project statistics
    const totalProjects = await Project.count();
    const featuredProjects = await Project.count({ where: { featured: true } });
    const publicProjects = await Project.count({ where: { isPublic: true } });

    // Get project status breakdown
    const projectStatusStats = await Project.findAll({
      attributes: [
        'status',
        [Project.sequelize.fn('COUNT', Project.sequelize.col('id')), 'count']
      ],
      group: ['status'],
      raw: true
    });

    // Get testimonial statistics
    const totalTestimonials = await Testimonial.count();
    const verifiedTestimonials = await Testimonial.count({ where: { verified: true } });
    const featuredTestimonials = await Testimonial.count({ where: { featured: true } });

    // Recent contacts
    const recentContacts = await Contact.findAll({
      order: [['createdAt', 'DESC']],
      limit: 5,
      attributes: ['id', 'name', 'email', 'projectType', 'status', 'createdAt']
    });

    // Recent projects
    const recentProjects = await Project.findAll({
      order: [['createdAt', 'DESC']],
      limit: 5,
      attributes: ['id', 'title', 'category', 'status', 'createdAt']
    });

    // Recent testimonials
    const recentTestimonials = await Testimonial.findAll({
      order: [['createdAt', 'DESC']],
      limit: 5,
      attributes: ['id', 'name', 'company', 'rating', 'verified', 'createdAt']
    });

    // Monthly stats for the last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyContacts = await Contact.findAll({
      attributes: [
        [Contact.sequelize.fn('EXTRACT', Contact.sequelize.literal('YEAR FROM "createdAt"')), 'year'],
        [Contact.sequelize.fn('EXTRACT', Contact.sequelize.literal('MONTH FROM "createdAt"')), 'month'],
        [Contact.sequelize.fn('COUNT', Contact.sequelize.col('id')), 'count']
      ],
      where: {
        createdAt: {
          [Op.gte]: sixMonthsAgo
        }
      },
      group: ['year', 'month'],
      order: [['year', 'ASC'], ['month', 'ASC']],
      raw: true
    });

    const monthlyProjects = await Project.findAll({
      attributes: [
        [Project.sequelize.fn('EXTRACT', Project.sequelize.literal('YEAR FROM "createdAt"')), 'year'],
        [Project.sequelize.fn('EXTRACT', Project.sequelize.literal('MONTH FROM "createdAt"')), 'month'],
        [Project.sequelize.fn('COUNT', Project.sequelize.col('id')), 'count']
      ],
      where: {
        createdAt: {
          [Op.gte]: sixMonthsAgo
        }
      },
      group: ['year', 'month'],
      order: [['year', 'ASC'], ['month', 'ASC']],
      raw: true
    });

    res.json({
      success: true,
      data: {
        contacts: {
          total: totalContacts,
          new: newContacts,
          thisMonth: thisMonthContacts,
          byStatus: contactStatusStats
        },
        projects: {
          total: totalProjects,
          featured: featuredProjects,
          public: publicProjects,
          byStatus: projectStatusStats
        },
        testimonials: {
          total: totalTestimonials,
          verified: verifiedTestimonials,
          featured: featuredTestimonials
        },
        recent: {
          contacts: recentContacts,
          projects: recentProjects,
          testimonials: recentTestimonials
        },
        analytics: {
          monthlyContacts,
          monthlyProjects
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
};

// @desc    Get all contacts with filtering
// @route   GET /api/admin/contacts
// @access  Private (Admin)
const getContacts = async (req, res) => {
  try {
    const { 
      status, 
      priority, 
      projectType, 
      page = 1, 
      limit = 20,
      search 
    } = req.query;

    const where = {};
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (projectType) where.projectType = projectType;
    if (search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } },
        { company: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const offset = (page - 1) * limit;

    const { count, rows: contacts } = await Contact.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']],
      attributes: { exclude: ['updatedAt'] }
    });

    res.json({
      success: true,
      count: contacts.length,
      total: count,
      pages: Math.ceil(count / limit),
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
};

// @desc    Update contact status/notes
// @route   PUT /api/admin/contacts/:id
// @access  Private (Admin)
const updateContact = async (req, res) => {
  try {
    const { status, priority, notes, followUpDate, assignedTo } = req.body;

    const contact = await Contact.findByPk(req.params.id);
    
    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact not found'
      });
    }

    const updateData = {};
    if (status) updateData.status = status;
    if (priority) updateData.priority = priority;
    if (followUpDate) updateData.followUpDate = followUpDate;
    if (assignedTo) updateData.assignedTo = assignedTo;
    if (notes) {
      // For notes, we'll store as a simple text field
      // In a more complex system, you might want a separate Notes table
      updateData.notes = notes;
    }

    await contact.update(updateData);

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
};

// @desc    Get all projects for admin
// @route   GET /api/admin/projects
// @access  Private (Admin)
const getProjects = async (req, res) => {
  try {
    const { 
      status, 
      featured, 
      category, 
      page = 1, 
      limit = 20,
      search 
    } = req.query;

    const where = {};
    if (status) where.status = status;
    if (featured !== undefined) where.featured = featured === 'true';
    if (category) where.category = category;
    if (search) {
      where[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } },
        { clientName: { [Op.iLike]: `%${search}%` } }
      ];
    }

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

// @desc    Get all testimonials for admin
// @route   GET /api/admin/testimonials
// @access  Private (Admin)
const getTestimonials = async (req, res) => {
  try {
    const { 
      featured, 
      verified, 
      page = 1, 
      limit = 20,
      search 
    } = req.query;

    const where = {};
    if (featured !== undefined) where.featured = featured === 'true';
    if (verified !== undefined) where.verified = verified === 'true';
    if (search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { company: { [Op.iLike]: `%${search}%` } },
        { review: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const offset = (page - 1) * limit;

    const { count, rows: testimonials } = await Testimonial.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']],
      include: [{
        model: Project,
        as: 'project',
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

// @desc    Get system statistics
// @route   GET /api/admin/stats
// @access  Private (Admin)
const getSystemStats = async (req, res) => {
  try {
    // Get total counts
    const totalContacts = await Contact.count();
    const totalProjects = await Project.count();
    const totalTestimonials = await Testimonial.count();
    const totalUsers = await User.count();

    // Get status breakdowns
    const contactStatusBreakdown = await Contact.findAll({
      attributes: [
        'status',
        [Contact.sequelize.fn('COUNT', Contact.sequelize.col('id')), 'count']
      ],
      group: ['status'],
      raw: true
    });

    const projectStatusBreakdown = await Project.findAll({
      attributes: [
        'status',
        [Project.sequelize.fn('COUNT', Project.sequelize.col('id')), 'count']
      ],
      group: ['status'],
      raw: true
    });

    const projectCategoryBreakdown = await Project.findAll({
      attributes: [
        'category',
        [Project.sequelize.fn('COUNT', Project.sequelize.col('id')), 'count']
      ],
      group: ['category'],
      raw: true
    });

    // Get recent activity (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentContacts = await Contact.count({
      where: {
        createdAt: {
          [Op.gte]: thirtyDaysAgo
        }
      }
    });

    const recentProjects = await Project.count({
      where: {
        createdAt: {
          [Op.gte]: thirtyDaysAgo
        }
      }
    });

    const recentTestimonials = await Testimonial.count({
      where: {
        createdAt: {
          [Op.gte]: thirtyDaysAgo
        }
      }
    });

    res.json({
      success: true,
      data: {
        totals: {
          contacts: totalContacts,
          projects: totalProjects,
          testimonials: totalTestimonials,
          users: totalUsers
        },
        breakdowns: {
          contactStatus: contactStatusBreakdown,
          projectStatus: projectStatusBreakdown,
          projectCategory: projectCategoryBreakdown
        },
        recent: {
          contacts: recentContacts,
          projects: recentProjects,
          testimonials: recentTestimonials
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching system statistics',
      error: error.message
    });
  }
};

module.exports = {
  getDashboard,
  getContacts,
  updateContact,
  getProjects,
  getTestimonials,
  getSystemStats
};
