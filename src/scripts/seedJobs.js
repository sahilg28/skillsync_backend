require('dotenv').config();
const mongoose = require('mongoose');
const Job = require('../models/job.model');
const User = require('../models/user.model');

const jobs = [
  {
    title: 'Senior Frontend Developer',
    company: 'TechCorp',
    location: 'San Francisco, CA',
    type: 'remote',
    skills: ['React', 'TypeScript', 'JavaScript', 'HTML', 'CSS'],
    description: 'Looking for an experienced frontend developer to join our team.',
    salary: '$120k - $150k'
  },
  {
    title: 'Full Stack Developer',
    company: 'StartupX',
    location: 'New York, NY',
    type: 'hybrid',
    skills: ['Node.js', 'React', 'MongoDB', 'Express', 'JavaScript'],
    description: 'Join our fast-growing startup as a full stack developer.',
    salary: '$100k - $130k'
  },
  {
    title: 'Backend Developer',
    company: 'Enterprise Solutions',
    location: 'Austin, TX',
    type: 'onsite',
    skills: ['Python', 'Django', 'PostgreSQL', 'AWS', 'Docker'],
    description: 'Backend developer position with focus on scalable applications.',
    salary: '$110k - $140k'
  },
  {
    title: 'DevOps Engineer',
    company: 'CloudTech',
    location: 'Seattle, WA',
    type: 'remote',
    skills: ['Kubernetes', 'Docker', 'AWS', 'CI/CD', 'Linux'],
    description: 'DevOps engineer to manage our cloud infrastructure.',
    salary: '$130k - $160k'
  },
  {
    title: 'UI/UX Designer',
    company: 'DesignHub',
    location: 'Los Angeles, CA',
    type: 'hybrid',
    skills: ['Figma', 'UI/UX', 'Adobe XD', 'Prototyping', 'User Research'],
    description: 'Creative UI/UX designer to join our design team.',
    salary: '$90k - $120k'
  }
];

const seedJobs = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Create admin user if it doesn't exist
    let adminUser = await User.findOne({ email: 'admin@skillsync.com' });
    if (!adminUser) {
      adminUser = await User.create({
        name: 'Admin User',
        email: 'admin@skillsync.com',
        password: 'admin123',
        role: 'admin',
        profile: {
          location: 'San Francisco, CA',
          yearsOfExperience: 10,
          skills: ['Management', 'Leadership'],
          preferredJobType: 'onsite'
        }
      });
      console.log('Created admin user');
    }

    // Clear existing jobs
    await Job.deleteMany({});
    console.log('Cleared existing jobs');

    // Add postedBy field to all jobs
    const jobsWithAdmin = jobs.map(job => ({
      ...job,
      postedBy: adminUser._id
    }));

    // Insert new jobs
    const createdJobs = await Job.insertMany(jobsWithAdmin);
    console.log(`Created ${createdJobs.length} jobs`);

    process.exit(0);
  } catch (error) {
    console.error('Error seeding jobs:', error);
    process.exit(1);
  }
};

seedJobs(); 