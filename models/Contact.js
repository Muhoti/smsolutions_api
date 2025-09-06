const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Contact = sequelize.define('Contact', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [2, 100]
    }
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      isEmail: true,
      notEmpty: true
    }
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  company: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  projectType: {
    type: DataTypes.ENUM('mobile', 'web', 'both', 'consultation', 'other'),
    allowNull: false
  },
  budget: {
    type: DataTypes.ENUM('under-10k', '10k-50k', '50k-100k', '100k-plus', 'flexible', 'confidential'),
    allowNull: true
  },
  timeline: {
    type: DataTypes.ENUM('asap', '1-month', '2-3-months', '3-6-months', '6-plus-months', 'flexible'),
    allowNull: true
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [10, 2000]
    }
  },
  status: {
    type: DataTypes.ENUM('new', 'in-progress', 'completed', 'closed'),
    defaultValue: 'new',
    allowNull: false
  },
  source: {
    type: DataTypes.STRING(50),
    defaultValue: 'website',
    allowNull: false
  },
  priority: {
    type: DataTypes.ENUM('low', 'medium', 'high', 'urgent'),
    defaultValue: 'medium',
    allowNull: false
  },
  assignedTo: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  followUpDate: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'contacts',
  timestamps: true,
  indexes: [
    {
      fields: ['status']
    },
    {
      fields: ['projectType']
    },
    {
      fields: ['priority']
    },
    {
      fields: ['createdAt']
    },
    {
      fields: ['email']
    }
  ]
});

// Instance methods
Contact.prototype.markAsInProgress = function() {
  this.status = 'in-progress';
  return this.save();
};

Contact.prototype.markAsCompleted = function() {
  this.status = 'completed';
  return this.save();
};

Contact.prototype.markAsClosed = function() {
  this.status = 'closed';
  return this.save();
};

module.exports = Contact;