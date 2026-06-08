import express from 'express';
import { 
  getAllJobs, 
  getJobById, 
  createJob, 
  updateJob, 
  deleteJob, 
  getAdminStats 
} from '../controllers/jobController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// GET all / POST new
router.route('/')
  .get(getAllJobs)
  .post(protect, createJob);

// GET details / PUT update / DELETE delete
router.route('/:id')
  .get(getJobById)
  .put(protect, updateJob)
  .delete(protect, deleteJob);

// Quick analytics stats
router.get('/admin/stats', protect, getAdminStats);

export default router;
