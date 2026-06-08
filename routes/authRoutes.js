import express from 'express';
import { 
  registerUser, 
  loginUser, 
  bookmarkJob, 
  unbookmarkJob, 
  getAllUsers 
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Register and Login
router.post('/register', registerUser);
router.post('/login', loginUser);

// Saved Bookmarks toggles (extra professional feature)
router.post('/bookmark/:jobId', protect, bookmarkJob);
router.delete('/bookmark/:jobId', protect, unbookmarkJob);

// Admin listing shortcut
router.get('/users', protect, getAllUsers);

export default router;
