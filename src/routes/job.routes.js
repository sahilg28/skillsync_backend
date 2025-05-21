const express = require('express');
const Job = require('../models/job.model');
const User = require('../models/user.model');
const auth = require('../middleware/auth');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const router = express.Router();

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Get all jobs
router.get('/', async (req, res) => {
  try {
    const jobs = await Job.find({ isActive: true }).sort({ createdAt: -1 });
    res.json({ success: true, jobs });
  } catch (error) {
    console.error('Error fetching jobs:', error);
    res.status(500).json({ success: false, message: 'Error fetching jobs' });
  }
});

// Get job by ID
router.get('/:id', async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }
    res.json({ success: true, job });
  } catch (error) {
    console.error('Error fetching job:', error);
    res.status(500).json({ success: false, message: 'Error fetching job' });
  }
});

// Create job (admin only)
router.post('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const job = new Job({
      ...req.body,
      postedBy: req.user._id,
      isActive: true
    });

    await job.save();
    res.status(201).json({ success: true, job });
  } catch (error) {
    console.error('Error creating job:', error);
    res.status(500).json({ success: false, message: 'Error creating job' });
  }
});

// Update job (admin only)
router.put('/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const job = await Job.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    res.json({ success: true, job });
  } catch (error) {
    console.error('Error updating job:', error);
    res.status(500).json({ success: false, message: 'Error updating job' });
  }
});

// Delete job (admin only)
router.delete('/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const job = await Job.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    res.json({ success: true, message: 'Job deleted successfully' });
  } catch (error) {
    console.error('Error deleting job:', error);
    res.status(500).json({ success: false, message: 'Error deleting job' });
  }
});

// Get job matches using AI
router.post('/matches', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user || !user.profile) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please complete your profile first' 
      });
    }

    const jobs = await Job.find({ isActive: true });
    if (!jobs.length) {
      return res.status(404).json({ 
        success: false, 
        message: 'No jobs available' 
      });
    }

    // Prepare the prompt for Gemini
    const prompt = `Given the following user profile and job listings, find the top 3 most suitable job matches based on skills match, experience level, location preference, and job type preference.

User Profile:
- Skills: ${user.profile.skills.join(', ')}
- Years of Experience: ${user.profile.yearsOfExperience}
- Preferred Job Type: ${user.profile.preferredJobType}
- Location: ${user.profile.location}

Available Jobs:
${jobs.map(job => `
Job Title: ${job.title}
Company: ${job.company}
Location: ${job.location}
Type: ${job.type}
Required Skills: ${job.skills.join(', ')}
Description: ${job.description}
`).join('\n')}

Please analyze the matches based on:
1. Skills match (highest priority)
2. Job type preference match
3. Location compatibility
4. Experience level suitability

Return only the job titles of the top 3 most suitable matches, separated by commas.`;

    // Get model and generate content
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const matchedJobTitles = response.text()
      .split(',')
      .map(title => title.trim());

    // Get the matched jobs and sort them by match quality
    const matchedJobs = jobs.filter(job => 
      matchedJobTitles.includes(job.title)
    ).sort((a, b) => {
      // Sort by number of matching skills
      const aSkillMatches = a.skills.filter(skill => 
        user.profile.skills.includes(skill)
      ).length;
      const bSkillMatches = b.skills.filter(skill => 
        user.profile.skills.includes(skill)
      ).length;
      return bSkillMatches - aSkillMatches;
    });

    res.json({ success: true, matches: matchedJobs });
  } catch (error) {
    console.error('Error finding job matches:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error finding job matches',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router; 