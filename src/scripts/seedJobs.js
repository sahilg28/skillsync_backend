require('dotenv').config();
const mongoose = require('mongoose');
const Job = require('../models/job.model');

const jobs = [
  {
    title: 'Senior Frontend Developer',
    company: 'TechCorp',
    location: 'San Francisco, CA',
    skillsRequired: ['React', 'TypeScript', 'Node.js', 'AWS'],
    description: 'Looking for an experienced frontend developer to join our team...',
    jobType: 'remote',
    salary: {
      min: 120000,
      max: 160000,
      currency: 'USD'
    }
  },
  {
    title: 'Full Stack Developer',
    company: 'InnovateTech',
    location: 'New York, NY',
    skillsRequired: ['JavaScript', 'Python', 'MongoDB', 'React'],
    description: 'Join our growing team as a full stack developer...',
    jobType: 'hybrid',
    salary: {
      min: 100000,
      max: 140000,
      currency: 'USD'
    }
  },
  {
    title: 'Backend Engineer',
    company: 'DataSystems',
    location: 'Austin, TX',
    skillsRequired: ['Node.js', 'MongoDB', 'AWS', 'Docker'],
    description: 'We are seeking a backend engineer to build scalable systems...',
    jobType: 'onsite',
    salary: {
      min: 110000,
      max: 150000,
      currency: 'USD'
    }
  },
  {
    title: 'DevOps Engineer',
    company: 'CloudTech',
    location: 'Seattle, WA',
    skillsRequired: ['AWS', 'Docker', 'Kubernetes', 'CI/CD'],
    description: 'Join our DevOps team to help build and maintain our infrastructure...',
    jobType: 'remote',
    salary: {
      min: 130000,
      max: 170000,
      currency: 'USD'
    }
  },
  {
    title: 'Mobile Developer',
    company: 'AppWorks',
    location: 'Boston, MA',
    skillsRequired: ['React Native', 'JavaScript', 'iOS', 'Android'],
    description: 'Looking for a mobile developer to build cross-platform apps...',
    jobType: 'hybrid',
    salary: {
      min: 90000,
      max: 130000,
      currency: 'USD'
    }
  }
];

const seedJobs = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Clear existing jobs
    await Job.deleteMany({});
    console.log('Cleared existing jobs');

    // Insert new jobs
    await Job.insertMany(jobs);
    console.log('Successfully seeded jobs');

    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error seeding jobs:', error);
    process.exit(1);
  }
};

// Run the seeding function
seedJobs(); 