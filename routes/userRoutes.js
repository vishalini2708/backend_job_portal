import express from 'express';
import { getUserProfile, updateUserProfile } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

// GET /api/user/profile
// PUT /api/user/profile (supports Multer file uploads for profile resume updating!)
router.route('/profile')
  .get(protect, getUserProfile)
  .put(protect, upload.single('resume'), updateUserProfile);

export default router;
