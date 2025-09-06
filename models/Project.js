const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Project title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Project description is required'],
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  category: {
    type: String,
    required: true,
    enum: ['mobile', 'web', 'both', 'consultation']
  },
  type: {
    type: String,
    required: true,
    enum: ['ios', 'android', 'web', 'pwa', 'cross-platform']
  },
  techStack: [{
    type: String,
    required: true
  }],
  images: [{
    url: String,
    alt: String,
    isMain: { type: Boolean, default: false }
  }],
  links: {
    liveDemo: String,
    playStore: String,
    appStore: String,
    github: String,
    figma: String
  },
  client: {
    name: String,
    company: String,
    industry: String
  },
  status: {
    type: String,
    enum: ['planning', 'development', 'testing', 'completed', 'maintenance'],
    default: 'planning'
  },
  featured: {
    type: Boolean,
    default: false
  },
  startDate: Date,
  endDate: Date,
  budget: {
    type: String,
    enum: ['under-10k', '10k-50k', '50k-100k', '100k-plus', 'confidential']
  },
  results: {
    description: String,
    metrics: [{
      label: String,
      value: String,
      improvement: String
    }]
  },
  testimonial: {
    text: String,
    client: String,
    position: String,
    company: String
  },
  tags: [String],
  isPublic: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for search functionality
projectSchema.index({ 
  title: 'text', 
  description: 'text', 
  'client.name': 'text',
  tags: 'text'
});

// Virtual for project duration
projectSchema.virtual('duration').get(function() {
  if (this.startDate && this.endDate) {
    const diffTime = Math.abs(this.endDate - this.startDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }
  return null;
});

module.exports = mongoose.model('Project', projectSchema);
