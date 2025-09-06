const express = require('express');
const router = express.Router();
const {
  getAllProjects,
  getFeaturedProjects,
  searchProjects,
  getProjectById,
  getProjectCategories,
  createProject,
  updateProject,
  deleteProject
} = require('../controllers/projectController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// Public routes
router.get('/', getAllProjects);
router.get('/featured', getFeaturedProjects);
router.get('/search', searchProjects);
router.get('/categories/list', getProjectCategories);
router.get('/:id', getProjectById);

// Protected routes (Admin only)
router.post('/', authenticateToken, requireAdmin, createProject);
router.put('/:id', authenticateToken, requireAdmin, updateProject);
router.delete('/:id', authenticateToken, requireAdmin, deleteProject);

module.exports = router;
