import express from 'express';
import { 
  applyToJob, 
  getJobApplicants,
  getUserApplications
} from '../controllers/applicationController.js';
import { protect } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

// POST /api/apply (supports Multer file uploads for resume uploading!)
router.post('/apply', protect, upload.single('resume'), applyToJob);

// GET /api/applicants/:jobId (View applicants for specific job)
router.get('/applicants/:jobId', protect, getJobApplicants);

// GET /api/applications/my-applications (extra tracker for seeker dashboard)
router.get('/applications/my-applications', protect, getUserApplications);

export default router;
