const mongoose = require('mongoose');

const testimonialSchema = new mongoose.Schema({
  clientName: {
    type: String,
    required: [true, 'Client name is required'],
    trim: true,
    maxlength: [50, 'Client name cannot exceed 50 characters']
  },
  position: {
    type: String,
    required: [true, 'Client position is required'],
    trim: true,
    maxlength: [100, 'Position cannot exceed 100 characters']
  },
  company: {
    type: String,
    required: [true, 'Company name is required'],
    trim: true,
    maxlength: [100, 'Company name cannot exceed 100 characters']
  },
  project: {
    type: String,
    required: [true, 'Project name is required'],
    trim: true,
    maxlength: [100, 'Project name cannot exceed 100 characters']
  },
  testimonial: {
    type: String,
    required: [true, 'Testimonial text is required'],
    maxlength: [500, 'Testimonial cannot exceed 500 characters']
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    required: [true, 'Rating is required']
  },
  avatar: {
    type: String,
    default: null
  },
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project'
  },
  featured: {
    type: Boolean,
    default: false
  },
  verified: {
    type: Boolean,
    default: false
  },
  industry: {
    type: String,
    trim: true,
    maxlength: [50, 'Industry cannot exceed 50 characters']
  },
  results: [{
    metric: String,
    value: String,
    improvement: String
  }],
  isPublic: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for featured testimonials
testimonialSchema.index({ featured: 1, verified: 1, isPublic: 1 });

module.exports = mongoose.model('Testimonial', testimonialSchema);
