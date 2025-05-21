const express = require('express');
const { body, validationResult } = require('express-validator');
const { auth } = require('../middleware/auth.middleware');
const UserProfile = require('../models/userProfile.model');

const router = express.Router();

// Validation middleware
const validateProfile = [
  body('location').trim().notEmpty().withMessage('Location is required'),
  body('yearsOfExperience')
    .isNumeric()
    .withMessage('Years of experience must be a number')
    .isFloat({ min: 0 })
    .withMessage('Years of experience cannot be negative'),
  body('skills')
    .isArray()
    .withMessage('Skills must be an array')
    .notEmpty()
    .withMessage('At least one skill is required'),
  body('preferredJobType')
    .isIn(['remote', 'onsite', 'any'])
    .withMessage('Invalid job type')
];

// Get user profile
router.get('/', auth, async (req, res) => {
  try {
    const profile = await UserProfile.findOne({ user: req.user._id })
      .populate('user', 'name email');

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found'
      });
    }

    res.json({
      success: true,
      data: profile
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching profile',
      error: error.message
    });
  }
});

// Create or update user profile
router.post('/', auth, validateProfile, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { location, yearsOfExperience, skills, preferredJobType } = req.body;

    // Find existing profile or create new one
    const profile = await UserProfile.findOneAndUpdate(
      { user: req.user._id },
      {
        location,
        yearsOfExperience,
        skills,
        preferredJobType
      },
      {
        new: true,
        upsert: true,
        runValidators: true
      }
    );

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: profile
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating profile',
      error: error.message
    });
  }
});

module.exports = router; 