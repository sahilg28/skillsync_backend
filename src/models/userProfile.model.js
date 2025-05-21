const mongoose = require('mongoose');

const userProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  location: {
    type: String,
    required: true,
    trim: true
  },
  yearsOfExperience: {
    type: Number,
    required: true,
    min: 0
  },
  skills: [{
    type: String,
    trim: true
  }],
  preferredJobType: {
    type: String,
    enum: ['remote', 'onsite', 'any'],
    default: 'any'
  }
}, {
  timestamps: true
});

// Ensure one profile per user
userProfileSchema.index({ user: 1 }, { unique: true });

const UserProfile = mongoose.model('UserProfile', userProfileSchema);

module.exports = UserProfile; 