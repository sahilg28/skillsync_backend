const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  company: {
    type: String,
    required: true,
    trim: true
  },
  location: {
    type: String,
    required: true,
    trim: true
  },
  skillsRequired: [{
    type: String,
    trim: true
  }],
  description: {
    type: String,
    required: true
  },
  jobType: {
    type: String,
    enum: ['remote', 'onsite', 'hybrid'],
    required: true
  },
  salary: {
    min: Number,
    max: Number,
    currency: {
      type: String,
      default: 'USD'
    }
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for better search performance
jobSchema.index({ title: 'text', company: 'text', skillsRequired: 'text' });

const Job = mongoose.model('Job', jobSchema);

module.exports = Job; 