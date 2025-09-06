const express = require('express');
const router = express.Router();
const {
  getAllContacts,
  getContactById,
  createContact,
  updateContact,
  deleteContact,
  getContactStats
} = require('../controllers/contactController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// Public routes
router.post('/', createContact);

// Protected routes (Admin only)
router.get('/', authenticateToken, requireAdmin, getAllContacts);
router.get('/stats', authenticateToken, requireAdmin, getContactStats);
router.get('/:id', authenticateToken, requireAdmin, getContactById);
router.put('/:id', authenticateToken, requireAdmin, updateContact);
router.delete('/:id', authenticateToken, requireAdmin, deleteContact);

module.exports = router;