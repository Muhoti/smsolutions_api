const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  phone: {
    type: String,
    trim: true,
    maxlength: [20, 'Phone number cannot exceed 20 characters']
  },
  company: {
    type: String,
    trim: true,
    maxlength: [100, 'Company name cannot exceed 100 characters']
  },
  projectType: {
    type: String,
    required: [true, 'Project type is required'],
    enum: ['mobile', 'web', 'both', 'consultation', 'other']
  },
  budget: {
    type: String,
    enum: ['under-10k', '10k-50k', '50k-100k', '100k-plus', 'flexible', 'confidential']
  },
  timeline: {
    type: String,
    enum: ['asap', '1-month', '2-3-months', '3-6-months', '6-months-plus', 'flexible']
  },
  message: {
    type: String,
    required: [true, 'Message is required'],
    maxlength: [1000, 'Message cannot exceed 1000 characters']
  },
  status: {
    type: String,
    enum: ['new', 'contacted', 'in-progress', 'quoted', 'closed'],
    default: 'new'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  source: {
    type: String,
    enum: ['website', 'referral', 'social', 'email', 'phone', 'other'],
    default: 'website'
  },
  notes: [{
    text: String,
    addedBy: String,
    addedAt: { type: Date, default: Date.now }
  }],
  followUpDate: Date,
  assignedTo: {
    type: String,
    default: 'Strong Muhoti'
  }
}, {
  timestamps: true
});

// Index for filtering and searching
contactSchema.index({ status: 1, priority: 1, createdAt: -1 });
contactSchema.index({ projectType: 1, budget: 1 });

module.exports = mongoose.model('Contact', contactSchema);
