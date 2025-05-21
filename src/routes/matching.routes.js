const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const UserProfile = require('../models/userProfile.model');
const Job = require('../models/job.model');
const auth = require('../middleware/auth');

const router = express.Router();

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Get job matches based on user profile
router.post('/find-matches', auth, async (req, res) => {
  try {
    // Get user profile
    const userProfile = await UserProfile.findOne({ user: req.user.userId });
    if (!userProfile) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found'
      });
    }

    // Get all active jobs
    const jobs = await Job.find({ isActive: true });

    // If no jobs found, return empty array
    if (jobs.length === 0) {
      return res.json({
        success: true,
        data: {
          matches: []
        }
      });
    }

    // Prepare prompt for Gemini
    const prompt = `Given the following user profile and job listings, find the 3 best matching jobs.
Consider the user's skills, experience, and job type preferences.

User Profile:
- Skills: ${userProfile.skills.join(', ')}
- Years of Experience: ${userProfile.yearsOfExperience}
- Preferred Job Type: ${userProfile.preferredJobType}
- Location: ${userProfile.location}

Job Listings:
${jobs.map(job => `
  Title: ${job.title}
  Company: ${job.company}
  Location: ${job.location}
  Required Skills: ${job.skills.join(', ')}
  Job Type: ${job.type}
`).join('\n')}

Return only the job titles of the 3 best matches, separated by commas.`;

    // Call Gemini API
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const matchedJobTitles = response.text()
      .trim()
      .split(',')
      .map(title => title.trim());

    // Get full job details for matched jobs
    const matchedJobs = jobs.filter(job => 
      matchedJobTitles.includes(job.title)
    ).slice(0, 3);

    // Sort matches by skill match count
    matchedJobs.sort((a, b) => {
      const aSkillMatches = a.skills.filter(skill => 
        userProfile.skills.includes(skill)
      ).length;
      const bSkillMatches = b.skills.filter(skill => 
        userProfile.skills.includes(skill)
      ).length;
      return bSkillMatches - aSkillMatches;
    });

    res.json({
      success: true,
      data: {
        matches: matchedJobs
      }
    });
  } catch (error) {
    console.error('Error finding job matches:', error);
    res.status(500).json({
      success: false,
      message: 'Error finding job matches',
      error: error.message
    });
  }
});

module.exports = router; 