const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Testimonial = sequelize.define('Testimonial', {
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
  title: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  company: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  project: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  review: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [10, 1000]
    }
  },
  rating: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 5,
    validate: {
      min: 1,
      max: 5
    }
  },
  avatarUrl: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  featured: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false
  },
  isPublic: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    allowNull: false
  },
  projectId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'projects',
      key: 'id'
    }
  },
  verified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false
  },
  socialProof: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {}
  }
}, {
  tableName: 'testimonials',
  timestamps: true,
  indexes: [
    {
      fields: ['featured']
    },
    {
      fields: ['isPublic']
    },
    {
      fields: ['rating']
    },
    {
      fields: ['verified']
    },
    {
      fields: ['projectId']
    }
  ]
});

// Instance methods
Testimonial.prototype.markAsFeatured = function() {
  this.featured = true;
  return this.save();
};

Testimonial.prototype.unmarkAsFeatured = function() {
  this.featured = false;
  return this.save();
};

Testimonial.prototype.verify = function() {
  this.verified = true;
  return this.save();
};

Testimonial.prototype.getStarRating = function() {
  return '★'.repeat(this.rating) + '☆'.repeat(5 - this.rating);
};

module.exports = Testimonial;