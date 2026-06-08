import Application from '../models/Application.js';
import Job from '../models/Job.js';
import User from '../models/User.js';

// @desc    Apply for a job listing
// @route   POST /api/apply
// @access  Private/Seeker
export const applyToJob = async (req, res) => {
  // Allow jobId in body or query
  const jobId = req.body.jobId || req.query.jobId;
  const { name, email } = req.body;

  try {
    // 1. Validations
    if (!jobId) {
      return res.status(400).json({ message: 'Job ID parameter (jobId) is required.' });
    }

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job listing not found.' });
    }

    // Check if seeker already applied
    const existingApps = await Application.find({ jobId, userId: req.user._id });
    if (existingApps.length > 0) {
      return res.status(400).json({ message: 'You have already applied for this job vacancy!' });
    }

    // 2. Resolve resume file
    let resumeFilename = '';
    
    if (req.file) {
      resumeFilename = req.file.filename;
    } else if (req.user.resume) {
      // Gracefully fall back to the resume saved in the Seeker's Profile!
      resumeFilename = req.user.resume;
    } else {
      return res.status(400).json({ message: 'Please upload your resume (PDF/DOCX).' });
    }

    // 3. Create application record
    const application = await Application.create({
      userId: req.user._id,
      jobId,
      resume: resumeFilename,
      status: 'applied',
      name: name || req.user.name,
      email: email || req.user.email
    });

    // 4. Update user's appliedJobs list
    await User.findByIdAndUpdate(req.user._id, {
      $addToSet: { appliedJobs: jobId }
    });

    // 5. Update job's applicants list
    await Job.findByIdAndUpdate(jobId, {
      $push: { applicants: application._id }
    });

    return res.status(201).json({
      message: 'Application submitted successfully!',
      application
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error while submitting application.' });
  }
};

// @desc    Get applicants for a specific job (Recruiter only)
// @route   GET /api/applicants/:jobId
// @access  Private/Recruiter
export const getJobApplicants = async (req, res) => {
  const { jobId } = req.params;

  try {
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found.' });
    }

    // Secure checking that this recruiter created the job
    if (job.createdBy !== req.user._id) {
      return res.status(403).json({ message: 'Not authorized to view applicants for this job.' });
    }

    const apps = await Application.find({ jobId });
    return res.json(apps);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error retrieving applicants.' });
  }
};

// @desc    Get current user's job applications history (for Seeker dashboard)
// @route   GET /api/applications/my-applications
// @access  Private
export const getUserApplications = async (req, res) => {
  try {
    const apps = await Application.find({ userId: req.user._id });
    const allJobs = await Job.find();

    const enrichedApps = apps.map(app => {
      const jobDetails = allJobs.find(j => j._id === app.jobId) || {
        title: 'Unknown Title',
        company: 'Unknown Company',
        location: 'Unknown Location',
        salary: 'N/A'
      };
      return {
        ...app,
        jobDetails
      };
    });

    return res.json(enrichedApps);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error retrieving your applications.' });
  }
};
