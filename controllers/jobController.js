import Job from '../models/Job.js';
import Application from '../models/Application.js';
import User from '../models/User.js';

// @desc    Get all job listings with filters & searches
// @route   GET /api/jobs
// @access  Public
export const getAllJobs = async (req, res) => {
  try {
    const { search, category, experience, jobType, createdBy } = req.query;
    let query = {};

    // 1. Recruiter ID matching
    if (createdBy) {
      query.createdBy = createdBy;
    }

    // 2. Live Search (Title, Company, Location)
    if (search) {
      query.$or = [
        { title: { $regex: search } },
        { company: { $regex: search } },
        { location: { $regex: search } }
      ];
    }

    // 3. Exact Filters
    if (category && category !== 'All') {
      query.category = category;
    }
    if (experience && experience !== 'All') {
      query.experience = experience;
    }
    if (jobType && jobType !== 'All') {
      query.jobType = jobType;
    }

    const jobs = await Job.find(query);
    return res.json(jobs);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error retrieving jobs' });
  }
};

// @desc    Get single job by ID
// @route   GET /api/jobs/:id
// @access  Public
export const getJobById = async (req, res) => {
  const { id } = req.params;

  try {
    const job = await Job.findById(id);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    return res.json(job);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error retrieving job details' });
  }
};

// @desc    Create new job listing (Recruiter only)
// @route   POST /api/jobs
// @access  Private/Recruiter
export const createJob = async (req, res) => {
  const { title, company, description, location, salary, experience, jobType, category } = req.body;

  try {
    if (!title || !company || !location || !salary || !description) {
      return res.status(400).json({ message: 'Please provide all required job fields' });
    }

    const newJob = await Job.create({
      title,
      company,
      description,
      location,
      salary,
      createdBy: req.user._id, // Tied to the logged-in Recruiter
      experience: experience || '1-2 Years',
      jobType: jobType || 'Remote',
      category: category || 'Other'
    });

    return res.status(201).json(newJob);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error creating job listing' });
  }
};

// @desc    Update an existing job listing (Recruiter only)
// @route   PUT /api/jobs/:id
// @access  Private/Recruiter
export const updateJob = async (req, res) => {
  const { id } = req.params;

  try {
    const job = await Job.findById(id);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Secure that only the owner can modify
    if (job.createdBy !== req.user._id && req.user.role !== 'recruiter') {
      return res.status(453).json({ message: 'Not authorized to edit this job' });
    }

    const updatedJob = await Job.findByIdAndUpdate(id, req.body, { new: true });
    return res.json(updatedJob);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error updating job listing' });
  }
};

// @desc    Delete a job listing & associated applications (Recruiter only)
// @route   DELETE /api/jobs/:id
// @access  Private/Recruiter
export const deleteJob = async (req, res) => {
  const { id } = req.params;

  try {
    const job = await Job.findById(id);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Check ownership
    if (job.createdBy !== req.user._id && req.user.role !== 'recruiter') {
      return res.status(403).json({ message: 'Not authorized to delete this job' });
    }

    await Job.findByIdAndDelete(id);
    
    // Cascade delete: remove all applications for this job
    await Application.deleteMany({ jobId: id });

    return res.json({ message: 'Job listing and related applications deleted successfully' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error deleting job listing' });
  }
};

// @desc    Get recruiter metrics statistics
// @route   GET /api/jobs/admin/stats
// @access  Private/Recruiter
export const getAdminStats = async (req, res) => {
  try {
    const totalJobs = await Job.countDocuments({ createdBy: req.user._id });
    
    // Find applications where jobId matches jobs created by this recruiter
    const recruiterJobs = await Job.find({ createdBy: req.user._id });
    const jobIds = recruiterJobs.map(j => j._id);
    
    let totalApplicants = 0;
    if (process.env.USE_LOCAL_DB === 'true') {
      const allApps = await Application.find();
      totalApplicants = allApps.filter(app => jobIds.includes(app.jobId)).length;
    } else {
      totalApplicants = await Application.countDocuments({ jobId: { $in: jobIds } });
    }

    const activeUsers = await User.countDocuments({ role: 'seeker' });

    return res.json({
      totalJobs,
      totalApplicants,
      activeUsers
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error compiling system stats' });
  }
};
