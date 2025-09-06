/**
 * Database Models and Associations
 * 
 * This file:
 * 1. Imports all Sequelize models
 * 2. Defines relationships between models
 * 3. Exports everything for use in controllers
 */

const { sequelize } = require('../config/database');

// Import all models
const User = require('./User');
const Project = require('./Project');
const Contact = require('./Contact');
const Testimonial = require('./Testimonial');

// Define associations (relationships)
// User can have many contacts (assigned to)
Contact.belongsTo(User, { 
  foreignKey: 'assignedTo', 
  as: 'assignedUser' 
});
User.hasMany(Contact, { 
  foreignKey: 'assignedTo', 
  as: 'assignedContacts' 
});

// Project can have many testimonials
Testimonial.belongsTo(Project, { 
  foreignKey: 'projectId', 
  as: 'project' 
});
Project.hasMany(Testimonial, { 
  foreignKey: 'projectId', 
  as: 'testimonials' 
});

module.exports = {
  sequelize,
  User,
  Project,
  Contact,
  Testimonial
};
