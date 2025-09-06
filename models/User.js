const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(50),
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [2, 50]
    }
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
      notEmpty: true
    }
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      len: [6, 255]
    }
  },
  role: {
    type: DataTypes.ENUM('admin', 'user'),
    defaultValue: 'admin',
    allowNull: false
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    allowNull: false
  },
  lastLogin: {
    type: DataTypes.DATE,
    allowNull: true
  },
  avatar: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  bio: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  location: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  website: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  linkedin: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  twitter: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  github: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  theme: {
    type: DataTypes.ENUM('light', 'dark'),
    defaultValue: 'light',
    allowNull: false
  },
  emailNotifications: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    allowNull: false
  },
  pushNotifications: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    allowNull: false
  }
}, {
  tableName: 'users',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['email']
    }
  ]
});

// Instance methods
User.prototype.updateLastLogin = function() {
  this.lastLogin = new Date();
  return this.save();
};

User.prototype.isAdmin = function() {
  return this.role === 'admin';
};

User.prototype.getSafeData = function() {
  const userData = this.toJSON();
  delete userData.password;
  return userData;
};

module.exports = User;