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
  type: {
    type: String,
    enum: ['remote', 'onsite', 'hybrid'],
    required: true
  },
  skills: [{
    type: String,
    trim: true
  }],
  description: {
    type: String,
    required: true
  },
  salary: {
    type: String,
    trim: true
  },
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Create text indexes individually for better control
jobSchema.index({ title: 'text' });
jobSchema.index({ company: 'text' });
jobSchema.index({ skills: 'text' });

const Job = mongoose.model('Job', jobSchema);

module.exports = Job; 