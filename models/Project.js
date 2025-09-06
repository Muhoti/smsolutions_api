const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Project = sequelize.define('Project', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [1, 100]
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [1, 500]
    }
  },
  category: {
    type: DataTypes.ENUM('mobile', 'web', 'both', 'consultation'),
    allowNull: false
  },
  type: {
    type: DataTypes.ENUM('ios', 'android', 'web', 'pwa', 'cross-platform'),
    allowNull: false
  },
  techStack: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: []
  },
  images: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  },
  liveDemo: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  playStore: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  appStore: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  github: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  figma: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  clientName: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  clientCompany: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  clientIndustry: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('planning', 'development', 'testing', 'completed', 'maintenance'),
    defaultValue: 'planning',
    allowNull: false
  },
  featured: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false
  },
  startDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  endDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  budget: {
    type: DataTypes.ENUM('under-10k', '10k-50k', '50k-100k', '100k-plus', 'confidential'),
    allowNull: true
  },
  resultsDescription: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  resultsMetrics: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  },
  testimonialText: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  testimonialClient: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  testimonialPosition: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  testimonialCompany: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  tags: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  },
  isPublic: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    allowNull: false
  }
}, {
  tableName: 'projects',
  timestamps: true,
  indexes: [
    {
      fields: ['category']
    },
    {
      fields: ['type']
    },
    {
      fields: ['featured']
    },
    {
      fields: ['isPublic']
    },
    {
      fields: ['status']
    }
  ]
});

// Instance methods
Project.prototype.getDuration = function() {
  if (this.startDate && this.endDate) {
    const diffTime = Math.abs(this.endDate - this.startDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }
  return null;
};

module.exports = Project;