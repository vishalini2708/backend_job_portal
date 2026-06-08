import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Helper to sign JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'super_secret_hirewave_jwt_key_12345', {
    expiresIn: '30d',
  });
};

// @desc    Register new user (seeker or recruiter)
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    // Basic validation
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user with seeker/recruiter roles
    const userRole = role === 'recruiter' ? 'recruiter' : 'seeker';
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: userRole,
    });

    if (user) {
      return res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        resume: user.resume || '',
        appliedJobs: user.appliedJobs || [],
        savedJobs: user.savedJobs || [],
        token: generateToken(user._id),
      });
    } else {
      return res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error during registration' });
  }
};

// @desc    Authenticate a user & get token
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Basic validation
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    return res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      resume: user.resume || '',
      appliedJobs: user.appliedJobs || [],
      savedJobs: user.savedJobs || [],
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error during login' });
  }
};

// @desc    Get user profile
// @route   GET /api/user/profile
// @access  Private
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (user) {
      return res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        resume: user.resume || '',
        appliedJobs: user.appliedJobs || [],
        savedJobs: user.savedJobs || [],
      });
    } else {
      return res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error fetching profile' });
  }
};

// @desc    Update user profile
// @route   PUT /api/user/profile
// @access  Private
export const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update allowable fields
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    
    // Check if resume is being uploaded
    if (req.file) {
      user.resume = req.file.filename;
    } else if (req.body.resume !== undefined) {
      user.resume = req.body.resume;
    }

    await user.save();

    return res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      resume: user.resume || '',
      appliedJobs: user.appliedJobs || [],
      savedJobs: user.savedJobs || [],
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error updating profile' });
  }
};

// @desc    Bookmark/Save a job
// @route   POST /api/auth/bookmark/:jobId
// @access  Private
export const bookmarkJob = async (req, res) => {
  const { jobId } = req.params;

  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await User.findByIdAndUpdate(req.user._id, {
      $addToSet: { savedJobs: jobId }
    });

    const updatedUser = await User.findOne({ email: req.user.email });
    return res.json({
      message: 'Job bookmarked successfully',
      savedJobs: updatedUser.savedJobs || []
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error bookmarking job' });
  }
};

// @desc    Remove job bookmark
// @route   DELETE /api/auth/bookmark/:jobId
// @access  Private
export const unbookmarkJob = async (req, res) => {
  const { jobId } = req.params;

  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await User.findByIdAndUpdate(req.user._id, {
      $pull: { savedJobs: jobId }
    });

    const updatedUser = await User.findOne({ email: req.user.email });
    return res.json({
      message: 'Bookmark removed successfully',
      savedJobs: updatedUser.savedJobs || []
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error removing bookmark' });
  }
};

// @desc    Get all users list (Admin/Recruiter only)
// @route   GET /api/auth/users
// @access  Private/Recruiter
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    const safeUsers = users.map(({ password, ...rest }) => rest);
    return res.json(safeUsers);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error fetching users list' });
  }
};
