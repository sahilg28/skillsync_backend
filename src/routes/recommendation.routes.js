const express = require('express');
const { body, validationResult } = require('express-validator');
const { auth } = require('../middleware/auth.middleware');
const UserProfile = require('../models/userProfile.model');
const Job = require('../models/job.model');
const OpenAI = require('openai');

const router = express.Router();

// Test route
router.get('/', (req, res) => {
  res.json({ status: 'Recommendation routes working' });
});

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Get job recommendations
router.post('/', auth, async (req, res) => {
  try {
    // Get user profile
    const profile = await UserProfile.findOne({ user: req.user._id });
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found'
      });
    }

    // Get all active jobs
    const jobs = await Job.find({ isActive: true });

    // Prepare prompt for OpenAI
    const prompt = `
      Given the following user profile and job listings, recommend the top 3 most relevant jobs.
      Consider the user's skills, experience, location, and preferred job type.
      
      User Profile:
      - Location: ${profile.location}
      - Years of Experience: ${profile.yearsOfExperience}
      - Skills: ${profile.skills.join(', ')}
      - Preferred Job Type: ${profile.preferredJobType}
      
      Available Jobs:
      ${jobs.map(job => `
        Title: ${job.title}
        Company: ${job.company}
        Location: ${job.location}
        Required Skills: ${job.skillsRequired.join(', ')}
        Job Type: ${job.jobType}
        Description: ${job.description}
      `).join('\n')}
      
      Please analyze the above information and return the top 3 most relevant jobs in JSON format:
      {
        "recommendations": [
          {
            "jobId": "job_id",
            "matchScore": "percentage",
            "reasoning": "explanation"
          }
        ]
      }
    `;

    // Get recommendations from OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a job matching expert. Analyze user profiles and job listings to find the best matches."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1000
    });

    // Parse recommendations
    const recommendations = JSON.parse(completion.choices[0].message.content);

    // Get full job details for recommendations
    const recommendedJobs = await Promise.all(
      recommendations.recommendations.map(async (rec) => {
        const job = await Job.findById(rec.jobId);
        return {
          ...job.toObject(),
          matchScore: rec.matchScore,
          reasoning: rec.reasoning
        };
      })
    );

    res.json({
      success: true,
      data: recommendedJobs
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error getting recommendations',
      error: error.message
    });
  }
});

module.exports = router; 